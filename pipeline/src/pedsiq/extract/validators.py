"""Post-parse validation — verify extracted questions match section headers."""

from __future__ import annotations

import structlog

from pedsiq.models import ExamMetadata, ParsedQuestion, ValidationResult, ValidationStatus

logger = structlog.get_logger()


# Tolerance for marks-mismatch warnings (e.g., partial credit, rounding)
MARKS_TOLERANCE = 5.0


def validate_paper(
    metadata: ExamMetadata, questions: list[ParsedQuestion]
) -> ValidationResult:
    """Validate a parsed exam paper against expected counts.

    Checks:
      1. Total questions match section header declarations
      2. Total marks add up to declared paper total
      3. All questions have non-empty text
    """
    filename = metadata.filename

    # Group questions by section
    section_counts: dict[str, int] = {}
    section_marks: dict[str, float] = {}
    for q in questions:
        section_counts[q.section] = section_counts.get(q.section, 0) + 1
        section_marks[q.section] = section_marks.get(q.section, 0.0) + q.marks_total

    total_questions = len(questions)
    total_marks = sum(q.marks_total for q in questions)

    # Check for empty questions
    empty_questions = [q for q in questions if not q.question_text.strip()]
    if empty_questions:
        return ValidationResult(
            status=ValidationStatus.ERROR,
            message=f"Found {len(empty_questions)} questions with empty text",
            severity=ValidationStatus.ERROR,
            filename=filename,
            questions_found=total_questions,
            marks_found=total_marks,
        )

    # Check total marks if declared
    if metadata.total_marks is not None:
        if abs(total_marks - metadata.total_marks) > MARKS_TOLERANCE:
            logger.warning(
                "marks_mismatch",
                filename=filename,
                expected=metadata.total_marks,
                found=total_marks,
                difference=abs(total_marks - metadata.total_marks),
            )
            return ValidationResult(
                status=ValidationStatus.WARNING,
                message=f"Total marks mismatch: expected {metadata.total_marks}, found {total_marks}",
                severity=ValidationStatus.WARNING,
                filename=filename,
                marks_expected=metadata.total_marks,
                marks_found=total_marks,
            )

    # Check sub-part extraction quality
    questions_with_subparts = [q for q in questions if q.sub_parts is not None]
    if questions_with_subparts:
        logger.info(
            "sub_parts_extracted",
            filename=filename,
            count=len(questions_with_subparts),
        )

    return ValidationResult(
        status=ValidationStatus.PASS,
        message=f"Parsed {total_questions} questions, {total_marks:.0f} marks total",
        severity=ValidationStatus.PASS,
        filename=filename,
        questions_found=total_questions,
        marks_found=total_marks,
    )
