"""PDF parser with sub-part extraction, mark allocation parsing, and structured output."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import pdfplumber
import structlog

from pedsiq.models import (
    ExamMetadata,
    MarkAllocation,
    ParsedQuestion,
    SectionHeader,
    SubPart,
)

logger = structlog.get_logger()

# ---------------------------------------------------------------------------
# Section header patterns
# ---------------------------------------------------------------------------

SECTION_PATTERNS = [
    ("MCQs", re.compile(r"Multiple\s*Choice\s*Questions", re.IGNORECASE)),
    ("Long Essays", re.compile(r"Long\s*Essays?", re.IGNORECASE)),
    ("Short Essays", re.compile(r"Short\s*essays?", re.IGNORECASE)),
    ("Short Answers", re.compile(r"Short\s*answers?", re.IGNORECASE)),
    ("Draw and Label", re.compile(r"Draw\s*(?:and\s*)?label", re.IGNORECASE)),
    ("Precise Answers", re.compile(r"Precise\s*answers?", re.IGNORECASE)),
    ("Essay", re.compile(r"Essay\b(?!\s*questions)", re.IGNORECASE)),
    ("Short Notes", re.compile(r"Short\s*notes?", re.IGNORECASE)),
    ("Answer Briefly", re.compile(r"Answer\s*briefly", re.IGNORECASE)),
    ("One Word Answers", re.compile(r"One\s*word\s*answers?", re.IGNORECASE)),
]

# ---------------------------------------------------------------------------
# Mark allocation regex
# ---------------------------------------------------------------------------

MARK_ALLOCATION_RE = re.compile(
    r"\(\s*(\d+(?:\s*\+\s*\d+)*)\s*(?:=\s*(\d+))?\s*\)"
)

SUB_PART_RE = re.compile(
    r"\(([a-e])\)\s*(.*?)(?=\([a-e]\)|$)",
    re.DOTALL,
)


def _extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF preserving page order."""
    text_parts: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def _parse_metadata(text: str, filename: str) -> ExamMetadata:
    """Parse exam metadata from header text."""
    metadata = ExamMetadata(filename=filename)

    qp_match = re.search(r"Q\.P\.\s*Code:\s*(\d+)", text)
    if qp_match:
        metadata.qp_code = qp_match.group(1)

    date_patterns = [
        re.compile(r"(?:Examinations?[,:]?\s+)?([A-Za-z]+)\s+(\d{4})"),
        re.compile(r"(\d{4})\s+([A-Za-z]+)"),
    ]
    for pattern in date_patterns:
        match = pattern.search(text)
        if match:
            month_str, year_str = match.group(1), match.group(2)
            if year_str.isdigit() and len(year_str) == 4:
                metadata.year = int(year_str)
                metadata.month = month_str
                break
            elif month_str.isdigit() and len(month_str) == 4:
                metadata.year = int(month_str)
                metadata.month = year_str
                break

    scheme_match = re.search(r"(\d{4})\s*Scheme", text)
    if scheme_match:
        metadata.scheme = scheme_match.group(1)
    elif metadata.qp_code == "320001":
        metadata.scheme = "2019"
    else:
        metadata.scheme = "2010"

    marks_match = re.search(r"Total\s*Marks:\s*(\d+)", text)
    if marks_match:
        metadata.total_marks = float(marks_match.group(1))

    duration_match = re.search(r"Time:\s*(\d+)\s*Hours?", text)
    if duration_match:
        metadata.duration = int(duration_match.group(1))

    if "Regular" in text and "Supplementary" in text:
        metadata.exam_type = "Regular/Supplementary"
    elif "Regular" in text:
        metadata.exam_type = "Regular"
    elif "Supplementary" in text:
        metadata.exam_type = "Supplementary"

    return metadata


def _parse_marks_from_header(line: str) -> dict[str, Any] | None:
    """Parse mark allocation from a section header line.

    Supports patterns like:
      (4x3=12)  → 4 questions × 3 marks = 12 total
      (2x15=30) → 2 questions × 15 marks = 30 total
      (10)      → 1 question × 10 marks
      (2+4+4=10)→ sub-part marks
    """
    # Standard: (4x3=12) or (2x15=30)
    match = re.search(r"\((\d+)x([\d\.]+)(?:=([\d\.]+))?\)", line)
    if match:
        return {
            "num_questions": int(match.group(1)),
            "marks_each": float(match.group(2)),
            "total": float(match.group(3)) if match.group(3) else None,
        }

    # Single mark: (10)
    match = re.search(r"\((\d+)\)", line)
    if match:
        return {
            "num_questions": 1,
            "marks_each": float(match.group(1)),
            "total": float(match.group(1)),
        }

    return None


def _detect_section_headers(text: str) -> list[SectionHeader]:
    """Detect all section headers in the exam text."""
    headers: list[SectionHeader] = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        for section_name, pattern in SECTION_PATTERNS:
            if pattern.search(line):
                marks_info = _parse_marks_from_header(line)
                headers.append(
                    SectionHeader(
                        name=section_name,
                        raw_header=line,
                        num_questions=marks_info.get("num_questions") if marks_info else None,
                        marks_each=marks_info.get("marks_each") if marks_info else None,
                        total_marks=marks_info.get("total") if marks_info else None,
                    )
                )
                break
    return headers


def _split_into_sections(text: str) -> list[dict[str, Any]]:
    """Split text into sections by detecting headers line-by-line."""
    lines = text.split("\n")
    sections: list[dict[str, Any]] = []
    current_section: dict[str, Any] | None = None
    current_text: list[str] = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        header_found = False
        for section_name, pattern in SECTION_PATTERNS:
            if pattern.search(line):
                if current_section and current_text:
                    sections.append(
                        {
                            "name": current_section["name"],
                            "header": current_section["header"],
                            "marks_info": current_section["marks_info"],
                            "text": "\n".join(current_text),
                        }
                    )

                marks_info = _parse_marks_from_header(line)
                current_section = {
                    "name": section_name,
                    "header": line,
                    "marks_info": marks_info or {},
                }
                current_text = []
                header_found = True
                break

        if not header_found and current_section:
            current_text.append(line)

    if current_section and current_text:
        sections.append(
            {
                "name": current_section["name"],
                "header": current_section["header"],
                "marks_info": current_section["marks_info"],
                "text": "\n".join(current_text),
            }
        )

    return sections


def _parse_mark_allocation(text: str) -> tuple[str, list[MarkAllocation]]:
    """Parse mark allocation like (2+4+4=10) from question text.

    Returns (cleaned_text, allocations).
    """
    match = MARK_ALLOCATION_RE.search(text)
    if not match:
        return text, []

    allocation_str = match.group(1)
    total_str = match.group(2)

    parts = [p.strip() for p in allocation_str.split("+")]
    allocations: list[MarkAllocation] = []

    for part in parts:
        try:
            allocations.append(MarkAllocation(marks=float(part)))
        except ValueError:
            continue

    if total_str:
        # Validate total matches sum
        try:
            total = float(total_str)
            calc_total = sum(a.marks for a in allocations)
            if abs(total - calc_total) > 0.1:
                logger.warning(
                    "mark_allocation_mismatch",
                    expected=total,
                    calculated=calc_total,
                    raw=text[:80],
                )
        except ValueError:
            pass

    cleaned = text[: match.start()] + text[match.end() :]
    return cleaned.strip(), allocations


def _extract_sub_parts(text: str) -> tuple[str, list[SubPart]]:
    """Extract sub-parts (a), (b), (c) from question text.

    Returns (main_question_text, sub_parts).
    """
    matches = SUB_PART_RE.findall(text)
    if not matches:
        return text, []

    # Main text is everything before the first sub-part
    first_sub_start = text.find(f"({matches[0][0]})")
    main_text = text[:first_sub_start].strip() if first_sub_start > 0 else text

    sub_parts = [
        SubPart(label=label.strip(), text=text.strip(), marks=None)
        for label, text in matches
    ]

    return main_text, sub_parts


def _extract_questions_from_section(section: dict[str, Any]) -> list[ParsedQuestion]:
    """Extract individual questions from a section."""
    questions: list[ParsedQuestion] = []
    text = section["text"]
    section_name = section["name"]
    marks_each = section["marks_info"].get("marks_each", 1.0) if section.get("marks_info") else 1.0

    if section_name == "MCQs":
        # Roman numerals or lowercase letters
        for pattern in [
            re.compile(r"\n?([ivxlc]+)\.\s*(.*?)(?=\n[ivxlc]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)", re.DOTALL),
            re.compile(r"\n?([a-z]+)\.\s*(.*?)(?=\n[a-z]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)", re.DOTALL),
        ]:
            q_matches = pattern.findall("\n" + text)
            if q_matches:
                for q_num, q_text in q_matches:
                    q_text = q_text.strip().replace("\n", " ")
                    if len(q_text) > 10:
                        questions.append(
                            ParsedQuestion(
                                section=section_name,
                                question_number=q_num,
                                question_text=q_text,
                                marks_total=float(marks_each),
                                filename="",
                            )
                        )
                break

    elif section_name in [
        "Long Essays",
        "Short Essays",
        "Short Answers",
        "Essay",
        "Short Notes",
        "Answer Briefly",
        "Draw and Label",
        "Precise Answers",
        "One Word Answers",
    ]:
        pattern = re.compile(
            r"\n?\s*(\d+)\.\s*(.*?)(?=\n?\s*\d+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label|One\s*word\s*answers?)[:\s]|\*{3,}|$)",
            re.DOTALL,
        )
        matches = pattern.findall("\n" + text)

        for q_num, q_text in matches:
            q_text = q_text.strip().replace("\n", " ")
            if len(q_text) < 5:
                continue

            # Parse mark allocation
            cleaned_text, mark_allocs = _parse_mark_allocation(q_text)

            # Extract sub-parts
            main_text, sub_parts = _extract_sub_parts(cleaned_text)

            # If we have mark allocations and sub-parts, try to match them
            if mark_allocs and sub_parts and len(mark_allocs) == len(sub_parts):
                for sp, ma in zip(sub_parts, mark_allocs):
                    sp.marks = ma.marks

            total_marks = sum(m.marks for m in mark_allocs) if mark_allocs else float(marks_each)

            questions.append(
                ParsedQuestion(
                    section=section_name,
                    question_number=int(q_num),
                    question_text=main_text,
                    marks_total=total_marks,
                    marks_breakdown=mark_allocs,
                    sub_parts=sub_parts if sub_parts else None,
                    filename="",
                )
            )

    return questions


def parse_exam_paper(pdf_path: Path) -> tuple[ExamMetadata, list[ParsedQuestion]]:
    """Parse a single KUHS exam paper PDF.

    Returns (metadata, questions).
    """
    filename = pdf_path.name
    logger.info("parsing_pdf", filename=filename)

    text = _extract_text_from_pdf(pdf_path)
    metadata = _parse_metadata(text, filename)

    sections = _split_into_sections(text)
    all_questions: list[ParsedQuestion] = []

    for section in sections:
        section_questions = _extract_questions_from_section(section)
        for q in section_questions:
            q.exam_year = metadata.year
            q.exam_month = metadata.month
            q.scheme = metadata.scheme
            q.qp_code = metadata.qp_code
            q.total_marks = metadata.total_marks
            q.filename = filename
        all_questions.extend(section_questions)

    logger.info(
        "parsed_pdf_complete",
        filename=filename,
        questions=len(all_questions),
        sections=len(sections),
    )
    return metadata, all_questions
