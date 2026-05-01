import pdfplumber

# Check 2025_MAY page 2
with pdfplumber.open("2025_MAY_320001.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"=== PAGE {i+1} ===")
        print(text)
        print("\n")
