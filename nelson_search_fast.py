#!/usr/bin/env python3
"""
Fast Nelson PDF Search - Pre-indexed approach
First run extracts text from all pages to a cache file.
Subsequent runs search the cache.
"""
import sys
import os
import pdfplumber

PDF_PATH = "/Users/akashstephen/Developer/Pediatrics Exam/kliegman-robert-nelson-essentials-of-pediatrics-eighth.pdf"
CACHE_PATH = "/Users/akashstephen/Developer/Pediatrics Exam/nelson_text_cache.txt"

def build_cache():
    print("Building Nelson text cache... this may take a few minutes.", file=sys.stderr)
    with pdfplumber.open(PDF_PATH) as pdf, open(CACHE_PATH, 'w') as cache:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if text:
                cache.write(f"\n--- PAGE {page_num} ---\n")
                cache.write(text)
                cache.write("\n")
            if page_num % 50 == 0:
                print(f"Processed {page_num} pages...", file=sys.stderr)
    print(f"Cache built: {CACHE_PATH}", file=sys.stderr)

def search_cache(term, context_lines=5):
    if not os.path.exists(CACHE_PATH):
        build_cache()
    
    term_lower = term.lower()
    results = []
    
    with open(CACHE_PATH, 'r') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if term_lower in line.lower():
            start = max(0, i - context_lines)
            end = min(len(lines), i + context_lines + 1)
            context = ''.join(lines[start:end])
            results.append(context)
            if len(results) >= 15:
                break
    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python nelson_search_fast.py <search_term> [context_lines=5]")
        sys.exit(1)
    
    term = sys.argv[1]
    context = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    results = search_cache(term, context)
    if results:
        print('\n---\n'.join(results))
    else:
        print(f"No matches found for '{term}'")
