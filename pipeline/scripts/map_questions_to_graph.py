"""Map existing KUHS questions to the knowledge graph and compute centrality.

This script:
  1. Loads the 411 existing questions from web/src/data/questions.json
  2. Maps each question to concepts using keyword + synonym matching
  3. Updates concept frequencies and years in the graph
  4. Computes PageRank-style centrality
  5. Generates PatternInsight objects for top concepts
  6. Exports enriched graph and insights to JSON

Usage:
    cd pipeline && source .venv/bin/activate
    python scripts/map_questions_to_graph.py
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

from pedsiq.graph.ontology import build_core_graph
from pedsiq.models import KnowledgeGraph, MedicalConcept, PatternInsight


# ---------------------------------------------------------------------------
# Question → Concept mapper
# ---------------------------------------------------------------------------

def map_question_to_concepts(
    question_text: str, graph: KnowledgeGraph
) -> list[tuple[str, float]]:
    """Map a question text to concepts in the knowledge graph.

    Returns list of (concept_id, confidence_score) tuples.
    """
    text_lower = question_text.lower()
    matches: list[tuple[str, float]] = []

    for concept_id, concept in graph.concepts.items():
        score = 0.0

        # Direct name match
        if concept.name.lower() in text_lower:
            score += 3.0

        # Synonym matches
        for syn in concept.synonyms:
            if syn.lower() in text_lower:
                score += 2.5

        # Related concept name matches (weaker signal)
        for related_id in concept.related_concepts:
            if related_id in graph.concepts:
                related = graph.concepts[related_id]
                if related.name.lower() in text_lower:
                    score += 0.5

        if score > 0:
            matches.append((concept_id, score))

    # Normalize scores
    if matches:
        max_score = max(m[1] for m in matches)
        matches = [(cid, s / max_score) for cid, s in matches]

    # Sort by score descending
    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


# ---------------------------------------------------------------------------
# Graph enrichment
# ---------------------------------------------------------------------------

def enrich_graph_with_questions(graph: KnowledgeGraph, questions: list[dict]) -> None:
    """Update graph concepts with exam frequency data from questions."""
    concept_years: dict[str, set[int]] = defaultdict(set)
    concept_question_counts: Counter[str] = Counter()

    for q in questions:
        text = q.get("question_text", "")
        year = q.get("exam_year")
        matches = map_question_to_concepts(text, graph)

        for concept_id, confidence in matches:
            if confidence >= 0.5:  # Threshold for reliable mapping
                concept_question_counts[concept_id] += 1
                if year:
                    concept_years[concept_id].add(year)

    # Update concept attributes
    for concept_id, count in concept_question_counts.most_common():
        if concept_id in graph.concepts:
            concept = graph.concepts[concept_id]
            concept.exam_frequency = count
            concept.exam_years = sorted(concept_years.get(concept_id, set()))


def compute_centrality(graph: KnowledgeGraph) -> dict[str, float]:
    """Compute simple degree centrality for each concept."""
    centrality: dict[str, float] = {}
    for concept_id in graph.concepts:
        degree = len(graph.get_related(concept_id))
        centrality[concept_id] = degree
    return centrality


# ---------------------------------------------------------------------------
# Pattern insight generation
# ---------------------------------------------------------------------------

def generate_pattern_insights(
    graph: KnowledgeGraph, questions: list[dict]
) -> list[PatternInsight]:
    """Generate pattern insights for concepts with exam frequency data."""
    insights: list[PatternInsight] = []

    # Total papers analyzed
    papers = set()
    for q in questions:
        year = q.get("exam_year")
        month = q.get("exam_month")
        if year and month:
            papers.add(f"{year}-{month}")
    papers_analyzed = len(papers) if papers else 24

    for concept_id, concept in graph.concepts.items():
        if concept.exam_frequency == 0:
            continue

        freq = concept.exam_frequency
        total_q = len(questions)
        percentage = (freq / total_q) * 100 if total_q > 0 else 0

        # Pattern strength classification
        if freq >= 20:
            strength = "Strong"
        elif freq >= 8:
            strength = "Moderate"
        else:
            strength = "Emerging"

        last_appeared = str(max(concept.exam_years)) if concept.exam_years else "N/A"

        confidence_note = (
            f"Appeared in {freq} of {total_q} questions ({percentage:.1f}%). "
        )
        if strength == "Strong":
            confidence_note += "Core syllabus topic with consistent historical presence."
        elif strength == "Moderate":
            confidence_note += "Moderate historical presence; may vary by exam cycle."
        else:
            confidence_note += "Low sample size; study for completeness, not pattern confidence."

        insights.append(
            PatternInsight(
                concept_id=concept_id,
                pattern_strength=strength,  # type: ignore[arg-type]
                appearances=freq,
                papers_analyzed=papers_analyzed,
                last_appeared=last_appeared,
                confidence_note=confidence_note,
                average_marks=0.0,  # Would need marks data per concept
                years_appeared=concept.exam_years,
                co_occurring_concepts=concept.related_concepts[:5],
            )
        )

    # Sort by appearances descending
    insights.sort(key=lambda x: x.appearances, reverse=True)
    return insights


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Paths
    questions_path = Path("../web/src/data/questions.json")
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    # Load questions
    with open(questions_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} questions from {questions_path}")

    # Build and enrich graph
    graph = build_core_graph()
    print(f"Built core graph with {len(graph.concepts)} concepts")

    enrich_graph_with_questions(graph, questions)
    print("Enriched graph with question mappings")

    # Compute centrality
    centrality = compute_centrality(graph)
    top_central = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:15]
    print("\nTop 15 concepts by degree centrality:")
    for concept_id, cent in top_central:
        concept = graph.concepts[concept_id]
        print(f"  {concept.name}: degree={cent}, frequency={concept.exam_frequency}")

    # Generate insights
    insights = generate_pattern_insights(graph, questions)
    print(f"\nGenerated {len(insights)} pattern insights")

    # Export
    with open(output_dir / "graph_enriched.json", "w", encoding="utf-8") as f:
        json.dump(graph.model_dump(mode="json"), f, indent=2, ensure_ascii=False)

    with open(output_dir / "pattern_insights.json", "w", encoding="utf-8") as f:
        json.dump([insight.model_dump() for insight in insights], f, indent=2, ensure_ascii=False)

    print(f"\nExported to {output_dir}/")


if __name__ == "__main__":
    main()
