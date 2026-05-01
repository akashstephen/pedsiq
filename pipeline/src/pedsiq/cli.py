"""PedsIQ CLI — pipeline orchestration with Typer."""

from __future__ import annotations

from pathlib import Path

import structlog
import typer
from rich.console import Console
from rich.table import Table

from pedsiq.classify.taxonomy import classify_question
from pedsiq.extract.pdf_parser import parse_exam_paper
from pedsiq.extract.validators import validate_paper
from pedsiq.graph.ontology import build_core_graph
from pedsiq.models import PipelineRun

logger = structlog.get_logger()
console = Console()
app = typer.Typer(help="PedsIQ data pipeline — from PDF to knowledge graph")


@app.command()
def parse(
    pdf: Path = typer.Argument(..., help="Path to KUHS exam PDF"),
    output: Path = typer.Option(Path("parsed.json"), "--output", "-o", help="Output JSON path"),
) -> None:
    """Parse a single exam PDF."""
    logger.info("parse_start", pdf=str(pdf))
    
    if not pdf.exists():
        console.print(f"[red]File not found:[/red] {pdf}")
        raise typer.Exit(1)
    
    metadata, questions = parse_exam_paper(pdf)
    console.print(f"[green]Parsed {len(questions)} questions from {pdf.name}[/green]")
    
    import json
    with open(output, "w", encoding="utf-8") as f:
        json.dump(
            {
                "metadata": metadata.model_dump(),
                "questions": [q.model_dump() for q in questions],
            },
            f,
            indent=2,
            ensure_ascii=False,
        )
    console.print(f"[blue]Saved to {output}[/blue]")


@app.command()
def validate(
    pdf: Path = typer.Argument(..., help="Path to KUHS exam PDF"),
) -> None:
    """Parse and validate an exam PDF."""
    logger.info("validate_start", pdf=str(pdf))
    metadata, questions = parse_exam_paper(pdf)
    result = validate_paper(metadata, questions)
    
    color = {
        "pass": "green",
        "warning": "yellow",
        "error": "red",
        "critical": "red",
    }.get(result.status.value, "white")
    
    console.print(f"[{color}]Validation: {result.status.value.upper()}[/[{color}]]")
    console.print(f"  {result.message}")
    console.print(f"  Expected: {result.questions_expected}, Found: {result.questions_found}")


@app.command()
def classify(
    input_json: Path = typer.Argument(..., help="Parsed questions JSON"),
    output_json: Path = typer.Option(Path("classified.json"), "--output", "-o"),
) -> None:
    """Classify parsed questions with multi-dimensional taxonomy."""
    import json
    
    with open(input_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    from pedsiq.models import ParsedQuestion
    
    questions = [ParsedQuestion(**q) for q in data["questions"]]
    classified = [classify_question(q) for q in questions]
    
    # Summary table
    table = Table(title="Classification Summary")
    table.add_column("Format", style="cyan")
    table.add_column("Bloom's", style="magenta")
    table.add_column("Content", style="green")
    table.add_column("Count", justify="right")
    
    from collections import Counter
    
    format_counts = Counter(q.format.value for q in classified)
    bloom_counts = Counter(q.bloom_level.value for q in classified)
    content_counts = Counter(q.content_depth.value for q in classified)
    
    for fmt, count in format_counts.most_common():
        table.add_row(fmt, "", "", str(count))
    
    console.print(table)
    
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(
            {"questions": [q.model_dump() for q in classified]},
            f,
            indent=2,
            ensure_ascii=False,
        )


@app.command()
def graph(
    output_json: Path = typer.Option(Path("graph.json"), "--output", "-o"),
) -> None:
    """Build and export the knowledge graph."""
    kg = build_core_graph()
    console.print(f"[green]Knowledge graph built:[/green] {len(kg.concepts)} concepts, {len(kg.relationships)} relationships")
    
    import json
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(kg.model_dump(), f, indent=2, ensure_ascii=False)
    console.print(f"[blue]Saved to {output_json}[/blue]")


@app.command()
def run(
    input_dir: Path = typer.Argument(..., help="Directory containing KUHS PDFs"),
    output_dir: Path = typer.Option(Path("output"), "--output", "-o"),
) -> None:
    """Run the full pipeline: parse → classify → validate → graph."""
    from pedsiq.models import ParsedQuestion
    
    output_dir.mkdir(parents=True, exist_ok=True)
    run_meta = PipelineRun(stage="parse")
    
    pdfs = sorted(input_dir.glob("*.pdf"))
    console.print(f"[blue]Found {len(pdfs)} PDFs[/blue]")
    
    all_questions: list[ParsedQuestion] = []
    
    for pdf in pdfs:
        console.print(f"Parsing {pdf.name}...")
        try:
            metadata, questions = parse_exam_paper(pdf)
            validated = validate_paper(metadata, questions)
            if validated.status.value in ("error", "critical"):
                console.print(f"  [red]{validated.message}[/red]")
            else:
                console.print(f"  [green]{len(questions)} questions parsed[/green]")
            
            classified = [classify_question(q) for q in questions]
            all_questions.extend(classified)
        except Exception as e:
            logger.error("parse_failed", pdf=str(pdf), error=str(e))
            console.print(f"  [red]Failed: {e}[/red]")
    
    # Export
    import json
    with open(output_dir / "questions.json", "w", encoding="utf-8") as f:
        json.dump([q.model_dump() for q in all_questions], f, indent=2, ensure_ascii=False)
    
    # Build graph
    kg = build_core_graph()
    with open(output_dir / "graph.json", "w", encoding="utf-8") as f:
        json.dump(kg.model_dump(), f, indent=2, ensure_ascii=False)
    
    run_meta.questions_parsed = len(all_questions)
    run_meta.status = "completed"
    
    console.print(f"[green]Pipeline complete: {len(all_questions)} questions, {len(kg.concepts)} concepts[/green]")


def main() -> None:
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    app()


if __name__ == "__main__":
    main()
