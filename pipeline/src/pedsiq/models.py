"""PedsIQ data models — type-safe Pydantic schemas for the entire pipeline."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class QuestionFormat(str, Enum):
    """Primary dimension: physical question format on the exam paper."""

    ESSAY = "essay"
    STRUCTURED_ESSAY = "structured_essay"
    SHORT_NOTE = "short_note"
    BRIEF_ANSWER = "brief_answer"
    MCQ = "mcq"
    ASSERTION_REASON = "assertion_reason"
    DRAW_LABEL = "draw_label"
    CASE_VIGNETTE = "case_vignette"
    UNKNOWN = "unknown"


class BloomLevel(str, Enum):
    """Secondary dimension: cognitive level per Bloom's taxonomy."""

    RECALL = "recall"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"


class ContentDepth(str, Enum):
    """Tertiary dimension: depth of content expected in the answer."""

    FACTUAL = "factual"
    PROCEDURAL = "procedural"
    DIAGNOSTIC = "diagnostic"
    INTEGRATIVE = "integrative"


class MarkAllocation(BaseModel):
    """Breakdown of marks within a question, e.g. (2+4+4=10)."""

    sub_part: str | None = Field(
        default=None, description="Label like 'a', 'b', 'c' or None for single question"
    )
    marks: float = Field(..., description="Marks allocated to this sub-part")
    topic_hint: str | None = Field(
        default=None, description="Topic hint from mark allocation, e.g. 'clinical features'"
    )


class SubPart(BaseModel):
    """An individual sub-part of a structured question."""

    label: str = Field(..., description="Sub-part label, e.g. 'a', 'b', 'c'")
    text: str = Field(..., description="Full text of the sub-part question")
    marks: float | None = Field(None, description="Marks if parsable from allocation")


class ExamMetadata(BaseModel):
    """Metadata about a single exam paper."""

    filename: str
    qp_code: str | None = None
    year: int | None = None
    month: str | None = None
    scheme: str | None = None
    total_marks: float | None = None
    duration: int | None = Field(default=None, description="Duration in hours")
    exam_type: str | None = None


class ParsedQuestion(BaseModel):
    """A single question extracted from an exam paper."""

    section: str = Field(..., description="Section name, e.g. 'Essay', 'Short Notes'")
    question_number: int | str
    question_text: str
    marks_total: float
    marks_breakdown: list[MarkAllocation] = Field(default_factory=list)
    sub_parts: list[SubPart] | None = None
    format: QuestionFormat = QuestionFormat.UNKNOWN
    bloom_level: BloomLevel = BloomLevel.RECALL
    content_depth: ContentDepth = ContentDepth.FACTUAL
    exam_year: int | None = None
    exam_month: str | None = None
    scheme: str | None = None
    qp_code: str | None = None
    total_marks: float | None = None
    filename: str = ""

    @field_validator("marks_breakdown", mode="before")
    @classmethod
    def _ensure_list(cls, v: Any) -> list[Any]:
        return v if isinstance(v, list) else []


class SectionHeader(BaseModel):
    """A section header found in an exam paper."""

    name: str
    raw_header: str
    num_questions: int | None = None
    marks_each: float | None = None
    total_marks: float | None = None


class ValidationStatus(str, Enum):
    PASS = "pass"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class ValidationResult(BaseModel):
    """Result of validating a parsed exam paper."""

    status: ValidationStatus
    message: str
    severity: ValidationStatus
    filename: str
    questions_expected: int | None = None
    questions_found: int | None = None
    marks_expected: float | None = None
    marks_found: float | None = None


class ConceptCategory(str, Enum):
    DISEASE = "disease"
    SYNDROME = "syndrome"
    INVESTIGATION = "investigation"
    TREATMENT = "treatment"
    PROCEDURE = "procedure"
    ANATOMY = "anatomy"
    PHYSIOLOGY = "physiology"
    PATHOPHYSIOLOGY = "pathophysiology"
    SIGN_SYMPTOM = "sign_symptom"
    VACCINE = "vaccine"
    NUTRITION = "nutrition"
    PROGRAM = "program"


class RelationType(str, Enum):
    IS_A = "is_a"
    CAUSES = "causes"
    TREATED_BY = "treated_by"
    DIAGNOSED_BY = "diagnosed_by"
    HAS_SYMPTOM = "has_symptom"
    HAS_SIGN = "has_sign"
    HAS_COMPLICATION = "has_complication"
    CONTRAINDICATES = "contraindicates"
    EXAMINED_IN = "examined_in"
    RELATED_TO = "related_to"


class MedicalConcept(BaseModel):
    """A node in the pediatric knowledge graph."""

    id: str = Field(..., description="URL-safe kebab-case ID")
    name: str = Field(..., description="Display name")
    category: ConceptCategory
    synonyms: list[str] = Field(default_factory=list)
    definition: str | None = None
    related_concepts: list[str] = Field(default_factory=list)
    nelson_chapter: str | None = None
    exam_frequency: int = 0
    exam_years: list[int] = Field(default_factory=list)
    examiner_traps: list[str] = Field(default_factory=list)


class ConceptRelationship(BaseModel):
    """An edge in the pediatric knowledge graph."""

    source: str
    target: str
    relation_type: RelationType
    evidence: list[str] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class KnowledgeGraph(BaseModel):
    """The complete pediatric knowledge graph."""

    concepts: dict[str, MedicalConcept] = Field(default_factory=dict)
    relationships: list[ConceptRelationship] = Field(default_factory=list)
    version: str = "1.0.0"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def add_concept(self, concept: MedicalConcept) -> None:
        self.concepts[concept.id] = concept

    def add_relationship(self, rel: ConceptRelationship) -> None:
        self.relationships.append(rel)

    def get_related(self, concept_id: str, relation_type: RelationType | None = None) -> list[str]:
        """Get concept IDs related to the given concept."""
        related: list[str] = []
        for rel in self.relationships:
            if rel.source == concept_id:
                if relation_type is None or rel.relation_type == relation_type:
                    related.append(rel.target)
            elif rel.target == concept_id and rel.relation_type in (
                RelationType.RELATED_TO,
                RelationType.IS_A,
            ):
                if relation_type is None or rel.relation_type == relation_type:
                    related.append(rel.source)
        return related


class PatternInsight(BaseModel):
    """A data-driven insight about exam patterns."""

    concept_id: str
    pattern_strength: str = Field(..., pattern="^(Strong|Moderate|Emerging)$")
    appearances: int
    papers_analyzed: int
    last_appeared: str
    confidence_note: str
    average_marks: float
    years_appeared: list[int]
    co_occurring_concepts: list[str] = Field(default_factory=list)


class PipelineRun(BaseModel):
    """Metadata about a single pipeline execution."""

    run_id: str = Field(default_factory=lambda: datetime.now().isoformat())
    started_at: datetime = Field(default_factory=datetime.now)
    finished_at: datetime | None = Field(default=None)
    stage: str = "init"
    questions_parsed: int = 0
    questions_validated: int = 0
    validation_errors: list[ValidationResult] = Field(default_factory=list)
    status: str = "running"
