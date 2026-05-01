#!/usr/bin/env python3
"""
Extract Nelson chapters by finding CHAPTER headers and section titles.
"""

import fitz
import re
import os

fitz.PyMuPDF_warnings = lambda x: None

PDF_PATH = "/Users/akashstephen/Developer/Pediatrics Exam/kliegman-robert-nelson-essentials-of-pediatrics-eighth.pdf"
OUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam/nelson_extracts"

os.makedirs(OUT_DIR, exist_ok=True)

# Known chapter mappings for Nelson 8th Ed (approximate)
# We'll search for these section headers
SECTION_MAP = {
    "agn": {
        "title": "AGN_PSGN",
        "headers": ["Glomerulonephritis", "Poststreptococcal", "Acute Glomerulonephritis", "AGN"],
        "chapter_hint": "Nephrology"
    },
    "nephrotic": {
        "title": "Nephrotic_Syndrome", 
        "headers": ["Nephrotic Syndrome", "Nephrotic", "Minimal Change"],
        "chapter_hint": "Nephrology"
    },
    "rickets": {
        "title": "Rickets",
        "headers": ["Rickets", "vitamin D deficiency", "hypophosphatemic rickets"],
        "chapter_hint": "Endocrinology"
    },
    "hypothyroid": {
        "title": "Hypothyroidism",
        "headers": ["Hypothyroidism", "Congenital Hypothyroidism", "thyroid hormone"],
        "chapter_hint": "Endocrinology"
    },
    "torsion": {
        "title": "Testicular_Torsion",
        "headers": ["Testicular Torsion", "Acute Scrotum", "torsion"],
        "chapter_hint": "Urology"
    },
    "hematuria": {
        "title": "Hematuria",
        "headers": ["Hematuria", "glomerular hematuria"],
        "chapter_hint": "Nephrology"
    },
    "hypoglycemia": {
        "title": "Hypoglycemia",
        "headers": ["Hypoglycemia", "hypoglycemia", "glucose"],
        "chapter_hint": "Endocrinology"
    },
    "intussusception": {
        "title": "Intussusception",
        "headers": ["Intussusception", "intussusception", "telescoping"],
        "chapter_hint": "GI"
    },
    "portal": {
        "title": "Portal_HTN",
        "headers": ["Portal Hypertension", "portal hypertension", "variceal"],
        "chapter_hint": "GI"
    },
    "hus": {
        "title": "HUS",
        "headers": ["Hemolytic Uremic", "HUS", "Shiga toxin", "thrombotic microangiopathy"],
        "chapter_hint": "Nephrology"
    },
    "biliary": {
        "title": "Biliary_Atresia",
        "headers": ["Biliary Atresia", "biliary atresia", "Kasai", "neonatal cholestasis"],
        "chapter_hint": "GI"
    },
    "dka": {
        "title": "DKA",
        "headers": ["Diabetic Ketoacidosis", "DKA", "ketoacidosis", "diabetic"],
        "chapter_hint": "Endocrinology"
    }
}

def find_section_pages(doc, headers, max_pages=20):
    """Find pages containing section headers, then expand to contiguous block."""
    matched = set()
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        for header in headers:
            if header.lower() in text.lower():
                matched.add(page_num)
                break
    
    if not matched:
        return []
    
    # Group into contiguous blocks
    blocks = []
    current = []
    for p in sorted(matched):
        if not current or p == current[-1] + 1:
            current.append(p)
        else:
            blocks.append(current)
            current = [p]
    blocks.append(current)
    
    # Return largest block, limited to max_pages
    largest = max(blocks, key=len)
    return largest[:max_pages]

def main():
    doc = fitz.open(PDF_PATH)
    print(f"Opened PDF with {len(doc)} pages")
    
    for topic_id, config in SECTION_MAP.items():
        pages = find_section_pages(doc, config["headers"])
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
