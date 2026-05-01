import pdfplumber
import re
import os
import json
from datetime import datetime

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
                metadata["month"] = month_str
                break
            elif month_str.isdigit() and len(month_str) == 4:
                metadata["year"] = int(month_str)
                metadata["month"] = year_str
                break
    
    scheme_match = re.search(r'(\d{4})\s*Scheme', text)
    if scheme_match:
        metadata["scheme"] = scheme_match.group(1)
    elif metadata["qp_code"] == "320001":
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

def split_into_sections(text, is_new_format):
    """Split text into sections based on section headers."""
    if is_new_format:
        # New format sections
        section_patterns = [
            ("MCQs", r'Multiple\s*Choice\s*Questions.*?\d+x\d+=?\d*'),
            ("Long Essays", r'Long\s*Essays?.*?\d+x\d+=?\d*'),
            ("Short Essays", r'Short\s*essays?.*?\d+x\d+=?\d*'),
            ("Short Answers", r'Short\s*answers?.*?\d+x\d+=?\d*'),
            ("Draw and Label", r'Draw\s*(?:and\s*)?label.*?\d+x[\d\.]+=?\d*'),
            ("Precise Answers", r'(?:Precise\s*answers?|One\s*word\s*answers?).*?\d+x\d+=?\d*'),
        ]
    else:
        # Old format sections
        section_patterns = [
            ("Essay", r'Essay.*?\(\d+\)'),
            ("Short Notes", r'Short\s*notes.*?\d+x\d+=?\d*'),
            ("Answer Briefly", r'Answer\s*briefly.*?\d+x\d+=?\d*'),
            ("Draw and Label", r'Draw\s*(?:and\s*)?label.*?\d+x\d+=?\d*'),
            ("One Word Answers", r'One\s*word\s*answers?.*?\d+x\d+=?\d*'),
        ]
    
    # Find all section positions
    sections = []
    for name, pattern in section_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            sections.append((match.start(), match.end(), name, match.group()))
    
    # Sort by position
    sections.sort(key=lambda x: x[0])
    
    # Extract text between sections
    result = []
    for i, (start, end, name, header) in enumerate(sections):
        if i + 1 < len(sections):
            section_text = text[end:sections[i+1][0]]
        else:
            section_text = text[end:]
        
        # Parse marks from header
        marks_info = parse_marks_from_header(header)
        
        result.append({
            "name": name,
            "header": header,
            "text": section_text.strip(),
            "marks_info": marks_info
        })
    
    return result

def parse_marks_from_header(header):
    """Parse number of questions, marks per question, and total marks from header."""
    # Patterns: (4x3=12), (10), (2x15=30), (5x8=40), (5x4=20), (2x2.5=5)
    match = re.search(r'\((\d+)x([\d\.]+)(?:=([\d\.]+))?\)', header)
    if match:
        return {
            "num_questions": int(match.group(1)),
            "marks_each": float(match.group(2)),
            "total": float(match.group(3)) if match.group(3) else None
        }
    
    # Single mark: (10)
    match = re.search(r'\((\d+)\)', header)
    if match:
        return {
            "num_questions": 1,
            "marks_each": float(match.group(1)),
            "total": float(match.group(1))
        }
    
    return {"num_questions": None, "marks_each": None, "total": None}

def extract_questions_from_section(section, is_new_format):
    """Extract individual questions from a section."""
    questions = []
    text = section["text"]
    section_name = section["name"]
    marks_each = section["marks_info"]["marks_each"] if section["marks_info"]["marks_each"] else 1
    
    if section_name == "MCQs":
        # MCQs use roman numerals or letters
        patterns = [
            r'\n([ivxlc]+)\.\s*(.*?)(?=\n[ivxlc]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)',
            r'\n([a-z]+)\.\s*(.*?)(?=\n[a-z]+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label)[:\s]|$)',
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            if matches:
                for q_num, q_text in matches:
                    q_text = q_text.strip().replace('\n', ' ')
                    if len(q_text) > 10:
                        questions.append({
                            "section": section_name,
                            "question_number": q_num,
                            "question_text": q_text,
                            "marks": marks_each,
                            "sub_parts": None,
                            "type": "mcq"
                        })
                break
    
    elif section_name in ["Long Essays", "Short Essays", "Short Answers", "Essay", "Short Notes", "Answer Briefly", "Draw and Label", "Precise Answers", "One Word Answers"]:
        # Numbered questions
        pattern = r'\n?\s*(\d+)\.\s*(.*?)(?=\n?\s*\d+\.\s*|\n(?:Long\s*Essays?|Short\s*essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label|One\s*word\s*answers?)[:\s]|\*{3,}|$)'
        matches = re.findall(pattern, text, re.DOTALL)
        
        for q_num, q_text in matches:
            q_text = q_text.strip().replace('\n', ' ')
            if len(q_text) < 5:
                continue
            
            # Extract sub-parts (a, b, c, d, e)
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

def process_pdf(pdf_path):
    """Process a single PDF and extract all questions."""
    filename = os.path.basename(pdf_path)
    text = extract_text_from_pdf(pdf_path)
    metadata = parse_metadata(text, filename)
    
    is_new_format = metadata["qp_code"] == "320001" or metadata.get("total_marks") == 100
    
    sections = split_into_sections(text, is_new_format)
    all_questions = []
    
    for section in sections:
        questions = extract_questions_from_section(section, is_new_format)
        for q in questions:
            q["exam_year"] = metadata.get("year")
            q["exam_month"] = metadata.get("month")
            q["scheme"] = metadata.get("scheme", "2010")
            q["qp_code"] = metadata.get("qp_code")
            q["total_marks"] = metadata.get("total_marks")
            q["filename"] = filename
        all_questions.extend(questions)
    
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
            
            # Show summary
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
    
    # Save as JSON
    output_json = os.path.join(OUTPUT_DIR, "questions_raw.json")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": all_metadata,
            "questions": all_questions
        }, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to: {output_json}")
