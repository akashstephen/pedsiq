import pdfplumber
import re

# Examine problematic PDFs to understand exact formatting
files = [
    "2019_AUGUST_311001.pdf",
    "2024_MARCH_2019_SCHEME_320001.pdf",
    "2025_MAY_320001.pdf"
]

for fname in files:
    print("\n" + "="*70)
    print(f"FILE: {fname}")
    print("="*70)
    with pdfplumber.open(fname) as pdf:
        full_text = ""
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                full_text += t + "\n"
    
    # Find all section header-like patterns
    print("\n--- Section Headers Found ---")
    patterns = [
        r'Essay[:\s]*\(\d+\)',
        r'Short\s*notes[:\s]*\(\d+x\d+.*?\)',
        r'Answer\s*briefly[:\s]*\(\d+x\d+.*?\)',
        r'Draw\s*(?:and\s*)?label[:\s]*\(\d+x\d+.*?\)',
        r'One\s*word\s*answers?[:\s]*\(\d+x\d+.*?\)',
        r'Multiple\s*Choice\s*Questions.*?\(\d+x\d+.*?\)',
        r'Long\s*Essays?[:\s]*\(\d+x\d+.*?\)',
        r'Short\s*essays?[:\s]*\(\d+x\d+.*?\)',
        r'Short\s*answers?[:\s]*\(\d+x\d+.*?\)',
        r'Precise\s*answers?[:\s]*\(\d+x\d+.*?\)',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        if matches:
            print(f"  Pattern '{pattern}': {matches}")
    
    # Show raw text around first 2000 chars
    print("\n--- First 3000 chars of text ---")
    print(full_text[:3000])
    print("...")
