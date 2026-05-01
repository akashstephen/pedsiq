"""Extract accurate graph metadata (examiner traps, related concepts) and update topics.ts.

Preserves manual frequencies (they're accurate).
Adds graph-derived fields: relatedConcepts, examinerTraps, lastAppeared years.
"""

from __future__ import annotations

import json
from pathlib import Path

from pedsiq.graph.ontology import build_core_graph

# Mapping from topics.ts IDs to ontology concept IDs
TOPIC_TO_CONCEPT = {
    "agn": "agn",
    "nephrotic": "nephrotic_syndrome",
    "rickets": "rickets",
    "hypothyroid": "hypothyroidism",
    "torsion": None,  # Not in ontology
    "hematuria": "hematuria",
    "hypoglycemia": "neonatal_hypoglycemia",
    "intussusception": "intussusception",
    "portal": "portal_hypertension",
    "hus": "hus",
    "biliary": "biliary_atresia",
    "dka": "dka",
}

def main():
    graph = build_core_graph()
    
    # Load insights for years_appeared
    insights_path = Path("output/pattern_insights.json")
    insights = {}
    if insights_path.exists():
        with open(insights_path, "r", encoding="utf-8") as f:
            for item in json.load(f):
                insights[item["concept_id"]] = item
    
    # Build metadata for each topic
    metadata = {}
    for topic_id, concept_id in TOPIC_TO_CONCEPT.items():
        if concept_id is None:
            metadata[topic_id] = {
                "relatedConcepts": [],
                "examinerTraps": [],
                "yearsAppeared": [],
                "note": "Not yet mapped in knowledge graph",
            }
            continue
            
        concept = graph.concepts.get(concept_id)
        if not concept:
            metadata[topic_id] = {
                "relatedConcepts": [],
                "examinerTraps": [],
                "yearsAppeared": [],
                "note": f"Concept {concept_id} not found",
            }
            continue
        
        insight = insights.get(concept_id, {})
        
        # Get related concept names (resolve IDs to names)
        related_names = []
        for rc_id in concept.related_concepts:
            if rc_id in graph.concepts:
                related_names.append(graph.concepts[rc_id].name)
            else:
                related_names.append(rc_id.replace("_", " ").title())
        
        metadata[topic_id] = {
            "relatedConcepts": related_names[:6],
            "examinerTraps": concept.examiner_traps[:5],
            "yearsAppeared": insight.get("years_appeared", []),
            "nelsonChapter": concept.nelson_chapter or "",
        }
    
    # Write metadata JSON for the frontend
    output_path = Path("../web/src/data/topic_graph_metadata.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"Written graph metadata to {output_path}")
    print("\nSummary:")
    for topic_id, meta in metadata.items():
        traps = len(meta.get("examinerTraps", []))
        related = len(meta.get("relatedConcepts", []))
        years = len(meta.get("yearsAppeared", []))
        print(f"  {topic_id}: {traps} traps, {related} related, {years} years")

if __name__ == "__main__":
    main()
