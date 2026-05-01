import pdfplumber
import re
import os
import json
from datetime import datetime

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file."""
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
    
    # Extract QP code
    qp_match = re.search(r'Q\.P\.\s*Code:\s*(\d+)', text)
    if qp_match:
        metadata["qp_code"] = qp_match.group(1)
    
    # Extract year and month from various formats
    # "April 2015", "August 2018", "March 2024", etc.
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
    
    # Extract scheme
    scheme_match = re.search(r'(\d{4})\s*Scheme', text)
    if scheme_match:
        metadata["scheme"] = scheme_match.group(1)
    elif metadata["qp_code"] == "320001":
        metadata["scheme"] = "2019"
    else:
        metadata["scheme"] = "2010"
    
    # Extract total marks
    marks_match = re.search(r'Total\s*Marks:\s*(\d+)', text)
    if marks_match:
        metadata["total_marks"] = int(marks_match.group(1))
    
    # Extract duration
    duration_match = re.search(r'Time:\s*(\d+)\s*Hours?', text)
    if duration_match:
        metadata["duration"] = int(duration_match.group(1))
    
    # Exam type
    if "Regular" in text and "Supplementary" in text:
        metadata["exam_type"] = "Regular/Supplementary"
    elif "Regular" in text:
        metadata["exam_type"] = "Regular"
    elif "Supplementary" in text:
        metadata["exam_type"] = "Supplementary"
    
    return metadata

def parse_old_format_questions(text, metadata):
    """Parse questions from old format (311001, 40 marks, 2010 scheme)."""
    questions = []
    
    # Clean up text
    text = re.sub(r'Q\.P\.\s*Code:.*?\n', '', text)
    text = re.sub(r'Reg\.\s*no\.:.*?\n', '', text)
    text = re.sub(r'\*{3,}', '', text)
    
    # Define sections for old format
    sections = [
        ("Essay", r'Essay:\s*\((\d+)\)', 10),
        ("Short Notes", r'Short\s*notes:\s*\((\d+)x(\d+)=?(\d*)\)', None),
        ("Answer Briefly", r'Answer\s*briefly:\s*\((\d+)x(\d+)=?(\d*)\)', None),
        ("Draw and Label", r'Draw\s*(?:and\s*)?label:\s*\((\d+)x(\d+)=?(\d*)\)', None),
        ("One Word Answers", r'One\s*word\s*answers?:\s*\((\d+)x(\d+)=?(\d*)\)', None),
    ]
    
    # Try to find sections and questions
    # For old format, the structure is fairly consistent
    
    # Essay section
    essay_match = re.search(r'Essay:\s*\((\d+)\)(.*?)(?=Short\s*notes:|Short\s*Notes:|$)', text, re.DOTALL)
    if essay_match:
        marks = int(essay_match.group(1))
        content = essay_match.group(2).strip()
        # Extract numbered questions
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nShort\s*notes:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Essay",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks,
                "sub_parts": None,
                "type": "essay"
            })
    
    # Short Notes section
    sn_match = re.search(r'Short\s*notes:\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Answer\s*briefly:|Draw\s*(?:and\s*)?label:|One\s*word\s*answers?:|$)', text, re.DOTALL)
    if sn_match:
        num_q = int(sn_match.group(1))
        marks_each = int(sn_match.group(2))
        content = sn_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nAnswer\s*briefly:|\nDraw\s*(?:and\s*)?label:|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Short Notes",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "short_note"
            })
    
    # Answer Briefly section
    ab_match = re.search(r'Answer\s*briefly:\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Draw\s*(?:and\s*)?label:|One\s*word\s*answers?:|$)', text, re.DOTALL)
    if ab_match:
        num_q = int(ab_match.group(1))
        marks_each = int(ab_match.group(2))
        content = ab_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nDraw\s*(?:and\s*)?label:|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Answer Briefly",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "brief"
            })
    
    # Draw and Label section
    dl_match = re.search(r'Draw\s*(?:and\s*)?label:\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=One\s*word\s*answers?:|$)', text, re.DOTALL)
    if dl_match:
        num_q = int(dl_match.group(1))
        marks_each = int(dl_match.group(2))
        content = dl_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Draw and Label",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "draw_label"
            })
    
    # One Word Answers section
    owa_match = re.search(r'One\s*word\s*answers?:\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=\*{3,}|$)', text, re.DOTALL)
    if owa_match:
        num_q = int(owa_match.group(1))
        marks_each = int(owa_match.group(2))
        content = owa_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\*{3,}|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "One Word Answers",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "one_word"
            })
    
    return questions

def parse_new_format_questions(text, metadata):
    """Parse questions from new format (320001, 100 marks, 2019 scheme)."""
    questions = []
    
    # Clean up text
    text = re.sub(r'Q\.P\.\s*Code:.*?\n', '', text)
    text = re.sub(r'Reg\.\s*(?:No|no)\.:\s*\.\.\.', '', text)
    text = re.sub(r'\*{3,}', '', text)
    text = re.sub(r'\(PTO\)', '', text)
    
    # MCQs section
    mcq_match = re.search(r'Multiple\s*Choice\s*Questions\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Long\s*Essays:|$)', text, re.DOTALL)
    if mcq_match:
        num_q = int(mcq_match.group(1))
        marks_each = int(mcq_match.group(2))
        content = mcq_match.group(4).strip()
        
        # For MCQs, extract case scenarios and individual questions
        # Match roman numerals or lowercase letters for question numbers
        q_matches = re.findall(r'\n?(Question\s+numbers?\s+)?([ivxlc]+|[a-z]+|[0-9]+)[\.\)]\s*(.*?)(?=\n(?:Question\s+numbers?|[ivxlc]+|[a-z]+|[0-9]+)[\.\)]|$)', content, re.DOTALL)
        
        # Alternative: match question patterns
        q_matches_alt = re.findall(r'\n([ivxlc]+)\.\s*(.*?)(?=\n[ivxlc]+\.\s*|\nLong\s*Essays:|$)', content, re.DOTALL)
        
        if not q_matches_alt:
            q_matches_alt = re.findall(r'\n([a-z]+)\.\s*(.*?)(?=\n[a-z]+\.\s*|\nLong\s*Essays:|$)', content, re.DOTALL)
        
        for q_num, q_text in q_matches_alt:
            q_text = q_text.strip().replace('\n', ' ')
            if q_text:
                questions.append({
                    "section": "MCQs",
                    "question_number": q_num,
                    "question_text": q_text,
                    "marks": marks_each,
                    "sub_parts": None,
                    "type": "mcq"
                })
    
    # Long Essays section
    le_match = re.search(r'Long\s*Essays?:\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Short\s*essays?|Short\s*Essays?|Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label:|$)', text, re.DOTALL)
    if le_match:
        num_q = int(le_match.group(1))
        marks_each = int(le_match.group(2))
        content = le_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nShort\s*essays?|\nShort\s*answers?|\nPrecise\s*answers?|\nDraw\s*(?:and\s*)?label:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            # Extract sub-parts (a, b, c, d, e)
            sub_parts = re.findall(r'\(([a-e])\)\s*(.*?)(?=\([a-e]\)|$)', q_text)
            if sub_parts:
                question_main = q_text[:q_text.find('(')].strip()
                questions.append({
                    "section": "Long Essays",
                    "question_number": int(q_num),
                    "question_text": question_main,
                    "marks": marks_each,
                    "sub_parts": [(sp[0], sp[1].strip()) for sp in sub_parts],
                    "type": "long_essay"
                })
            else:
                questions.append({
                    "section": "Long Essays",
                    "question_number": int(q_num),
                    "question_text": q_text,
                    "marks": marks_each,
                    "sub_parts": None,
                    "type": "long_essay"
                })
    
    # Short Essays section
    se_match = re.search(r'Short\s*essays?\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Short\s*answers?|Precise\s*answers?|Draw\s*(?:and\s*)?label:|One\s*word\s*answers?:|$)', text, re.DOTALL)
    if se_match:
        num_q = int(se_match.group(1))
        marks_each = int(se_match.group(2))
        content = se_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nShort\s*answers?|\nPrecise\s*answers?|\nDraw\s*(?:and\s*)?label:|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Short Essays",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "short_essay"
            })
    
    # Short Answers section
    sa_match = re.search(r'Short\s*answers?\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=Precise\s*answers?|Draw\s*(?:and\s*)?label:|One\s*word\s*answers?:|$)', text, re.DOTALL)
    if sa_match:
        num_q = int(sa_match.group(1))
        marks_each = int(sa_match.group(2))
        content = sa_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nPrecise\s*answers?|\nDraw\s*(?:and\s*)?label:|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Short Answers",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "short_answer"
            })
    
    # Draw and Label section
    dl_match = re.search(r'Draw\s*(?:and\s*)?label:\s*\((\d+)x([\d\.]+)=?(\d*)\)(.*?)(?=Precise\s*answers?|One\s*word\s*answers?:|$)', text, re.DOTALL)
    if dl_match:
        num_q = int(dl_match.group(1))
        marks_each = float(dl_match.group(2))
        content = dl_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\nPrecise\s*answers?|\nOne\s*word\s*answers?:|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Draw and Label",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "draw_label"
            })
    
    # Precise / One Word Answers
    pa_match = re.search(r'(?:Precise\s*answers?|One\s*word\s*answers?):\s*\((\d+)x(\d+)=?(\d*)\)(.*?)(?=\*{3,}|$)', text, re.DOTALL)
    if pa_match:
        num_q = int(pa_match.group(1))
        marks_each = int(pa_match.group(2))
        content = pa_match.group(4).strip()
        q_matches = re.findall(r'\n?\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|\*{3,}|$)', content, re.DOTALL)
        for q_num, q_text in q_matches:
            q_text = q_text.strip().replace('\n', ' ')
            questions.append({
                "section": "Precise Answers",
                "question_number": int(q_num),
                "question_text": q_text,
                "marks": marks_each,
                "sub_parts": None,
                "type": "precise"
            })
    
    return questions

def process_pdf(pdf_path):
    """Process a single PDF and extract all questions."""
    filename = os.path.basename(pdf_path)
    text = extract_text_from_pdf(pdf_path)
    metadata = parse_metadata(text, filename)
    
    if metadata["qp_code"] == "320001" or metadata.get("total_marks") == 100:
        questions = parse_new_format_questions(text, metadata)
    else:
        questions = parse_old_format_questions(text, metadata)
    
    # Add metadata to each question
    for q in questions:
        q["exam_year"] = metadata.get("year")
        q["exam_month"] = metadata.get("month")
        q["scheme"] = metadata.get("scheme", "2010")
        q["qp_code"] = metadata.get("qp_code")
        q["total_marks"] = metadata.get("total_marks")
        q["filename"] = filename
    
    return metadata, questions

if __name__ == "__main__":
    import glob
    
    all_questions = []
    all_metadata = []
    
    pdfs = sorted(glob.glob(os.path.join(OUTPUT_DIR, "*.pdf")))
    print(f"Processing {len(pdfs)} PDFs...")
    
    for pdf_path in pdfs:
        print(f"  Processing: {os.path.basename(pdf_path)}")
        try:
            metadata, questions = process_pdf(pdf_path)
            all_metadata.append(metadata)
            all_questions.extend(questions)
            print(f"    -> Extracted {len(questions)} questions")
        except Exception as e:
            print(f"    -> ERROR: {e}")
    
    print(f"\nTotal questions extracted: {len(all_questions)}")
    
    # Save as JSON for intermediate processing
    output_json = os.path.join(OUTPUT_DIR, "questions_raw.json")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": all_metadata,
            "questions": all_questions
        }, f, indent=2, ensure_ascii=False)
    
    print(f"Saved raw data to: {output_json}")
