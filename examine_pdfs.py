import pdfplumber
import glob

# List all PDFs
pdfs = sorted(glob.glob("*.pdf"))
print(f"Found {len(pdfs)} PDF files:\n")
for p in pdfs:
    print(f"  {p}")

# Examine the first PDF
print("\n" + "="*60)
print("EXAMINING: 2015_APRIL_311001.pdf")
print("="*60)
with pdfplumber.open("2015_APRIL_311001.pdf") as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages[:2]):
        print(f"\n--- Page {i+1} ---")
        text = page.extract_text()
        print(text[:2000] if text else "[No text]")
        print("...")

print("\n" + "="*60)
print("EXAMINING: 2025_MAY_320001.pdf")
print("="*60)
with pdfplumber.open("2025_MAY_320001.pdf") as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages[:2]):
        print(f"\n--- Page {i+1} ---")
        text = page.extract_text()
        print(text[:2000] if text else "[No text]")
        print("...")
