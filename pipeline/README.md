# PedsIQ Pipeline

Modern data pipeline for PedsIQ — from KUHS PDF ingestion to knowledge graph analysis.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Commands

```bash
# Parse a single PDF
pedsiq parse exam_2024.pdf --output parsed.json

# Validate parsing
pedsiq validate exam_2024.pdf

# Classify questions
pedsiq classify parsed.json --output classified.json

# Build knowledge graph
pedsiq graph --output graph.json

# Run full pipeline
pedsiq run /path/to/pdfs/ --output output/
```

## Architecture

- `extract/` — PDF parsing with sub-part extraction and mark allocation parsing
- `classify/` — Multi-dimensional taxonomy (Format × Bloom's × Content Depth)
- `graph/` — Pediatric knowledge graph (self-curated, no UMLS)
- `analyze/` — Pattern analysis and backtesting
