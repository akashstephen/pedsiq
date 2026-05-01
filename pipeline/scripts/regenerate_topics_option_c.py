"""Regenerate the 12 structured-answer topics from graph centrality (Option C).

This script:
  1. Loads enriched graph and pattern insights
  2. Ranks concepts by combined score: frequency + centrality + recency
  3. Selects top 12 ensuring subject diversity
  4. Maps selected concepts to existing topic content where available
  5. Generates a new topics.ts-ready JSON output

Usage:
    cd pipeline && source .venv/bin/activate
    python scripts/regenerate_topics_option_c.py
"""

from __future__ import annotations

import json
from pathlib import Path

from pedsiq.graph.ontology import build_core_graph
from pedsiq.models import KnowledgeGraph


# Mapping from concept IDs to existing topic IDs (for content reuse)
CONCEPT_TO_TOPIC_ID: dict[str, str] = {
    "agn": "agn",
    "nephrotic_syndrome": "nephrotic",
    "rickets": "rickets",
    "hypothyroidism": "hypothyroid",
    "testicular_torsion": "torsion",
    "hematuria": "hematuria",
    "hypoglycemia": "hypoglycemia",
    "intussusception": "intussusception",
    "portal_hypertension": "portal",
    "hus": "hus",
    "biliary_atresia": "biliary",
    "dka": "dka",
}

# Subject mapping for diversity enforcement
CATEGORY_TO_SUBJECT: dict[str, str] = {
    "disease": "Nephrology",
    "syndrome": "Nephrology",
    "sign_symptom": "Nephrology",
    "investigation": "Diagnostics",
    "treatment": "Therapeutics",
    "procedure": "Procedures",
    "anatomy": "Anatomy",
    "physiology": "Physiology",
    "pathophysiology": "Pathophysiology",
    "vaccine": "Immunization",
    "nutrition": "Nutrition",
    "program": "Public Health",
}


def compute_combined_score(
    concept_id: str, graph: KnowledgeGraph, centrality: dict[str, float]
) -> float:
    """Compute combined score for topic selection.

    Score = frequency * 0.5 + centrality * 2.0 + recency_bonus
    """
    concept = graph.concepts[concept_id]
    freq = concept.exam_frequency
    cent = centrality.get(concept_id, 0.0)

    # Recency bonus: more recent = higher score
    recency_bonus = 0.0
    if concept.exam_years:
        latest = max(concept.exam_years)
        if latest >= 2024:
            recency_bonus = 3.0
        elif latest >= 2022:
            recency_bonus = 1.5

    # Consistency bonus: appeared in many different years
    year_span = len(concept.exam_years) if concept.exam_years else 0
    consistency_bonus = min(year_span * 0.3, 3.0)

    return freq * 0.5 + cent * 2.0 + recency_bonus + consistency_bonus


def select_top_12(graph: KnowledgeGraph) -> list[str]:
    """Select top 12 concepts ensuring category diversity."""
    centrality: dict[str, float] = {}
    for concept_id in graph.concepts:
        centrality[concept_id] = len(graph.get_related(concept_id))

    scored = [
        (cid, compute_combined_score(cid, graph, centrality))
        for cid in graph.concepts
        if graph.concepts[cid].exam_frequency > 0
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    selected: list[str] = []
    subject_counts: dict[str, int] = {}

    for concept_id, score in scored:
        if len(selected) >= 12:
            break

        concept = graph.concepts[concept_id]
        subject = CATEGORY_TO_SUBJECT.get(concept.category.value, "Other")

        # Diversity rule: max 2 from same subject
        if subject_counts.get(subject, 0) >= 2:
            continue

        selected.append(concept_id)
        subject_counts[subject] = subject_counts.get(subject, 0) + 1

    return selected


def generate_topic_metadata(concept_id: str, graph: KnowledgeGraph) -> dict:
    """Generate topic metadata for a selected concept."""
    concept = graph.concepts[concept_id]
    total_q = 411  # Known total
    freq = concept.exam_frequency
    percentage = (freq / total_q) * 100 if total_q > 0 else 0

    if freq >= 20:
        strength = "Strong"
    elif freq >= 8:
        strength = "Moderate"
    else:
        strength = "Emerging"

    last_appeared = str(max(concept.exam_years)) if concept.exam_years else "N/A"
    papers = len(set(concept.exam_years)) if concept.exam_years else 0

    confidence_note = (
        f"Graph-derived topic (Option C). Appeared in {freq} of {total_q} questions ({percentage:.1f}%). "
        f"Degree centrality: {len(graph.get_related(concept_id))}. "
    )
    if strength == "Strong":
        confidence_note += "High connectivity in knowledge graph + consistent exam presence."
    elif strength == "Moderate":
        confidence_note += "Moderate graph connectivity and exam presence."
    else:
        confidence_note += "Low sample size; selected for graph centrality and syllabus completeness."

    return {
        "id": CONCEPT_TO_TOPIC_ID.get(concept_id, concept_id),
        "shortTitle": concept.name,
        "patternStrength": strength,
        "historicalFrequency": {
            "appearances": freq,
            "papersAnalyzed": papers,
            "lastAppeared": last_appeared,
        },
        "confidenceNote": confidence_note,
        "subject": CATEGORY_TO_SUBJECT.get(concept.category.value, "Other"),
        "examType": "Essay / Short Note",
        "question": f"Discuss {concept.name} in children.",
        "marksBreakdown": "Definition → 2M | Clinical Features → 3M | Investigations → 2M | Management → 3M",
        "nelsonChapter": concept.nelson_chapter or "",
        "examinerTraps": concept.examiner_traps,
        "relatedConcepts": concept.related_concepts[:5],
    }


def main() -> None:
    graph = build_core_graph()

    # Load enriched data if available
    enriched_path = Path("output/graph_enriched.json")
    if enriched_path.exists():
        with open(enriched_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Update graph with enriched data
        for cid, cdata in data.get("concepts", {}).items():
            if cid in graph.concepts:
                graph.concepts[cid].exam_frequency = cdata.get("exam_frequency", 0)
                graph.concepts[cid].exam_years = cdata.get("exam_years", [])

    selected = select_top_12(graph)

    print("=" * 60)
    print("OPTION C: Top 12 Topics from Graph Centrality")
    print("=" * 60)

    topics: list[dict] = []
    for i, concept_id in enumerate(selected, 1):
        concept = graph.concepts[concept_id]
        topic = generate_topic_metadata(concept_id, graph)
        topics.append(topic)

        print(f"\n{i}. {concept.name} (ID: {concept_id})")
        print(f"   Frequency: {concept.exam_frequency} questions")
        print(f"   Centrality (degree): {len(graph.get_related(concept_id))}")
        print(f"   Years: {concept.exam_years}")
        print(f"   Pattern: {topic['patternStrength']}")
        print(f"   Nelson: {concept.nelson_chapter or 'N/A'}")

        # Check if we have existing content
        existing_id = CONCEPT_TO_TOPIC_ID.get(concept_id)
        if existing_id:
            print(f"   ✅ Existing content available (ID: {existing_id})")
        else:
            print(f"   ⚠️  New topic — content needs to be created")

    # Export
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / "regenerated_topics.json", "w", encoding="utf-8") as f:
        json.dump(topics, f, indent=2, ensure_ascii=False)

    print(f"\nExported to {output_dir}/regenerated_topics.json")


if __name__ == "__main__":
    main()
