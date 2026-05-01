import json
import os
from collections import Counter, defaultdict

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

def load_data():
    with open(os.path.join(OUTPUT_DIR, "questions_raw.json"), 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_markdown(data):
    """Generate a human-readable markdown file."""
    lines = []
    lines.append("# KUHS Pediatrics & Neonatology - Previous Year Questions (2015-2025)")
    lines.append("")
    lines.append("> **Source:** Kerala University of Health Sciences (KUHS) Previous Question Papers")
    lines.append("> **Papers:** 24 examinations from April 2015 to May 2025")
    lines.append("> **Total Questions Extracted:** {}".format(len(data['questions'])))
    lines.append("> **Schemes:** 2010 Scheme (311001, 40 marks) and 2019 Scheme (320001, 100 marks)")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Group by exam
    exams = defaultdict(list)
    for q in data['questions']:
        key = (q['exam_year'], q['exam_month'], q['filename'])
        exams[key].append(q)
    
    for (year, month, filename), questions in sorted(exams.items()):
        qp_code = questions[0]['qp_code'] if questions else 'Unknown'
        scheme = questions[0]['scheme'] if questions else 'Unknown'
        total_marks = questions[0]['total_marks'] if questions else 'Unknown'
        
        lines.append(f"## {year} - {month} (QP Code: {qp_code}, Scheme: {scheme}, {total_marks} Marks)")
        lines.append("")
        
        # Group by section
        sections = defaultdict(list)
        for q in questions:
            sections[q['section']].append(q)
        
        section_order = ["MCQs", "Essay", "Long Essays", "Short Essays", "Short Notes", "Short Answers", "Answer Briefly", "Draw and Label", "Precise Answers", "One Word Answers"]
        for section in section_order:
            if section not in sections:
                continue
            qs = sections[section]
            marks = qs[0]['marks']
            count = len(qs)
            total = marks * count
            lines.append(f"### {section} ({count} x {marks} = {total} marks)")
            lines.append("")
            
            for q in qs:
                qnum = q['question_number']
                text = q['question_text']
                lines.append(f"**Q{qnum}.** {text}")
                
                if q.get('sub_parts'):
                    for part_letter, part_text in q['sub_parts']:
                        lines.append(f"- ({part_letter}) {part_text}")
                
                lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # Add summary statistics
    lines.append("# Summary Statistics")
    lines.append("")
    
    all_q = data['questions']
    lines.append(f"- **Total Questions:** {len(all_q)}")
    lines.append(f"- **Total Marks Represented:** {sum(q['marks'] for q in all_q)}")
    lines.append(f"- **Papers Covered:** {len(exams)}")
    lines.append("")
    
    # Section frequency
    section_counts = Counter(q['section'] for q in all_q)
    lines.append("## Question Count by Section")
    lines.append("")
    lines.append("| Section | Count | Total Marks |")
    lines.append("|---------|-------|-------------|")
    for section, count in section_counts.most_common():
        total = sum(q['marks'] for q in all_q if q['section'] == section)
        lines.append(f"| {section} | {count} | {total} |")
    lines.append("")
    
    # Year-wise distribution
    year_counts = Counter(q['exam_year'] for q in all_q)
    lines.append("## Questions per Year")
    lines.append("")
    lines.append("| Year | Questions |")
    lines.append("|------|-----------|")
    for year in sorted(year_counts.keys()):
        lines.append(f"| {year} | {year_counts[year]} |")
    lines.append("")
    
    return '\n'.join(lines)

def generate_excel(data):
    """Generate Excel file with structured data."""
    import pandas as pd
    
    rows = []
    for q in data['questions']:
        row = {
            "Exam Year": q['exam_year'],
            "Exam Month": q['exam_month'],
            "QP Code": q['qp_code'],
            "Scheme": q['scheme'],
            "Total Marks": q['total_marks'],
            "Filename": q['filename'],
            "Section": q['section'],
            "Question Number": q['question_number'],
            "Question Text": q['question_text'],
            "Marks": q['marks'],
            "Type": q['type'],
            "Sub Parts": json.dumps(q['sub_parts']) if q.get('sub_parts') else ""
        }
        rows.append(row)
    
    df = pd.DataFrame(rows)
    
    # Create Excel writer
    excel_path = os.path.join(OUTPUT_DIR, "pediatrics_questions.xlsx")
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='All Questions', index=False)
        
        # Summary sheet
        summary_data = []
        for (year, month, filename), qs in defaultdict(list):
            pass
        
        # Section summary
        section_summary = df.groupby('Section').agg({
            'Question Number': 'count',
            'Marks': 'sum'
        }).reset_index()
        section_summary.columns = ['Section', 'Question Count', 'Total Marks']
        section_summary.to_excel(writer, sheet_name='Section Summary', index=False)
        
        # Year summary
        year_summary = df.groupby('Exam Year').agg({
            'Question Number': 'count',
            'Marks': 'sum'
        }).reset_index()
        year_summary.columns = ['Year', 'Question Count', 'Total Marks']
        year_summary.to_excel(writer, sheet_name='Year Summary', index=False)
        
        # High-frequency topics (simple keyword extraction)
        all_text = ' '.join(df['Question Text'].tolist()).lower()
        # Common pediatrics topics to search for
        topics = [
            'anemia', 'nephrotic syndrome', 'pneumonia', 'meningitis', 'dengue',
            'measles', 'tuberculosis', 'rickets', 'jaundice', 'seizure',
            'heart failure', 'tetralogy of fallot', 'immunization', 'vaccine',
            'breast feeding', 'malnutrition', 'diarrhea', 'dehydration',
            'premature', 'preterm', 'newborn', 'neonate', 'growth',
            'development', 'asthma', 'thalassemia', 'sickle cell',
            'rheumatic fever', 'kawasaki', 'henoch schonlein', 'itp',
            'hypothyroidism', 'cerebral palsy', 'down syndrome',
            'scurvy', 'kwashiorkor', 'marasmus', 'ors',
            'phototherapy', 'phototherapy', 'zinc', 'iron',
            'vitamin d', 'vitamin a', 'folic acid', 'b12',
            'polio', 'diphtheria', 'pertussis', 'tetanus', 'hepatitis',
            'mmr', 'bcg', 'opv', 'pentavalent', 'rota',
            'hpb', 'meningococcal', 'pneumococcal', 'influenza',
            'aefi', 'national immunization', 'universal immunization',
            'imci', 'imnci', 'ari', 'ari control',
            'ors', ' zinc ', 'mid upper arm', 'muac',
            'sam', 'mam', 'severe acute malnutrition',
            'kangaroo', 'kmc', 'nicu', 'incubator',
            'phototherapy', 'exchange transfusion', 'jaundice',
            'physiological jaundice', 'pathological jaundice',
            'kernicterus', 'bilirubin',
            'sepsis', ' septic ', 'meningitis', 'encephalitis',
            'uti', 'urinary tract', 'pyelonephritis',
            'nephrotic', 'nephritic', 'agn', 'psgn',
            'hematuria', 'proteinuria', 'oliguria', 'edema',
            'dengue', 'dengue shock', 'dengue hemorrhagic',
            'malaria', 'plasmodium', 'falciparum', 'vivax',
            'typhoid', 'scrub typhus', 'leptospirosis',
            'tuberculosis', 'tb ', ' mantoux', 'bcg',
            'hiv', 'aids', 'opportunistic',
            'hepatitis a', 'hepatitis b', 'hepatitis e',
            'rotavirus', 'cholera', 'typhoid',
            'celiac', 'cystic fibrosis', 'ibs', 'ibd',
            'hirschsprung', 'intussusception', 'malrotation',
            'pyloric stenosis', 'duodenal atresia', 'tracheoesophageal',
            'cleft lip', 'cleft palate', 'omphalocele', 'gastroschisis',
            'congenital diaphragmatic', 'cdh', 'congenital heart',
            'asd', 'vsd', 'pda', 'tof', 'tetralogy',
            'coarctation', 'aortic stenosis', 'pulmonary stenosis',
            'transposition', 'tga', 'tapvc', 'truncus',
            'rheumatic', 'jones criteria', 'chorea', 'carditis',
            'infective endocarditis', 'myocarditis', 'pericarditis',
            'kawasaki', 'mucocutaneous',
            'henoch schonlein', 'purpura', 'itp', 'hemophilia',
            'thalassemia', 'sickle cell', 'g6pd', 'aplastic',
            'iron deficiency', 'megaloblastic', 'folate',
            'leukemia', 'lymphoma', 'neuroblastoma', 'nephroblastoma',
            'wilms', 'retinoblastoma', 'osteosarcoma',
            'asthma', 'bronchial asthma', 'copd',
            'pneumonia', 'ari', 'alri', 'pneumococcal',
            'bronchiolitis', 'croup', 'epiglottitis',
            'foreign body', 'aspiration', 'cf ', 'cystic fibrosis',
            'tuberculosis', 'primary complex', 'miliary tb',
            'cerebral palsy', 'cp ', 'mental retardation',
            'autism', 'adhd', 'learning disability',
            'epilepsy', 'seizure', 'febrile seizure',
            'meningitis', 'encephalitis', 'brain abscess',
            'hydrocephalus', 'microcephaly', 'macrocephaly',
            'neural tube', 'meningomyelocele', 'spina bifida',
            'down syndrome', 'turner', 'klinefelter',
            'edwards', 'patau', 'cri du chat',
            'fragile x', 'angelman', 'prader willi',
            'congenital hypothyroidism', 'cretinism',
            'diabetes insipidus', 'siadh', 'diabetes mellitus',
            'adrenal hyperplasia', 'cushing', 'addison',
            'precocious puberty', 'delayed puberty',
            'short stature', 'tall stature', 'growth hormone',
            'obesity', 'dwarfism', 'gigantism',
            'undescended testes', 'cryptorchidism',
            'hypospadias', 'epispadias', 'phimosis',
            'hernias', 'hydrocele', 'varicocele',
            'wilms tumor', 'neuroblastoma',
            'burns', 'drowning', 'poisoning', 'trauma',
            'accident', 'injury', 'foreign body',
            'child abuse', 'neglect', 'shaken baby',
            'poisoning', 'organophosphorus', 'kerosene',
            'snake bite', 'scorpion sting', 'drowning',
            ' adolescent ', 'puberty', 'menarche',
            'menstrual', 'dysmenorrhea', 'pcos',
            'anorexia', 'bulimia', 'depression',
            'substance abuse', 'drug abuse',
            'consent', 'assent', 'medical ethics',
            'palliative', 'end of life', 'death',
            'dnb', 'dna', 'autopsy', 'coroner',
            'screening', 'newborn screening',
            'guthrie', 'tsh', 'pku', 'galactosemia',
            'hearing', 'vision', 'retinopathy',
            'rtp', 'rbsk', 'mcp card',
            'bfhi', 'ten steps', 'code',
            'national program', 'national health',
            'rbsk', 'rkSK', 'nipccd',
            'icds', 'anganwadi', 'aayushman',
            'poshan', 'anemia mukt', 'ifas',
            'ors', 'zinc', 'vitamin a',
            'lbw', 'elbw', 'vlbw', 'premature',
            'iugR', 'sga', 'aga', 'lga',
            'apgar', 'resuscitation', 'naloxone',
            'surfactant', 'cpap', 'mechanical ventilation',
            'retinopathy', 'nec', 'necrotizing enterocolitis',
            'ivh', 'pvl', 'hypoglycemia',
            'hypocalcemia', 'polycythemia',
            'hyperbilirubinemia', 'kernicterus',
            'anemia of prematurity', 'rds', 'ttn',
            'mas', 'pphn', 'congenital pneumonia',
            'sepsis', 'meningitis', 'omphalitis',
            'breast milk', 'formula', 'complementary feeding',
            'weaning', 'solids', 'nutrition',
            'who growth', 'iap growth', 'percentile',
            'mid arm circumference', 'muac',
            'weight for age', 'height for age',
            'weight for height', 'bmi', 'head circumference',
            'developmental milestone', 'screening', 'ddst',
            'denver', 'baroda', 'trivandrum',
            'primitive reflex', 'moro', 'grasp',
            'rooting', 'sucking', 'swallowing',
            'plagiocephaly', 'torticollis',
            'hip dysplasia', 'ddh', 'clubfoot',
            'scoliosis', 'kyphosis', 'lordosis',
            'osteogenesis imperfecta', 'achondroplasia',
            'rickets', 'scurvy', 'beriberi',
            'pellagra', 'kwashiorkor', 'marasmus',
            'vitamin a deficiency', 'xerophthalmia',
            'bitot spots', 'keratomalacia',
            'night blindness', 'vitamin d deficiency',
            'hypocalcemia', 'tetany', 'rickets',
            'zinc deficiency', 'acrodermatitis',
            'iron deficiency', 'pica', 'pagophagia',
            'folate deficiency', 'b12 deficiency',
            'fluoride', 'dental caries', 'fluorosis',
            'iodine deficiency', 'cretinism', 'goiter',
            'obesity', 'overweight', 'bmI',
            'failure to thrive', 'ftt',
            'feeding difficulty', 'colic', 'regurgitation',
            'constipation', 'encopresis', 'enuresis',
            'hirchsprung', 'aganglionic', 'mega colon',
            'allergy', 'anaphylaxis', 'urticaria',
            'atopic dermatitis', 'eczema', 'asthma',
            'food allergy', 'drug allergy', 'latex',
            'urticaria', 'angioedema', 'serum sickness',
            'sjogren', 'sLE', 'juvenile arthritis',
            'dM', 'type 1 diabetes', 'insulin',
            'hypothyroid', 'hyperthyroid', 'goiter',
            'cushing', 'addison', 'congenital adrenal',
            'precocious', 'delayed puberty',
            'ambiguous genitalia', 'intersex',
            'undescended', 'cryptorchidism',
            'testicular torsion', 'torsion',
            'hydrocele', 'inguinal hernia',
            'phimosis', 'circumcision',
            'utI', 'vur', 'vesicoureteral',
            'nephrotic syndrome', 'minimal change',
            'steroid resistant', 'steroid dependent',
            'fsgs', 'mpgn', 'igan',
            'hemolytic uremic', 'hus',
            'posterior urethral', 'puv',
            'hypospadias', 'epispadias',
            'exstrophy', 'bladder exstrophy',
            'wilms tumor', 'nephroblastoma',
            'neuroblastoma', 'hepatoblastoma',
            'rhabdomyosarcoma', 'ewing sarcoma',
            'osteosarcoma', 'leukemia', 'all', 'aml',
            'lymphoma', 'hodgkin', 'non-hodgkin',
            'brain tumor', 'medulloblastoma',
            'craniopharyngioma', 'astrocytoma',
            'glioma', 'ependymoma',
            'retinoblastoma', 'rb1',
        ]
        
        topic_counts = []
        for topic in topics:
            count = all_text.count(topic)
            if count > 0:
                topic_counts.append((topic.strip(), count))
        
        topic_counts.sort(key=lambda x: x[1], reverse=True)
        
        topic_df = pd.DataFrame(topic_counts[:50], columns=['Topic/Keyword', 'Frequency'])
        topic_df.to_excel(writer, sheet_name='Top Topics', index=False)
    
    return excel_path

def main():
    data = load_data()
    
    # Generate Markdown
    md_content = generate_markdown(data)
    md_path = os.path.join(OUTPUT_DIR, "pediatrics_questions.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Generated: {md_path}")
    
    # Generate Excel
    excel_path = generate_excel(data)
    print(f"Generated: {excel_path}")

if __name__ == "__main__":
    main()
