import pdfplumber
import glob

pdfs = sorted(glob.glob("*.pdf"))

# Examine a few more to understand format variations
samples = [
    "2018_AUGUST_311001.pdf",
    "2020_FEBRUARY_311001.pdf",
    "2023_MARCH_311001.pdf",
    "2024_AUGUST_311001.pdf",
    "2024_MARCH_2019_SCHEME_320001.pdf"
]

for pdf_file in samples:
    if pdf_file not in pdfs:
        continue
    print("\n" + "="*70)
    print(f"EXAMINING: {pdf_file}")
    print("="*70)
    with pdfplumber.open(pdf_file) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages):
            print(f"\n--- Page {i+1} ---")
            text = page.extract_text()
            if text:
                print(text[:2500])
            else:
                print("[No text]")
            print("...")
            if i >= 1:  # Show max 2 pages
                break
