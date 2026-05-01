"""Rebuild questions.json using the new pipeline + existing Nelson classification.

This script:
  1. Runs new extract on all 24 PDFs
  2. Runs new classify (taxonomy) on each question
  3. Merges with existing nelson_section / nelson_chapter from old data
  4. Validates output
  5. Writes new web/src/data/questions.json

Usage:
    cd pipeline && source .venv/bin/activate
    python scripts/rebuild_questions.py
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

from pedsiq.classify.taxonomy import classify_question
from pedsiq.extract.pdf_parser import parse_exam_paper
from pedsiq.extract.validators import validate_paper
from pedsiq.models import ParsedQuestion


def load_old_questions() -> dict[tuple[str, int | str], dict]:
    """Load old questions indexed by (filename, question_number) for Nelson mapping lookup."""
    old_path = Path("../web/src/data/questions.json")
    with open(old_path, "r", encoding="utf-8") as f:
        old_questions = json.load(f)

    lookup: dict[tuple[str, int | str], dict] = {}
    for q in old_questions:
        key = (q.get("filename", ""), q.get("question_number", 0))
        lookup[key] = q
    return lookup


def merge_nelson_mapping(
    new_question: ParsedQuestion, old_lookup: dict[tuple[str, int | str], dict]
) -> ParsedQuestion:
    """Copy nelson_section and nelson_chapter from old data if available."""
    key = (new_question.filename, new_question.question_number)
    if key in old_lookup:
        old = old_lookup[key]
        # We can't add fields to ParsedQuestion that aren't in the model,
        # so we'll export them separately
        return new_question, old.get("nelson_section"), old.get("nelson_chapter")
    return new_question, None, None


def rebuild() -> None:
    pdf_dir = Path("..")
    # Only parse KUHS exam PDFs (contain year/month in filename), exclude Nelson textbook
    pdfs = sorted([p for p in pdf_dir.glob("*.pdf") if re.search(r"\d{4}_[A-Z]+", p.name)])

    print(f"Found {len(pdfs)} PDFs")

    old_lookup = load_old_questions()
    print(f"Loaded {len(old_lookup)} old questions for Nelson mapping")

    all_new_questions: list[dict] = []
    validation_results = []

    for pdf_path in pdfs:
        print(f"\nParsing {pdf_path.name}...")
        try:
            metadata, questions = parse_exam_paper(pdf_path)
            validated = validate_paper(metadata, questions)
            validation_results.append(validated)

            if validated.status.value in ("error", "critical"):
                print(f"  ⚠️  {validated.message}")
            else:
                print(f"  ✅ {len(questions)} questions parsed")

            for q in questions:
                # Classify with new taxonomy
                classified = classify_question(q)

                # Merge Nelson mapping
                _, nelson_section, nelson_chapter = merge_nelson_mapping(classified, old_lookup)

                # Build export dict
                export = classified.model_dump()
                export["nelson_section"] = nelson_section or "Uncategorized"
                export["nelson_chapter"] = nelson_chapter or "Uncategorized"
                export["sub_parts"] = (
                    [sp.model_dump() for sp in classified.sub_parts]
                    if classified.sub_parts
                    else None
                )
                export["marks_breakdown"] = (
                    [mb.model_dump() for mb in classified.marks_breakdown]
                    if classified.marks_breakdown
                    else None
                )
                # Backward compatibility: old frontend expects 'marks' and 'type'
                export["marks"] = classified.marks_total
                export["type"] = classified.format.value if classified.format else "unknown"

                all_new_questions.append(export)

        except Exception as e:
            print(f"  ❌ Failed: {e}")

    # Summary
    print("\n" + "=" * 60)
    print("REBUILD SUMMARY")
    print("=" * 60)
    print(f"Total questions parsed: {len(all_new_questions)}")
    print(f"Validation results: {len([v for v in validation_results if v.status.value == 'pass'])} pass, "
          f"{len([v for v in validation_results if v.status.value == 'warning'])} warning, "
          f"{len([v for v in validation_results if v.status.value == 'error'])} error")

    # Taxonomy distribution
    format_counts = Counter(q.get("format", "unknown") for q in all_new_questions)
    bloom_counts = Counter(q.get("bloom_level", "unknown") for q in all_new_questions)
    content_counts = Counter(q.get("content_depth", "unknown") for q in all_new_questions)

    print(f"\nFormat distribution:")
    for fmt, count in format_counts.most_common():
        print(f"  {fmt}: {count}")

    print(f"\nBloom's level distribution:")
    for level, count in bloom_counts.most_common():
        print(f"  {level}: {count}")

    print(f"\nContent depth distribution:")
    for depth, count in content_counts.most_common():
        print(f"  {depth}: {count}")

    # Mark breakdown stats
    with_breakdown = sum(1 for q in all_new_questions if q.get("marks_breakdown"))
    print(f"\nQuestions with marks_breakdown: {with_breakdown} / {len(all_new_questions)}")

    # Write output
    output_path = Path("../web/src/data/questions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_new_questions, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Written to {output_path}")


if __name__ == "__main__":
    rebuild()
