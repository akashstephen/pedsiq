#!/usr/bin/env python3
"""
Extract relevant Nelson chapters for structured answer citations.
Suppresses MuPDF warnings to stderr.
"""

import fitz
import sys
import os

# Suppress MuPDF warnings
fitz.PyMuPDF_warnings = lambda x: None

PDF_PATH = "/Users/akashstephen/Developer/Pediatrics Exam/kliegman-robert-nelson-essentials-of-pediatrics-eighth.pdf"
OUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam/nelson_extracts"

os.makedirs(OUT_DIR, exist_ok=True)

# Map topics to search terms and expected chapter context
TOPICS = {
    "agn": {
        "title": "AGN_PSGN",
        "search_terms": ["Glomerulonephritis", "Post-Streptococcal", "nephritic", "AGN"],
        "exclude": ["nephrotic", "Nephrotic"],
        "pages": None
    },
    "nephrotic": {
        "title": "Nephrotic_Syndrome",
        "search_terms": ["Nephrotic Syndrome", "nephrotic", "Minimal Change", "MCNS"],
        "exclude": ["AGN", "glomerulonephritis"],
        "pages": None
    },
    "rickets": {
        "title": "Rickets",
        "search_terms": ["Rickets", "vitamin D deficiency", "rickets", "hypophosphatemic"],
        "exclude": [],
        "pages": None
    },
    "hypothyroid": {
        "title": "Hypothyroidism",
        "search_terms": ["Hypothyroidism", "congenital hypothyroidism", "thyroid hormone"],
        "exclude": ["hyperthyroidism"],
        "pages": None
    },
    "torsion": {
        "title": "Testicular_Torsion",
        "search_terms": ["Testicular Torsion", "acute scrotum", "torsion", "bell-clapper"],
        "exclude": ["ovarian"],
        "pages": None
    },
    "hematuria": {
        "title": "Hematuria",
        "search_terms": ["Hematuria", "hematuria", "dysmorphic RBC", "glomerular hematuria"],
        "exclude": [],
        "pages": None
    },
    "hypoglycemia": {
        "title": "Hypoglycemia",
        "search_terms": ["Hypoglycemia", "hypoglycemia", "glucose <40", "neuroglycopenic"],
        "exclude": ["hyperglycemia"],
        "pages": None
    },
    "intussusception": {
        "title": "Intussusception",
        "search_terms": ["Intussusception", "intussusception", "telescoping", "lead point"],
        "exclude": [],
        "pages": None
    },
    "portal": {
        "title": "Portal_HTN",
        "search_terms": ["Portal Hypertension", "portal hypertension", "variceal", "portosystemic"],
        "exclude": [],
        "pages": None
    },
    "hus": {
        "title": "HUS",
        "search_terms": ["Hemolytic Uremic", "HUS", "Shiga toxin", "STEC", "thrombotic microangiopathy"],
        "exclude": [],
        "pages": None
    },
    "biliary": {
        "title": "Biliary_Atresia",
        "search_terms": ["Biliary Atresia", "biliary atresia", "Kasai", "neonatal cholestasis"],
        "exclude": [],
        "pages": None
    },
    "dka": {
        "title": "DKA",
        "search_terms": ["Diabetic Ketoacidosis", "DKA", "ketoacidosis", "diabetic"],
        "exclude": ["hypoglycemic"],
        "pages": None
    }
}

def extract_pages(doc, topic_id, search_terms, exclude_terms, max_pages=15):
    """Find and extract pages matching search terms."""
    matched_pages = set()
    
    for page_num in range(len(doc)):
        text = doc[page_num].get_text().lower()
        # Must contain at least one search term
        found = False
        for term in search_terms:
            if term.lower() in text:
                found = True
                break
        if not found:
            continue
            
        # Must NOT contain exclude terms
        excluded = False
        for ex in exclude_terms:
            if ex.lower() in text:
                excluded = True
                break
        if excluded:
            continue
            
        matched_pages.add(page_num)
    
    # Sort and take contiguous chunks
    matched_pages = sorted(matched_pages)
    if not matched_pages:
        return []
    
    # Take first contiguous block up to max_pages
    pages_to_extract = []
    prev = None
    for p in matched_pages:
        if prev is None or p == prev + 1:
            pages_to_extract.append(p)
            prev = p
        else:
            break
        if len(pages_to_extract) >= max_pages:
            break
    
    return pages_to_extract

def main():
    doc = fitz.open(PDF_PATH)
    print(f"Opened PDF with {len(doc)} pages")
    
    for topic_id, config in TOPICS.items():
        pages = extract_pages(doc, topic_id, config["search_terms"], config["exclude"])
        if not pages:
            print(f"⚠️  No pages found for {topic_id}")
            continue
            
        out_path = os.path.join(OUT_DIR, f"nelson_{topic_id}.txt")
        with open(out_path, "w") as f:
            for p in pages:
                text = doc[p].get_text()
                f.write(f"\n--- PAGE {p} ---\n")
                f.write(text)
                f.write("\n")
        print(f"✅ Extracted {len(pages)} pages for {topic_id} -> {out_path}")
    
    doc.close()

if __name__ == "__main__":
    main()
