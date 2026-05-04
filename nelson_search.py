#!/usr/bin/env python3
"""
Nelson PDF Search Utility
Extracts text from the Nelson Essentials of Pediatrics PDF around search terms.
Usage: python nelson_search.py <search_term> [context_lines=5]
"""
import sys
import pdfplumber
import re

PDF_PATH = "/Users/akashstephen/Developer/Pediatrics Exam/kliegman-robert-nelson-essentials-of-pediatrics-eighth.pdf"

def search_pdf(term, context_lines=5):
    """Search the Nelson PDF for a term and return matches with context."""
    results = []
    term_lower = term.lower()
    
    with pdfplumber.open(PDF_PATH) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if not text:
                continue
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if term_lower in line.lower():
                    start = max(0, i - context_lines)
                    end = min(len(lines), i + context_lines + 1)
                    context = '\n'.join(lines[start:end])
                    results.append(f"--- Page {page_num} ---\n{context}\n")
                    if len(results) >= 10:  # Limit to 10 matches
                        return results
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python nelson_search.py <search_term> [context_lines=5]")
        sys.exit(1)
    
    term = sys.argv[1]
    context = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    results = search_pdf(term, context)
    if results:
        print('\n'.join(results))
    else:
        print(f"No matches found for '{term}'")
