import json
import os
from collections import Counter, defaultdict
import pandas as pd

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

# Load all classified batches
all_classified = []
for i in range(1, 5):
    with open(os.path.join(OUTPUT_DIR, f"classified_batch_{i}.json"), 'r', encoding='utf-8') as f:
        batch = json.load(f)
        all_classified.extend(batch)

print(f"Total classified questions: {len(all_classified)}")

# Standardize the nelson_section and nelson_chapter formats
for q in all_classified:
    # Clean up section format
    sec = q.get('nelson_section', 'Uncategorized')
    if sec.startswith('SECTION '):
        # Convert "SECTION 16: Infectious Diseases" -> "16. Infectious Diseases"
        parts = sec.split(': ', 1)
        if len(parts) == 2:
            sec_num = parts[0].replace('SECTION ', '')
            sec_name = parts[1]
            q['nelson_section'] = f"{sec_num}. {sec_name}"
    q['nelson_section'] = q['nelson_section'].strip()
    
    # Clean up chapter format
    ch = q.get('nelson_chapter', 'Uncategorized')
    if ch.startswith('Ch') and ':' in ch:
        # "Ch29: Complementary Feeding" -> "29. Complementary Feeding"
        parts = ch.split(':', 1)
        if len(parts) == 2:
            ch_num = parts[0].replace('Ch', '')
            ch_name = parts[1].strip()
            q['nelson_chapter'] = f"{ch_num}. {ch_name}"
    elif ch.startswith('Ch') and '. ' in ch:
        # Already in good format
        pass
    q['nelson_chapter'] = q['nelson_chapter'].strip()

# Generate Excel
rows = []
for q in all_classified:
    row = {
        "Exam Year": q.get('exam_year'),
        "Exam Month": q.get('exam_month'),
        "QP Code": q.get('qp_code'),
        "Scheme": q.get('scheme'),
        "Total Marks": q.get('total_marks'),
        "Filename": q.get('filename'),
        "Section": q.get('section'),
        "Question Number": q.get('question_number'),
        "Question Text": q.get('question_text'),
        "Marks": q.get('marks'),
        "Type": q.get('type'),
        "Sub Parts": json.dumps(q.get('sub_parts')) if q.get('sub_parts') else "",
        "Nelson Section": q.get('nelson_section', 'Uncategorized'),
        "Nelson Chapter": q.get('nelson_chapter', 'Uncategorized'),
    }
    rows.append(row)

df = pd.DataFrame(rows)

excel_path = os.path.join(OUTPUT_DIR, "pediatrics_questions_nelson_final.xlsx")
with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
    # Main sheet
    df.to_excel(writer, sheet_name='All Questions', index=False)
    
    # Nelson Chapter Summary
    chapter_summary = df.groupby(['Nelson Section', 'Nelson Chapter']).agg({
        'Question Number': 'count',
        'Marks': 'sum'
    }).reset_index()
    chapter_summary.columns = ['Nelson Section', 'Nelson Chapter', 'Question Count', 'Total Marks']
    chapter_summary = chapter_summary.sort_values('Question Count', ascending=False)
    chapter_summary.to_excel(writer, sheet_name='Nelson Chapter Summary', index=False)
    
    # Nelson Section Summary
    section_summary = df.groupby('Nelson Section').agg({
        'Question Number': 'count',
        'Marks': 'sum'
    }).reset_index()
    section_summary.columns = ['Nelson Section', 'Question Count', 'Total Marks']
    section_summary = section_summary.sort_values('Question Count', ascending=False)
    section_summary.to_excel(writer, sheet_name='Nelson Section Summary', index=False)
    
    # Year vs Chapter heatmap data
    year_chapter = df.groupby(['Exam Year', 'Nelson Chapter']).agg({
        'Question Number': 'count',
        'Marks': 'sum'
    }).reset_index()
    year_chapter.columns = ['Exam Year', 'Nelson Chapter', 'Count', 'Total Marks']
    year_chapter.to_excel(writer, sheet_name='Year vs Chapter', index=False)
    
    # Top 30 chapters
    high_yield = chapter_summary.head(30)
    high_yield.to_excel(writer, sheet_name='Top 30 Chapters', index=False)
    
    # High-yield by marks (not just count)
    high_marks = chapter_summary.sort_values('Total Marks', ascending=False).head(30)
    high_marks.to_excel(writer, sheet_name='Top 30 by Marks', index=False)

print(f"Generated: {excel_path}")

# Generate Markdown organized by Nelson chapters
lines = []
lines.append("# KUHS Pediatrics Questions - Organized by Nelson Essentials of Pediatrics (8th Edition)")
lines.append("")
lines.append(f"**Total Questions:** {len(all_classified)}")
lines.append(f"**Textbook:** Nelson Essentials of Pediatrics, 8th Edition (Marcdante & Kliegman)")
lines.append("")
lines.append("---")
lines.append("")

# Group by Nelson section and chapter
by_section = defaultdict(lambda: defaultdict(list))
for q in all_classified:
    by_section[q['nelson_section']][q['nelson_chapter']].append(q)

# Sort sections by total question count
section_counts = {}
for section, chapters in by_section.items():
    count = sum(len(qs) for qs in chapters.values())
    section_counts[section] = count

sorted_sections = sorted(section_counts.keys(), key=lambda x: section_counts[x], reverse=True)

for section in sorted_sections:
    chapters = by_section[section]
    lines.append(f"## {section}")
    lines.append("")
    
    sorted_chapters = sorted(chapters.keys(), key=lambda x: len(chapters[x]), reverse=True)
    
    for chapter in sorted_chapters:
        qs = chapters[chapter]
        total_marks = sum(q['marks'] for q in qs)
        lines.append(f"### {chapter} ({len(qs)} questions, {total_marks} marks)")
        lines.append("")
        
        for q in qs:
            lines.append(f"**[{q['exam_year']} {q['exam_month']}] Q{q['question_number']} ({q['marks']} marks)** — {q['question_text']}")
            if q.get('sub_parts'):
                for part_letter, part_text in q['sub_parts']:
                    lines.append(f"- ({part_letter}) {part_text}")
            lines.append("")
    
    lines.append("---")
    lines.append("")

md_path = os.path.join(OUTPUT_DIR, "pediatrics_questions_nelson_final.md")
with open(md_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Generated: {md_path}")

# Print summary
print("\n" + "="*60)
print("NELSON SECTION SUMMARY")
print("="*60)
for section in sorted_sections:
    count = section_counts[section]
    total_marks = sum(q['marks'] for q in all_classified if q['nelson_section'] == section)
    print(f"{section}: {count} questions ({total_marks} marks)")

print("\n" + "="*60)
print("TOP 20 NELSON CHAPTERS")
print("="*60)
chapter_counts = Counter((q['nelson_section'], q['nelson_chapter']) for q in all_classified)
for (section, chapter), count in chapter_counts.most_common(20):
    total_marks = sum(q['marks'] for q in all_classified if q['nelson_chapter'] == chapter)
    print(f"{chapter}: {count} questions ({total_marks} marks)")

print("\nDone!")
