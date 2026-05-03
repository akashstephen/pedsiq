"""Multi-dimensional question taxonomy — format, cognitive level, content depth."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pedsiq.models import ParsedQuestion

from pedsiq.models import BloomLevel, ContentDepth, QuestionFormat


# ---------------------------------------------------------------------------
# Format classification heuristics
# ---------------------------------------------------------------------------

SECTION_FORMAT_MAP: dict[str, QuestionFormat] = {
    "essay": QuestionFormat.ESSAY,
    "long essays": QuestionFormat.STRUCTURED_ESSAY,
    "short essays": QuestionFormat.STRUCTURED_ESSAY,
    "short notes": QuestionFormat.SHORT_NOTE,
    "answer briefly": QuestionFormat.BRIEF_ANSWER,
    "precise answers": QuestionFormat.BRIEF_ANSWER,
    "one word answers": QuestionFormat.BRIEF_ANSWER,
    "mcqs": QuestionFormat.MCQ,
    "draw and label": QuestionFormat.DRAW_LABEL,
}

ASSERTION_REASON_PATTERNS = [
    re.compile(r"assertion\s*[:\-]?\s*.+?reason\s*[:\-]?", re.IGNORECASE | re.DOTALL),
    re.compile(r"reason\s*[:\-]?\s*.+?assertion\s*[:\-]?", re.IGNORECASE | re.DOTALL),
    re.compile(r"\bA\b[\.\)]\s*.+?\bR\b[\.\)]\s*", re.IGNORECASE | re.DOTALL),
]

CASE_VIGNETTE_PATTERNS = [
    re.compile(r"\b\d+[-\s]?year[-\s]?old\b", re.IGNORECASE),
    re.compile(r"\b\d+[-\s]?month[-\s]?old\b", re.IGNORECASE),
    re.compile(r"\b\d+[-\s]?day[-\s]?old\b", re.IGNORECASE),
    re.compile(r"presented with|brought with|admitted with", re.IGNORECASE),
    re.compile(r"O/E|on examination|examination reveals", re.IGNORECASE),
]

# ---------------------------------------------------------------------------
# Bloom's level classification — verb-based + structure-based
# ---------------------------------------------------------------------------

BLOOM_KEYWORDS: dict[BloomLevel, list[str]] = {
    BloomLevel.RECALL: [
        "define", "list", "name", "identify", "state", "mention", "enumerate",
        "what is", "what are",
    ],
    BloomLevel.UNDERSTAND: [
        "explain", "describe", "discuss", "compare", "contrast", "differentiate",
        "distinguish", "outline", "summarize",
    ],
    BloomLevel.APPLY: [
        "apply", "demonstrate", "calculate", "interpret", "use", "illustrate",
        "how will you manage", "how will you investigate", "approach",
    ],
    BloomLevel.ANALYZE: [
        "analyze", "evaluate", "investigate", "diagnose", "differentiate diagnosis",
        "differential diagnosis", "interpret", "critique", "why",
    ],
    BloomLevel.EVALUATE: [
        "evaluate", "justify", "recommend", "critique", "synthesize",
        "compare and contrast management", "prioritize",
    ],
}

# ---------------------------------------------------------------------------
# Content depth classification
# ---------------------------------------------------------------------------

CONTENT_DEPTH_PATTERNS: dict[ContentDepth, list[str]] = {
    ContentDepth.FACTUAL: [
        "define", "list", "name", "enumerate", "mention", "classify",
        "draw and label", "components of",
    ],
    ContentDepth.PROCEDURAL: [
        "management", "treatment", "protocol", "algorithm", "steps",
        "how will you manage", "immediate management", "long-term management",
    ],
    ContentDepth.DIAGNOSTIC: [
        "diagnosis", "differential diagnosis", "investigations", "lab findings",
        "diagnostic criteria", "how will you investigate", "interpret",
    ],
    ContentDepth.INTEGRATIVE: [
        "etiopathogenesis", "pathophysiology", "clinical features",
        "investigations and management", "aetiology", "pathogenesis",
        "discuss the", "comprehensive",
    ],
}


def classify_format(question: ParsedQuestion) -> QuestionFormat:
    """Classify question format from section header + text patterns."""
    section = question.section.lower().strip()

    # Primary: section header mapping
    for key, fmt in SECTION_FORMAT_MAP.items():
        if key in section:
            # Override for assertion-reason within any section
            if _is_assertion_reason(question.question_text):
                return QuestionFormat.ASSERTION_REASON
            return fmt

    # Secondary: text-based detection
    if _is_assertion_reason(question.question_text):
        return QuestionFormat.ASSERTION_REASON

    if _is_case_vignette(question.question_text):
        return QuestionFormat.CASE_VIGNETTE

    if question.sub_parts and len(question.sub_parts) > 1:
        return QuestionFormat.STRUCTURED_ESSAY

    return QuestionFormat.UNKNOWN


def classify_bloom(question: ParsedQuestion) -> BloomLevel:
    """Classify Bloom's cognitive level from question text."""
    text = question.question_text.lower()

    scores: dict[BloomLevel, int] = {level: 0 for level in BloomLevel}

    for level, keywords in BLOOM_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[level] += 1

    # Tie-breaker: mark allocation hints at depth
    if question.marks_total >= 10:
        scores[BloomLevel.ANALYZE] += 1
    elif question.marks_total <= 2:
        scores[BloomLevel.RECALL] += 1

    # Sub-parts with multiple domains suggest higher level
    if question.sub_parts and len(question.sub_parts) >= 3:
        scores[BloomLevel.ANALYZE] += 1

    max_score = max(scores.values())
    candidates = [level for level, score in scores.items() if score == max_score]
    # Deterministic tie-breaker: prefer higher cognitive level when tied
    bloom_order = [BloomLevel.EVALUATE, BloomLevel.ANALYZE, BloomLevel.APPLY, BloomLevel.UNDERSTAND, BloomLevel.RECALL]
    for level in bloom_order:
        if level in candidates:
            return level
    return BloomLevel.RECALL


def classify_content_depth(question: ParsedQuestion) -> ContentDepth:
    """Classify content depth from question text."""
    text = question.question_text.lower()

    scores: dict[ContentDepth, int] = {depth: 0 for depth in ContentDepth}

    for depth, keywords in CONTENT_DEPTH_PATTERNS.items():
        for kw in keywords:
            if kw in text:
                scores[depth] += 1

    # Integrative questions usually have high marks + multiple sub-parts
    if question.marks_total >= 10 and question.sub_parts and len(question.sub_parts) >= 3:
        scores[ContentDepth.INTEGRATIVE] += 2

    return max(scores, key=lambda k: scores[k])


def classify_question(question: ParsedQuestion) -> ParsedQuestion:
    """Run full multi-dimensional classification on a question."""
    question.format = classify_format(question)
    question.bloom_level = classify_bloom(question)
    question.content_depth = classify_content_depth(question)
    return question


def _is_assertion_reason(text: str) -> bool:
    """Detect assertion-reason format."""
    for pattern in ASSERTION_REASON_PATTERNS:
        if pattern.search(text):
            return True
    return False


def _is_case_vignette(text: str) -> bool:
    """Detect clinical case vignette format."""
    matches = 0
    for pattern in CASE_VIGNETTE_PATTERNS:
        if pattern.search(text):
            matches += 1
    return matches >= 2
