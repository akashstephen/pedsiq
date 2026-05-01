import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

def load_data():
    with open(os.path.join(OUTPUT_DIR, "questions_raw.json"), 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_text(text):
    """Normalize text for comparison."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_topics(text):
    """Extract medical topics from question text."""
    text_lower = text.lower()
    topics_found = []
    
    # Comprehensive topic list with variations
    topic_map = {
        "Acute Flaccid Paralysis (AFP)": ["acute flaccid paralysis", "afp"],
        "Acute Glomerulonephritis (AGN)": ["acute glomerulonephritis", "agn", "post streptococcal"],
        "Acute Rheumatic Fever": ["acute rheumatic fever", "rheumatic fever", "modified jones", "jones criteria"],
        "Anemia": ["anemia", "anaemia", "iron deficiency", "megaloblastic", "folate", "b12 deficiency", "pica", "pagophagia"],
        "APGAR Score": ["apgar"],
        "Asthma": ["asthma", "bronchial asthma"],
        "Breast Feeding": ["breast feeding", "breastfeeding", "bfhi", "ten steps"],
        "Bronchiolitis": ["bronchiolitis"],
        "Burns": ["burn"],
        "Cerebral Palsy": ["cerebral palsy", "cp "],
        "CHD / Congenital Heart Disease": ["congenital heart", "vsd", "asd", "pda", "tetralogy of fallot", "tof", "coarctation"],
        "Cleft Lip/Palate": ["cleft lip", "cleft palate"],
        "Complementary Feeding": ["complementary feeding", "weaning", "solids"],
        "Congenital Hypothyroidism": ["congenital hypothyroidism", "cretinism"],
        "Croup": ["croup"],
        "Cystic Fibrosis": ["cystic fibrosis", "cf "],
        "Dengue": ["dengue", "dengue shock", "dengue hemorrhagic"],
        "Developmental Milestones": ["developmental milestone", "developmental screening", "ddst", "denver"],
        "Diabetes Mellitus": ["diabetes mellitus", "type 1 diabetes", "insulin"],
        "Diarrhea / Dehydration": ["diarrhea", "dehydration", "ors", "oral rehydration", "zinc"],
        "Down Syndrome": ["down syndrome", "trisomy 21"],
        "Drowning": ["drown"],
        "Epiglottitis": ["epiglottitis"],
        "Epilepsy / Seizures": ["epilepsy", "seizure", "febrile seizure", "status epilepticus"],
        "Failure to Thrive": ["failure to thrive", "ftt"],
        "Growth Assessment": ["growth assessment", "growth chart", "who growth", "percentile", "mcp card"],
        "Hand Washing": ["hand washing", "hand hygiene"],
        "Hearing Screening": ["hearing", "hearing impairment", "hearing screening"],
        "Hemophilia": ["hemophilia"],
        "Henoch-Schonlein Purpura": ["henoch schonlein", "purpura", "hsp"],
        "Hepatitis": ["hepatitis a", "hepatitis b", "hepatitis e"],
        "Hirschsprung Disease": ["hirschsprung", "aganglionic", "megacolon"],
        "HIV/AIDS": ["hiv", "aids"],
        "Hospital Associated Infections": ["hospital associated infection", "hai", "nosocomial"],
        "HPV Vaccine": ["hpv vaccine", "human papillomavirus"],
        "Hydrocephalus": ["hydrocephalus"],
        "Hyperbilirubinemia / Jaundice": ["jaundice", "hyperbilirubinemia", "kernicterus", "bilirubin", "phototherapy", "exchange transfusion"],
        "Hypertension": ["hypertension", "blood pressure"],
        "Hypothyroidism": ["hypothyroidism", "hypothyroid"],
        "ICDS / Anganwadi": ["icds", "anganwadi"],
        "IMNCI / IMCI": ["imnci", "imci"],
        "Immunization / Vaccines": ["immunization", "vaccine", "vaccination", "national immunization", "schedule", "pentavalent", "mmr", "bcg", "opv", "rota", "aefi"],
        "Intussusception": ["intussusception"],
        "Iron Deficiency Anemia": ["iron deficiency anemia", "iron deficiency"],
        "ITP (Immune Thrombocytopenia)": ["itp", "immune thrombocytopenia", "idiopathic thrombocytopenic"],
        "Kangaroo Mother Care": ["kangaroo mother care", "kmc"],
        "Kawasaki Disease": ["kawasaki disease", "kawasaki", "mucocutaneous"],
        "Kernicterus": ["kernicterus"],
        "Kwashiorkor": ["kwashiorkor"],
        "LBW / Preterm / Newborn": ["lbw", "elbw", "vlbw", "premature", "preterm", "newborn", "neonate", "nicu", "iuga", "sga", "aga", "lga"],
        "Leukemia": ["leukemia", "all", "aml"],
        "Malaria": ["malaria", "plasmodium", "falciparum", "vivax"],
        "Malnutrition": ["malnutrition", "sam", "mam", "severe acute malnutrition", "mid upper arm", "muac"],
        "Marasmus": ["marasmus"],
        "Measles": ["measles", "koplik", "mmr"],
        "Meningitis": ["meningitis", "pyogenic meningitis", "meningococcal", "csf"],
        "Necrotizing Enterocolitis (NEC)": ["nec", "necrotizing enterocolitis"],
        "Nephrotic Syndrome": ["nephrotic syndrome", "minimal change", "steroid resistant", "steroid dependent"],
        "Newborn Resuscitation": ["resuscitation", "naloxone", "bag and mask"],
        "Obesity": ["obesity", "overweight", "bmi"],
        "ORS": ["ors", "oral rehydration", "low osmolar"],
        "Osteogenesis Imperfecta": ["osteogenesis imperfecta"],
        "Otitis Media": ["otitis media"],
        "Palliative Care": ["palliative", "end of life"],
        "PCOS": ["pcos", "polycystic ovary"],
        "Pertussis / Whooping Cough": ["pertussis", "whooping cough"],
        "Pneumonia / ARI": ["pneumonia", "ari", "alri", "very severe pneumonia"],
        "Poisoning": ["poisoning", "organophosphorus", "kerosene", "snake bite", "scorpion"],
        "Polio": ["polio", "poliomyelitis", "opv", "ipv"],
        "Pyloric Stenosis": ["pyloric stenosis"],
        "Respiratory Distress Syndrome (RDS)": ["rds", "respiratory distress syndrome", "surfactant", "cpap"],
        "Retinoblastoma": ["retinoblastoma", "rb1"],
        "Rickets": ["rickets", "vitamin d deficiency", "vitamin d"],
        "Scrub Typhus": ["scrub typhus"],
        "Scurvy": ["scurvy"],
        "Sepsis / Septicemia": ["sepsis", "septicemia", "neonatal sepsis"],
        "Short Stature": ["short stature", "familial short stature", "constitutional delay"],
        "Sickle Cell Anemia": ["sickle cell"],
        "Status Epilepticus": ["status epilepticus"],
        "Tetanus": ["tetanus"],
        "Thalassemia": ["thalassemia"],
        "Tuberculosis": ["tuberculosis", "tb ", "mantoux", "primary complex", "miliary tb"],
        "Typhoid": ["typhoid", "enteric fever"],
        "UTI / VUR": ["uti", "urinary tract", "vur", "vesicoureteral"],
        "Varicella / Chickenpox": ["varicella", "chickenpox"],
        "Vitamin A Deficiency": ["vitamin a deficiency", "xerophthalmia", "bitot spots", "keratomalacia"],
        "Wilms Tumor": ["wilms tumor", "nephroblastoma"],
        "Zinc Deficiency": ["zinc deficiency", "acrodermatitis"],
        "Medical Ethics": ["medical ethics", "four pillars", "poCSO", "consent", "assent"],
        "Adolescent Health": ["adolescent", "puberty", "menarche", "adolescent friendly"],
        "Newborn Screening": ["newborn screening", "guthrie", "tsh screening"],
        "National Programs": ["national program", "national health mission", "anemia mukt", "poshan", "icds"],
    }
    
    for topic_name, keywords in topic_map.items():
        for keyword in keywords:
            if keyword in text_lower:
                topics_found.append(topic_name)
                break
    
    return topics_found

def analyze_questions(data):
    """Analyze extracted questions for patterns and predictions."""
    questions = data['questions']
    
    # 1. Topic frequency analysis
    topic_counter = Counter()
    topic_marks = defaultdict(float)
    topic_by_year = defaultdict(set)
    
    for q in questions:
        topics = extract_topics(q['question_text'])
        for topic in topics:
            topic_counter[topic] += 1
            topic_marks[topic] += q['marks']
            topic_by_year[topic].add(q['exam_year'])
    
    # 2. Exact/similar question detection
    normalized_questions = {}
    for q in questions:
        norm = normalize_text(q['question_text'])
        if len(norm) > 20:  # Only consider substantial questions
            if norm not in normalized_questions:
                normalized_questions[norm] = []
            normalized_questions[norm].append(q)
    
    repeated = {k: v for k, v in normalized_questions.items() if len(v) > 1}
    
    # 3. Section-wise analysis
    section_analysis = defaultdict(lambda: {"count": 0, "marks": 0, "by_year": defaultdict(int)})
    for q in questions:
        sec = q['section']
        section_analysis[sec]['count'] += 1
        section_analysis[sec]['marks'] += q['marks']
        section_analysis[sec]['by_year'][q['exam_year']] += 1
    
    # 4. High-value questions (most marks)
    high_value = sorted(questions, key=lambda x: x['marks'], reverse=True)[:20]
    
    return {
        "topic_counter": topic_counter,
        "topic_marks": topic_marks,
        "topic_by_year": topic_by_year,
        "repeated": repeated,
        "section_analysis": section_analysis,
        "high_value": high_value
    }

def generate_prediction_report(analysis, data):
    """Generate a prediction report in markdown."""
    lines = []
    lines.append("# Pediatrics Exam Question Analysis & Prediction Report")
    lines.append("")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**Papers Analyzed:** 24 (2015-2025)")
    lines.append(f"**Total Questions:** {len(data['questions'])}")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Top repeated topics
    lines.append("## Top 30 Most Frequently Asked Topics")
    lines.append("")
    lines.append("| Rank | Topic | Times Asked | Total Marks | Years Appeared |")
    lines.append("|------|-------|-------------|-------------|----------------|")
    for i, (topic, count) in enumerate(analysis['topic_counter'].most_common(30), 1):
        marks = analysis['topic_marks'][topic]
        years = sorted(analysis['topic_by_year'][topic])
        years_str = ', '.join(str(y) for y in years)
        lines.append(f"| {i} | {topic} | {count} | {marks} | {years_str} |")
    lines.append("")
    
    # Topics that appeared in recent years (2023-2025) - HIGH YIELD
    lines.append("## High-Yield Topics (Appeared in 2023-2025)")
    lines.append("")
    recent_topics = []
    for topic, years in analysis['topic_by_year'].items():
        if any(y >= 2023 for y in years):
            recent_topics.append((topic, analysis['topic_counter'][topic], analysis['topic_marks'][topic]))
    
    recent_topics.sort(key=lambda x: x[1], reverse=True)
    lines.append("| Topic | Total Appearances | Total Marks | Recent Years |")
    lines.append("|-------|-------------------|-------------|--------------|")
    for topic, count, marks in recent_topics[:30]:
        years = sorted(analysis['topic_by_year'][topic])
        recent_years = [str(y) for y in years if y >= 2023]
        lines.append(f"| {topic} | {count} | {marks} | {', '.join(recent_years)} |")
    lines.append("")
    
    # Topics not asked recently (gap years) - POTENTIAL COMEBACK
    lines.append("## Topics Not Asked Recently (Potential Comeback)")
    lines.append("")
    lines.append("These topics were popular in older papers but haven't appeared in 2023-2025:")
    lines.append("")
    comeback_topics = []
    for topic, years in analysis['topic_by_year'].items():
        if not any(y >= 2023 for y in years):
            if len(years) >= 2:  # Appeared at least twice before
                comeback_topics.append((topic, analysis['topic_counter'][topic], max(years)))
    
    comeback_topics.sort(key=lambda x: x[1], reverse=True)
    lines.append("| Topic | Times Asked | Last Appeared |")
    lines.append("|-------|-------------|---------------|")
    for topic, count, last_year in comeback_topics[:20]:
        lines.append(f"| {topic} | {count} | {last_year} |")
    lines.append("")
    
    # Section-wise trends
    lines.append("## Section-wise Trends")
    lines.append("")
    for section, stats in analysis['section_analysis'].items():
        lines.append(f"### {section}")
        lines.append(f"- Total Questions: {stats['count']}")
        lines.append(f"- Total Marks: {stats['marks']}")
        lines.append(f"- Year Distribution: {dict(sorted(stats['by_year'].items()))}")
        lines.append("")
    
    # Repeated questions
    lines.append("## Directly Repeated / Similar Questions")
    lines.append("")
    if analysis['repeated']:
        for norm_text, qs in list(analysis['repeated'].items())[:15]:
            lines.append(f"### Question (asked {len(qs)} times)")
            lines.append(f"*{qs[0]['question_text']}*")
            lines.append("")
            lines.append("**Appeared in:**")
            for q in qs:
                lines.append(f"- {q['exam_year']} {q['exam_month']} ({q['marks']} marks)")
            lines.append("")
    else:
        lines.append("No exact repetitions found. Questions are typically rephrased.")
    lines.append("")
    
    # Prediction section
    lines.append("---")
    lines.append("")
    lines.append("# Prediction for Next Exam")
    lines.append("")
    lines.append("Based on frequency analysis and recent trends (2023-2025), the following topics have the **highest probability** of appearing:")
    lines.append("")
    
    top_10 = analysis['topic_counter'].most_common(10)
    for i, (topic, count) in enumerate(top_10, 1):
        marks = analysis['topic_marks'][topic]
        years = sorted(analysis['topic_by_year'][topic])
        recent = any(y >= 2024 for y in years)
        trend = "🔥 HOT" if recent else "📈 Recurring"
        lines.append(f"{i}. **{topic}** — Asked {count} times ({marks} total marks) | {trend}")
    lines.append("")
    
    lines.append("## Must-Prepare Topics by Section")
    lines.append("")
    
    # For old format (Essay)
    essay_qs = [q for q in data['questions'] if q['section'] == 'Essay']
    essay_topics = Counter()
    for q in essay_qs:
        for t in extract_topics(q['question_text']):
            essay_topics[t] += 1
    lines.append("### Essay (10 marks)")
    for topic, count in essay_topics.most_common(5):
        lines.append(f"- {topic} ({count} times)")
    lines.append("")
    
    # For new format (Long Essays)
    long_essay_qs = [q for q in data['questions'] if q['section'] == 'Long Essays']
    long_essay_topics = Counter()
    for q in long_essay_qs:
        for t in extract_topics(q['question_text']):
            long_essay_topics[t] += 1
    lines.append("### Long Essays (10-15 marks)")
    for topic, count in long_essay_topics.most_common(5):
        lines.append(f"- {topic} ({count} times)")
    lines.append("")
    
    # Short notes/essays
    short_qs = [q for q in data['questions'] if q['section'] in ['Short Notes', 'Short Essays', 'Short Answers']]
    short_topics = Counter()
    for q in short_qs:
        for t in extract_topics(q['question_text']):
            short_topics[t] += 1
    lines.append("### Short Notes / Short Essays / Short Answers")
    for topic, count in short_topics.most_common(10):
        lines.append(f"- {topic} ({count} times)")
    lines.append("")
    
    # Draw and label
    draw_qs = [q for q in data['questions'] if q['section'] == 'Draw and Label']
    draw_topics = Counter()
    for q in draw_qs:
        for t in extract_topics(q['question_text']):
            draw_topics[t] += 1
    lines.append("### Draw and Label")
    for topic, count in draw_topics.most_common(5):
        lines.append(f"- {topic} ({count} times)")
    lines.append("")
    
    # One word / precise
    ow_qs = [q for q in data['questions'] if q['section'] in ['One Word Answers', 'Precise Answers']]
    ow_topics = Counter()
    for q in ow_qs:
        for t in extract_topics(q['question_text']):
            ow_topics[t] += 1
    lines.append("### One Word / Precise Answers")
    for topic, count in ow_topics.most_common(5):
        lines.append(f"- {topic} ({count} times)")
    lines.append("")
    
    lines.append("---")
    lines.append("")
    lines.append("> **Disclaimer:** This analysis is based on pattern recognition from previous papers. KUHS may change the syllabus or question patterns. Always study the full syllabus.")
    
    return '\n'.join(lines)

def main():
    data = load_data()
    analysis = analyze_questions(data)
    
    report = generate_prediction_report(analysis, data)
    report_path = os.path.join(OUTPUT_DIR, "prediction_report.md")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"Generated: {report_path}")
    print(f"\nTop 10 Topics:")
    for topic, count in analysis['topic_counter'].most_common(10):
        print(f"  {topic}: {count} times ({analysis['topic_marks'][topic]} marks)")

if __name__ == "__main__":
    main()
