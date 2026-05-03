"""Tests for pedsiq data models."""

from __future__ import annotations

import pytest

from pedsiq.models import (
    BloomLevel,
    ConceptCategory,
    ContentDepth,
    KnowledgeGraph,
    MarkAllocation,
    MedicalConcept,
    ParsedQuestion,
    QuestionFormat,
    RelationType,
    ValidationResult,
    ValidationStatus,
)


class TestParsedQuestion:
    def test_create_minimal(self) -> None:
        q = ParsedQuestion(
            section="Essay",
            question_number=1,
            question_text="Describe rickets.",
            marks_total=10.0,
        )
        assert q.section == "Essay"
        assert q.marks_total == 10.0
        assert q.format == QuestionFormat.UNKNOWN

    def test_mark_allocation(self) -> None:
        q = ParsedQuestion(
            section="Essay",
            question_number=1,
            question_text="Describe rickets.",
            marks_total=10.0,
            marks_breakdown=[
                MarkAllocation(marks=2.0),
                MarkAllocation(marks=4.0),
                MarkAllocation(marks=4.0),
            ],
        )
        assert len(q.marks_breakdown) == 3
        assert sum(m.marks for m in q.marks_breakdown) == 10.0


class TestValidationResult:
    def test_pass(self) -> None:
        result = ValidationResult(
            status=ValidationStatus.PASS,
            message="OK",
            severity=ValidationStatus.PASS,
            filename="test.pdf",
            questions_found=17,
        )
        assert result.status == ValidationStatus.PASS


class TestKnowledgeGraph:
    def test_build_and_query(self) -> None:
        graph = KnowledgeGraph()
        concept = MedicalConcept(
            id="agn",
            name="Acute Glomerulonephritis",
            category=ConceptCategory.DISEASE,
        )
        graph.add_concept(concept)
        assert "agn" in graph.concepts
        assert graph.concepts["agn"].name == "Acute Glomerulonephritis"

    def test_relationships(self) -> None:
        graph = KnowledgeGraph()
        graph.add_concept(
            MedicalConcept(id="agn", name="AGN", category=ConceptCategory.DISEASE)
        )
        graph.add_concept(
            MedicalConcept(id="hematuria", name="Hematuria", category=ConceptCategory.SIGN_SYMPTOM)
        )
        from pedsiq.models import ConceptRelationship
        graph.add_relationship(
            ConceptRelationship(
                source="agn",
                target="hematuria",
                relation_type=RelationType.HAS_SYMPTOM,
            )
        )
        related = graph.get_related("agn")
        assert "hematuria" in related


class TestOntology:
    def test_no_duplicate_concept_ids(self) -> None:
        from pedsiq.graph.ontology import CORE_CONCEPTS
        ids = [c.id for c in CORE_CONCEPTS]
        assert len(ids) == len(set(ids)), f"Duplicate concept IDs found: {[i for i in ids if ids.count(i) > 1]}"

    def test_all_concepts_have_category(self) -> None:
        from pedsiq.graph.ontology import CORE_CONCEPTS
        for concept in CORE_CONCEPTS:
            assert concept.category is not None, f"Concept {concept.id} missing category"
