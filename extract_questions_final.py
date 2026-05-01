import pdfplumber
import re
import os
import json

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file preserving page order."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def parse_metadata(text, filename):
    """Parse exam metadata from the text."""
    metadata = {
        "filename": filename,
        "qp_code": None,
        "year": None,
        "month": None,
        "scheme": None,
        "total_marks": None,
        "duration": None,
        "exam_type": None
    }
    
    qp_match = re.search(r'Q\.P\.\s*Code:\s*(\d+)', text)
    if qp_match:
        metadata["qp_code"] = qp_match.group(1)
    
    date_patterns = [
        r'(?:Examinations?[,:]?\s+)?([A-Za-z]+)\s+(\d{4})',
        r'(\d{4})\s+([A-Za-z]+)'
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            month_str = match.group(1)
            year_str = match.group(2)
            if year_str.isdigit() and len(year_str) == 4:
                metadata["year"] = int(year_str)
                metadata["month"] = year_str
                break
            elif month_str.isdigit() and len(month_str) == 4:
                metadata["year"] = int(month_str)
                metadata["month"] = year_str
                break
    
    # Also extract month from filename as fallback
    month_map = {
        "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
        "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
    }
    for month_name in month_map:
        if month_name in filename.upper():
            metadata["month"] = month_name.title()
            break
    
    year_from_file = re.search(r'(\d{4})', filename)
    if year_from_file and not metadata["year"]:
        metadata["year"] = int(year_from_file.group(1))
    
    scheme_match = re.search(r'(\d{4})\s*Scheme', text)
    if scheme_match:
        metadata["scheme"] = scheme_match.group(1)
    elif "2019_SCHEME" in filename or metadata["qp_code"] == "320001":
        metadata["scheme"] = "2019"
    else:
        metadata["scheme"] = "2010"
    
    marks_match = re.search(r'Total\s*Marks:\s*(\d+)', text)
    if marks_match:
        metadata["total_marks"] = int(marks_match.group(1))
    
    duration_match = re.search(r'Time:\s*(\d+)\s*Hours?', text)
    if duration_match:
        metadata["duration"] = int(duration_match.group(1))
    
    if "Regular" in text and "Supplementary" in text:
        metadata["exam_type"] = "Regular/Supplementary"
    elif "Regular" in text:
        metadata["exam_type"] = "Regular"
    elif "Supplementary" in text:
        metadata["exam_type"] = "Supplementary"
    
    return metadata

# Known section configurations for old format (2010 scheme, 311001, 40 marks)
OLD_FORMAT_SECTIONS = {
    "Essay": {"marks": 10, "expected_count": 1},
    "Short Notes": {"marks": 3, "expected_count": 4},
    "Answer Briefly": {"marks": 2, "expected_count": 5},
    "Draw and Label": {"marks": 2, "expected_count": 2},
    "One Word Answers": {"marks": 1, "expected_count": 4},
}

# Known section configurations for new format (2019 scheme, 320001, 100 marks)
NEW_FORMAT_SECTIONS = {
    "MCQs": {"marks": 1, "expected_count": 20},
    "Long Essays": {"marks": None, "expected_count": 2},  # 10 or 15
    "Short Essays": {"marks": None, "expected_count": None},  # 5-8
    "Short Answers": {"marks": None, "expected_count": 5},  # 3-4
    "Draw and Label": {"marks": 2.5, "expected_count": 2},
    "Precise Answers": {"marks": 1, "expected_count": 10},
}

SECTION_PATTERNS = [
    ("MCQs", r'Multiple\s*Choice\s*Questions'),
    ("Long Essays", r'Long\s*Essays?'),
    ("Short Essays", r'Short\s*essays?'),
    ("Short Answers", r'Short\s*answers?'),
    ("Draw and Label", r'Draw\s*(?:and\s*)?label'),
    ("Precise Answers", r'Precise\s*answers?'),
    ("Essay", r'Essay\b(?!\s*questions)'),
    ("Short Notes", r'Short\s*notes?'),
    ("Answer Briefly", r'Answer\s*briefly'),
    ("One Word Answers", r'One\s*word\s*answers?'),
]

def detect_section_header(line):
    """Detect if a line is a section header."""
    for section_name, pattern in SECTION_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            if re.search(r'\(\d+', line):
                return section_name, line
    return None, None

def parse_marks_from_line(line):
    """Parse marks from a section header line."""
    match = re.search(r'\((\d+)x([\d\.]+)(?:=([\d\.]+))?\)', line)
    if match:
        return {
            "num_questions": int(match.group(1)),
            "marks_each": float(match.group(2)),
            "total": float(match.group(3)) if match.group(3) else None
        }
    match = re.search(r'\((\d+)\)', line)
    if match:
        return {
            "num_questions": 1,
            "marks_each": float(match.group(1)),
            "total": float(match.group(1))
        }
    return {"num_questions": None, "marks_each": None, "total": None}

def split_into_sections(text):
    """Split text into sections by detecting section headers line by line."""
    lines = text.split('\n')
    sections = []
    current_section = None
    current_text = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        section_name, header_line = detect_section_header(line)
        if section_name:
            if current_section and current_text:
                sections.append({
                    "name": current_section["name"],
                    "header": current_section["header"],
                    "marks_info": current_section["marks_info"],
                    "text": '\n'.join(current_text)
                })
            
            marks_info = parse_marks_from_line(header_line)
            current_section = {
                "name": section_name,
                "header": header_line,
                "marks_info": marks_info
            }
            current_text = []
        elif current_section:
            current_text.append(line)
    
    if current_section and current_text:
        sections.append({
            "name": current_section["name"],
            "header": current_section["header"],
            "marks_info": current_section["marks_info"],
            "text": '\n'.join(current_text)
        })
    
    return sections

def extract_questions_from_section(section, is_new_format):
    """Extract individual questions from a section."""
    questions = []
    text = section["text"]
    section_name = section["name"]
    marks_each = section["marks_info"]["marks_each"] if section["marks_info"]["marks_each"] else 1
    
    if section_name == "MCQs":
        # MCQs use roman numerals
        q_matches = re.findall(r'\n?([ivxlc]+)\.\s*(.*?)(?=\n[ivxlc]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)', '\n' + text, re.DOTALL)
        if not q_matches:
            q_matches = re.findall(r'\n?([a-z]+)\.\s*(.*?)(?=\n[a-z]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)', '\n' + text, re.DOTALL)
        
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            if len(q_text) > 5:
                questions.append({
                    "section": section_name,
                    "question_number": q_num,
                    "question_text": q_text,
                    "marks": marks_each,
                    "sub_parts": None,
                    "type": "mcq"
                })
    
    elif section_name in ["Long Essays", "Short Essays", "Short Answers", "Essay", "Short Notes", "Answer Briefly", "Draw and Label", "Precise Answers", "One Word Answers"]:
        pattern = r'\n?\s*(\d+)\.\s*(.*?)(?=\n?\s*\d+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label|One\s*word\s*answers?)[:\s]|\*{3,}|$)'
        matches = re.findall(pattern, '\n' + text, re.DOTALL)
        
        for q_num, q_text in matches:
            q_text = q_text.strip().replace('\n', ' ')
            if len(q_text) < 5:
                continue
            
            # Skip lines that look like "6.5 kg" where "6." is a decimal number
            if re.match(r'^\d+\.\s*\d', q_text):
                continue
            
            # Clean up trailing mark allocations
            q_text = re.sub(r'\s*\(\d+(?:\+\d+)*\)\s*$', '', q_text)
            
            sub_parts = re.findall(r'\(([a-e])\)\s*(.*?)(?=\([a-e]\)|$)', q_text)
            if sub_parts:
                question_main = q_text[:q_text.find('(')].strip()
                questions.append({
                    "section": section_name,
                    "question_number": int(q_num),
                    "question_text": question_main,
                    "marks": marks_each,
                    "sub_parts": [(sp[0], sp[1].strip()) for sp in sub_parts],
                    "type": section_name.lower().replace(' ', '_')
                })
            else:
                questions.append({
                    "section": section_name,
                    "question_number": int(q_num),
                    "question_text": q_text,
                    "marks": marks_each,
                    "sub_parts": None,
                    "type": section_name.lower().replace(' ', '_')
                })
    
    return questions

def post_process_questions(questions, metadata):
    """Clean up extracted questions."""
    is_new_format = metadata["qp_code"] == "320001" or metadata.get("total_marks") == 100
    cleaned = []
    
    for q in questions:
        # Fix marks for known sections
        if not is_new_format and q["section"] in OLD_FORMAT_SECTIONS:
            q["marks"] = OLD_FORMAT_SECTIONS[q["section"]]["marks"]
        
        # For new format, fix Long Essays marks
        if is_new_format and q["section"] == "Long Essays":
            if metadata["total_marks"] == 100:
                # Determine if 10 or 15 marks based on section header
                q["marks"] = 15 if "15" in metadata.get("header", "") else 10
        
        cleaned.append(q)
    
    # Remove phantom questions (numbers that don't make sense in context)
    if is_new_format:
        # Long Essays should only have Q1 and Q2
        long_essay_nums = [q["question_number"] for q in cleaned if q["section"] == "Long Essays"]
        if long_essay_nums:
            cleaned = [q for q in cleaned if not (q["section"] == "Long Essays" and q["question_number"] not in [1, 2])]
    
    return cleaned

def process_pdf(pdf_path):
    """Process a single PDF and extract all questions."""
    filename = os.path.basename(pdf_path)
    text = extract_text_from_pdf(pdf_path)
    metadata = parse_metadata(text, filename)
    
    sections = split_into_sections(text)
    all_questions = []
    
    for section in sections:
        questions = extract_questions_from_section(section, metadata["qp_code"] == "320001")
        for q in questions:
            q["exam_year"] = metadata.get("year")
            q["exam_month"] = metadata.get("month")
            q["scheme"] = metadata.get("scheme", "2010")
            q["qp_code"] = metadata.get("qp_code")
            q["total_marks"] = metadata.get("total_marks")
            q["filename"] = filename
        all_questions.extend(questions)
    
    all_questions = post_process_questions(all_questions, metadata)
    return metadata, all_questions

if __name__ == "__main__":
    import glob
    
    all_questions = []
    all_metadata = []
    
    pdfs = sorted(glob.glob(os.path.join(OUTPUT_DIR, "*.pdf")))
    print(f"Processing {len(pdfs)} PDFs...\n")
    
    for pdf_path in pdfs:
        filename = os.path.basename(pdf_path)
        print(f"Processing: {filename}")
        try:
            metadata, questions = process_pdf(pdf_path)
            all_metadata.append(metadata)
            all_questions.extend(questions)
            
            sections_found = {}
            for q in questions:
                sections_found[q["section"]] = sections_found.get(q["section"], 0) + 1
            print(f"  -> Sections: {sections_found}")
            print(f"  -> Total questions: {len(questions)}")
            print()
        except Exception as e:
            print(f"  -> ERROR: {e}\n")
            import traceback
            traceback.print_exc()
    
    print(f"="*60)
    print(f"Total questions extracted: {len(all_questions)}")
    print(f"="*60)
    
    output_json = os.path.join(OUTPUT_DIR, "questions_raw.json")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": all_metadata,
            "questions": all_questions
        }, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to: {output_json}")
