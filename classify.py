import json
import re
import sys
from pathlib import Path

# Resolve paths relative to this script's directory
SCRIPT_DIR = Path(__file__).resolve().parent
INPUT_PATH = SCRIPT_DIR / "questions_batch_3.json"
OUTPUT_PATH = SCRIPT_DIR / "classified_batch_3.json"

def main() -> None:
    if not INPUT_PATH.exists():
        print(f"ERROR: Input file not found: {INPUT_PATH}", file=sys.stderr)
        sys.exit(1)

    try:
        with INPUT_PATH.open('r', encoding='utf-8') as f:
            questions = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in {INPUT_PATH}: {e}", file=sys.stderr)
        sys.exit(1)

    results = []
    section_counts = {}

    for q in questions:
        text = q["question_text"]
        section_num, chapter_num, chapter_name = classify(text)
        section_name = SECTIONS[section_num]["name"]
        q["nelson_section"] = f"SECTION {section_num}: {section_name}"
        q["nelson_chapter"] = f"Ch{chapter_num}: {chapter_name}"
        results.append(q)
        section_counts[section_num] = section_counts.get(section_num, 0) + 1

    # Save output
    with OUTPUT_PATH.open('w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Print summary
    print("=== Classification Summary ===")
    print(f"Total questions: {len(results)}")
    print()
    for sec_num in sorted(section_counts.keys()):
        sec_name = SECTIONS[sec_num]["name"]
        count = section_counts[sec_num]
        print(f"SECTION {sec_num}: {sec_name} -> {count} questions")

    print()
    print(f"Saved to {OUTPUT_PATH.name}")


if __name__ == "__main__":
    main()

# Chapter mapping based on Nelson Essentials of Pediatrics, 8th Edition typical TOC
SECTIONS = {
    1: {"name": "Profession of Pediatrics", "chapters": {1:"The Profession of Pediatrics", 2:"Ethics in Pediatric Care", 3:"Cultural and Religious Issues Affecting Pediatric Care", 4:"Quality and Safety in Health Care for Children"}},
    2: {"name": "Growth and Development", "chapters": {5:"Assessment of Fetal Growth and Development", 6:"The Newborn", 7:"The First Year", 8:"The Second Year", 9:"The Preschool Years", 10:"Middle Childhood"}},
    3: {"name": "Behavioral Disorders", "chapters": {11:"Sleep Disorders", 12:"Feeding and Eating Disorders", 13:"Elimination Disorders", 14:"Discipline", 15:"Developmental and Behavioral Surveillance and Screening"}},
    4: {"name": "Psychiatric Disorders", "chapters": {16:"Anxiety and Phobias", 17:"Depression and Suicide", 18:"Psychosis", 19:"Autism Spectrum Disorder", 20:"Attention-Deficit/Hyperactivity Disorder"}},
    5: {"name": "Psychosocial Issues", "chapters": {21:"Child Abuse and Neglect", 22:"Adoption", 23:"Foster Care", 24:"Separation, Divorce, and Parental Illness", 25:"Chronic Illness and the Family", 26:"Death and Dying"}},
    6: {"name": "Pediatric Nutrition", "chapters": {27:"Nutritional Requirements", 28:"Breastfeeding", 29:"Complementary Feeding", 30:"Nutrition in the Toddler and Preschool Years", 31:"Nutrition in the School-Aged Child and Adolescent"}},
    7: {"name": "Fluids and Electrolytes", "chapters": {32:"Maintenance and Replacement Therapy", 33:"Dehydration", 34:"Acid-Base Disorders", 35:"Fluid and Electrolyte Treatment of Specific Disorders", 36:"Parenteral Nutrition", 37:"Enteral Nutrition"}},
    8: {"name": "Acutely Ill or Injured Child", "chapters": {38:"Emergency Medical Services for Children", 39:"Pediatric Assessment", 40:"Shock", 41:"Respiratory Distress and Failure", 42:"Cardiopulmonary Resuscitation", 43:"Seizures", 44:"Poisoning", 45:"Trauma", 46:"Common Surgical Emergencies"}},
    9: {"name": "Human Genetics and Dysmorphology", "chapters": {47:"Patterns of Inheritance", 48:"The Genetic Basis of Common Diseases", 49:"Genetic Counseling", 50:"Dysmorphology"}},
    10: {"name": "Metabolic Disorders", "chapters": {51:"An Approach to the Child with Metabolic Disease", 52:"Disorders of Carbohydrate Metabolism", 53:"Disorders of Fatty Acid Oxidation", 54:"Disorders of Amino Acid Metabolism", 55:"Lysosomal Storage Diseases", 56:"Peroxisomal Disorders", 57:"Mitochondrial Disorders"}},
    11: {"name": "Fetal and Neonatal Medicine", "chapters": {58:"The Fetus", 59:"The Newborn Infant", 60:"High-Risk Newborns", 61:"Neonatal Resuscitation", 62:"Birth Injuries", 63:"Congenital Anomalies", 64:"Neonatal Infections", 65:"Hematologic Problems in the Newborn", 66:"Metabolic Problems in the Newborn"}},
    12: {"name": "Adolescent Medicine", "chapters": {67:"The Adolescent", 68:"Adolescent Sexuality", 69:"Adolescent Pregnancy", 70:"Substance Use Disorders in Adolescents", 71:"Eating Disorders in Adolescents"}},
    13: {"name": "Immunology", "chapters": {72:"The Immune System", 73:"Evaluation of the Immune System", 74:"Primary Immunodeficiency Diseases", 75:"Secondary Immunodeficiency Diseases", 76:"HIV Infection"}},
    14: {"name": "Allergy", "chapters": {77:"Allergic Rhinitis", 78:"Asthma", 79:"Urticaria and Angioedema", 80:"Atopic Dermatitis", 81:"Food Allergy", 82:"Anaphylaxis", 83:"Insect Allergy", 84:"Drug Allergy", 85:"Primary Immunodeficiency Diseases"}},
    15: {"name": "Rheumatic Diseases", "chapters": {86:"Rheumatic Diseases of Childhood", 87:"Juvenile Idiopathic Arthritis", 88:"Systemic Lupus Erythematosus", 89:"Juvenile Dermatomyositis", 90:"Scleroderma", 91:"Vasculitis", 92:"Musculoskeletal Pain Syndromes"}},
    16: {"name": "Infectious Diseases", "chapters": {93:"Infectious Diseases: Introduction", 94:"Osteomyelitis and Septic Arthritis", 95:"Viral Infections", 96:"Rickettsial Diseases", 97:"Mycoplasma Infections", 98:"Chlamydial Infections", 99:"Sexually Transmitted Infections", 100:"Human Immunodeficiency Virus Infection", 101:"Tuberculosis", 102:"Fungal Infections", 103:"Protozoal Diseases", 104:"Helminthic Infections", 105:"Infections in Immunocompromised Persons", 106:"Fever of Unknown Origin", 107:"Sepsis and Septic Shock", 108:"Skin and Soft Tissue Infections", 109:"Gastrointestinal Infections", 110:"Central Nervous System Infections", 111:"Respiratory Tract Infections", 112:"Urinary Tract Infections", 113:"Endocarditis", 114:"Meningitis", 115:"Encephalitis", 116:"Myocarditis", 117:"Pericarditis", 118:"Hepatitis", 119:"Malaria", 120:"Dengue", 121:"Typhoid", 122:"Leptospirosis", 123:"Scrub Typhus", 124:"Tetanus", 125:"Leprosy"}},
    17: {"name": "Digestive System", "chapters": {126:"Evaluation of the Digestive System", 127:"Disorders of the Esophagus", 128:"Disorders of the Stomach and Duodenum", 129:"Disorders of the Small Bowel", 130:"Disorders of the Large Bowel", 131:"Disorders of the Liver", 132:"Disorders of the Exocrine Pancreas"}},
    18: {"name": "Respiratory System", "chapters": {133:"Evaluation of the Respiratory System", 134:"Disorders of the Upper Respiratory Tract", 135:"Disorders of the Lower Respiratory Tract", 136:"Asthma", 137:"Cystic Fibrosis", 138:"Interstitial Lung Disease"}},
    19: {"name": "Cardiovascular System", "chapters": {139:"Evaluation of the Cardiovascular System", 140:"Congenital Heart Disease", 141:"Acquired Heart Disease", 142:"Arrhythmias", 143:"Heart Failure", 144:"Hypertension", 145:"Syncope", 146:"Chest Pain", 147:"Shock", 148:"Dyslipidemia"}},
    20: {"name": "Hematology", "chapters": {149:"Anemias", 150:"Bleeding Disorders", 151:"Thrombotic Disorders", 152:"Transfusion Medicine"}},
    21: {"name": "Oncology", "chapters": {153:"Epidemiology of Childhood Cancer", 154:"Leukemia", 155:"Lymphoma", 156:"Brain Tumors", 157:"Neuroblastoma", 158:"Wilms Tumor", 159:"Bone Tumors", 160:"Soft Tissue Sarcomas"}},
    22: {"name": "Nephrology and Urology", "chapters": {161:"Evaluation of the Kidney and Urinary Tract", 162:"Glomerular Disease", 163:"Tubular Disorders", 164:"Urinary Tract Infections", 165:"Nephrotic Syndrome", 166:"Acute Kidney Injury", 167:"Chronic Kidney Disease", 168:"End-Stage Renal Disease", 169:"Disorders of the Urinary Tract"}},
    23: {"name": "Endocrinology", "chapters": {170:"Growth", 171:"Thyroid Disease", 172:"Disorders of the Adrenal Gland", 173:"Disorders of Sexual Development", 174:"Puberty", 175:"Diabetes Mellitus", 176:"Hypoglycemia", 177:"Calcium and Bone Disorders", 178:"Disorders of the Posterior Pituitary"}},
    24: {"name": "Neurology", "chapters": {179:"Evaluation of the Nervous System", 180:"Seizures and Epilepsy", 181:"Headaches", 182:"Neurodegenerative Disorders", 183:"Movement Disorders", 184:"Neuromuscular Disorders", 185:"Neural Tube Defects", 186:"Hydrocephalus", 187:"Central Nervous System Infections"}},
    25: {"name": "Dermatology", "chapters": {188:"Evaluation of the Skin", 189:"Cutaneous Manifestations of Systemic Diseases", 190:"Eczematous Disorders", 191:"Papulosquamous Disorders", 192:"Vesiculobullous Disorders", 193:"Infections of the Skin", 194:"Infestations of the Skin", 195:"Disorders of Pigmentation", 196:"Disorders of Hair and Nails"}},
    26: {"name": "Orthopedics", "chapters": {197:"Evaluation of the Musculoskeletal System", 198:"Common Orthopedic Problems", 199:"Metabolic Bone Disease", 200:"Skeletal Dysplasias", 201:"Osteomyelitis and Septic Arthritis", 202:"Scoliosis", 203:"Common Fractures", 204:"Sports Medicine"}},
}


def classify_question(text):
    t = text.lower()
    # SECTION 6: Pediatric Nutrition
    if any(x in t for x in ["complementary feeding", "complementary feed", "weaning"]):
        return 6, 29, "Complementary Feeding"
    if any(x in t for x in ["breast feeding", "breastfeeding", "prolactin reflex", "lactation"]):
        return 6, 28, "Breastfeeding"
    if any(x in t for x in ["vitamin a deficiency", "xerophthalmia", "who classification of vitamin a"]):
        return 6, 27, "Nutritional Requirements"
    if any(x in t for x in ["zinc supplementation", "zinc"]):
        return 6, 27, "Nutritional Requirements"
    if any(x in t for x in ["f75 formula", "f75", "f-75", "therapeutic feeding"]):
        return 6, 30, "Nutrition in the Toddler and Preschool Years"
    if any(x in t for x in ["wifs", "weekly iron and folic acid supplementation", "iron folic acid"]):
        return 6, 27, "Nutritional Requirements"
    if any(x in t for x in ["scurvy", "vitamin c"]):
        return 6, 27, "Nutritional Requirements"
    if any(x in t for x in ["rickets", "radiological features of rickets"]):
        return 6, 27, "Nutritional Requirements"

    # SECTION 11: Fetal and Neonatal Medicine
    if any(x in t for x in ["neonatal seizure", "neonatal seizures"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["respiratory distress syndrome", "preterm", "prematurity", "preterm baby"]):
        return 11, 60, "High-Risk Newborns"
    if any(x in t for x in ["hemorrhagic disease of newborn", "hemorrhagic disease of the newborn", "vitamin k"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["physiological jaundice", "pathological jaundice", "neonatal jaundice", "physiologic jaundice"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["kangaroo mother care", "kmc"]):
        return 11, 60, "High-Risk Newborns"
    if any(x in t for x in ["moro reflex"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["congenital cataract", "congenital anomalies", "fetal circulation", "fetal infect"]):
        return 11, 63, "Congenital Anomalies"
    if any(x in t for x in ["tracheo-esophageal fistula", "tracheoesophageal fistula", "oesophageal atresia"]):
        return 11, 63, "Congenital Anomalies"
    if any(x in t for x in ["complications in a preterm baby", "complications of prematurity"]):
        return 11, 60, "High-Risk Newborns"
    if any(x in t for x in ["non pulmonary cause of respiratory distress in the newborns", "respiratory distress in newborn"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["toxicity of digitalis", "digitalis"]):
        return 11, 66, "Metabolic Problems in the Newborn"  # closest, though not perfect

    # SECTION 2: Growth and Development
    if any(x in t for x in ["fine motor development", "gross motor development", "developmental milestone"]):
        return 2, 7, "The First Year"
    if any(x in t for x in ["microcephaly", "macrocephaly", "large head", "head circumference"]):
        return 2, 5, "Assessment of Fetal Growth and Development"
    if any(x in t for x in ["rates of growth of different tissues", "growth velocity", "growth chart"]):
        return 2, 5, "Assessment of Fetal Growth and Development"

    # SECTION 3: Behavioral Disorders
    if any(x in t for x in ["temper tantrum", "temper tantrums"]):
        return 3, 14, "Discipline"
    if any(x in t for x in ["breath holding spell", "breath holding spells"]):
        return 3, 11, "Sleep Disorders"  # Actually breath holding is often in behavioral; could be Ch11 or Ch14
    if any(x in t for x in ["nocturnal enuresis", "enuresis", "bedwetting"]):
        return 3, 13, "Elimination Disorders"

    # SECTION 4: Psychiatric Disorders
    if any(x in t for x in ["autism spectrum disorder", "autism"]):
        return 4, 19, "Autism Spectrum Disorder"

    # SECTION 5: Psychosocial Issues
    if any(x in t for x in ["child abuse", "neglect", "maltreatment"]):
        return 5, 21, "Child Abuse and Neglect"

    # SECTION 7: Fluids and Electrolytes
    if any(x in t for x in ["hypernatremic dehydration", "dehydration", "hypokalemia", "hyponatremia", "hyperkalemia"]):
        return 7, 33, "Dehydration"
    if any(x in t for x in ["low osmolar ors", "ors composition", "oral rehydration", "oral rehydration salts"]):
        return 7, 32, "Maintenance and Replacement Therapy"
    if any(x in t for x in ["acute watery diarrhoea", "acute diarrheal disease", "diarrhea management", "diarrhoea"]):
        return 7, 35, "Fluid and Electrolyte Treatment of Specific Disorders"
    if any(x in t for x in ["sodium content in low osmolar ors", "sodium in ors"]):
        return 7, 32, "Maintenance and Replacement Therapy"

    # SECTION 8: Acutely Ill or Injured Child
    if any(x in t for x in ["poisoning", "kerosene poisoning", "acetaminophen poisoning", "paracetamol poisoning", "drug overdose"]):
        return 8, 44, "Poisoning"
    if any(x in t for x in ["seizure", "seizures", "febrile convulsion", "febrile seizure", "status epilepticus", "child with fever and seizure"]):
        return 8, 43, "Seizures"
    if any(x in t for x in ["trauma", "injury", "burn", "drowning", "accident"]):
        return 8, 45, "Trauma"
    if any(x in t for x in ["shock", "dengue shock"]):
        return 8, 40, "Shock"
    if any(x in t for x in ["emergency", "casualty", "resuscitation", "cpr"]):
        return 8, 42, "Cardiopulmonary Resuscitation"
    if any(x in t for x in ["torsion testes", "testicular torsion"]):
        return 8, 46, "Common Surgical Emergencies"

    # SECTION 9: Human Genetics and Dysmorphology
    if any(x in t for x in ["down syndrome", "trisomy 21", "antenatal diagnosis of down syndrome"]):
        return 9, 50, "Dysmorphology"
    if any(x in t for x in ["guthrie test", "phenylketonuria", "pku", "metabolic screening"]):
        return 9, 48, "The Genetic Basis of Common Diseases"
    if any(x in t for x in ["dysmorphology", "congenital anomaly", "birth defect", "syndrome"]):
        return 9, 50, "Dysmorphology"

    # SECTION 10: Metabolic Disorders
    if any(x in t for x in ["galactosemia", "glycogen storage disease", "pompe disease", "mucopolysaccharidosis", "lysosomal", "mitochondrial"]):
        return 10, 51, "An Approach to the Child with Metabolic Disease"

    # SECTION 12: Adolescent Medicine
    if any(x in t for x in ["adolescent", "puberty", "teenager"]):
        return 12, 67, "The Adolescent"

    # SECTION 13: Immunology
    if any(x in t for x in ["intravenous immunoglobulin", "ivig", "immunodeficiency", "primary immunodeficiency", "secondary immunodeficiency", "hiv infection", "hiv"]):
        return 13, 76, "HIV Infection"
    if any(x in t for x in ["immune system", "immunology"]):
        return 13, 72, "The Immune System"

    # SECTION 14: Allergy
    if any(x in t for x in ["allergic rhinitis", "asthma", "atopic dermatitis", "food allergy", "anaphylaxis", "urticaria"]):
        return 14, 78, "Asthma"

    # SECTION 15: Rheumatic Diseases
    if any(x in t for x in ["rheumatic fever", "rheumatic heart disease", "modified jones criteria", "jones criteria", "migratory arthritis", "joint pain after sore throat"]):
        return 15, 86, "Rheumatic Diseases of Childhood"
    if any(x in t for x in ["juvenile idiopathic arthritis", "jia", "systemic lupus", "juvenile dermatomyositis", "vasculitis"]):
        return 15, 87, "Juvenile Idiopathic Arthritis"
    if any(x in t for x in ["kawasaki disease", "kawasaki"]):
        return 15, 86, "Rheumatic Diseases of Childhood"
    if any(x in t for x in ["henoch-schonlein purpura", "igA vasculitis"]):
        return 15, 86, "Rheumatic Diseases of Childhood"

    # SECTION 16: Infectious Diseases
    if any(x in t for x in ["pneumonia", "pneumococcal", "staphylococcal pneumonia", "lobar pneumonia", "bronchopneumonia", "community acquired pneumonia", "severe pneumonia", "ari control"]):
        return 16, 111, "Respiratory Tract Infections"
    if any(x in t for x in ["tuberculosis", "tuberculous lymphadenitis", "lymphnode tuberculosis", "tb prophylaxis", "anti-tubercular", "bcg"]):
        return 16, 101, "Tuberculosis"
    if any(x in t for x in ["meningitis", "encephalitis", "brain abscess"]):
        return 16, 114, "Meningitis"
    if any(x in t for x in ["otitis media", "acute otitis media"]):
        return 16, 111, "Respiratory Tract Infections"
    if any(x in t for x in ["dengue", "dengue shock syndrome", "dengue hemorrhagic fever", "dengue fever"]):
        return 16, 120, "Dengue"
    if any(x in t for x in ["typhoid", "enteric fever"]):
        return 16, 121, "Typhoid"
    if any(x in t for x in ["scrub typhus", "tsutsugamushi"]):
        return 16, 123, "Scrub Typhus"
    if any(x in t for x in ["malaria", "plasmodium"]):
        return 16, 119, "Malaria"
    if any(x in t for x in ["leptospirosis", "weil disease"]):
        return 16, 122, "Leptospirosis"
    if any(x in t for x in ["urinary tract infection", "urinary tract infections", "uti", "pyelonephritis", "cystitis"]):
        return 16, 112, "Urinary Tract Infections"
    if any(x in t for x in ["tonsillitis", "pharyngitis", "sore throat", "strep throat", "acute follicular tonsillitis"]):
        return 16, 111, "Respiratory Tract Infections"
    if any(x in t for x in ["sepsis", "septic shock", "bacteremia", "septicemia"]):
        return 16, 107, "Sepsis and Septic Shock"
    if any(x in t for x in ["skin infection", "cellulitis", "impetigo", "abscess", "soft tissue infection"]):
        return 16, 108, "Skin and Soft Tissue Infections"
    if any(x in t for x in ["gastroenteritis", "diarrhea infectious", "dysentery", "cholera", "rotavirus", "typhoid"]):
        return 16, 109, "Gastrointestinal Infections"
    if any(x in t for x in ["viral infection", "measles", "mumps", "rubella", "chickenpox", "varicella", "herpes", "coxsackie", "enterovirus", "rsv", "influenza", "parainfluenza"]):
        return 16, 95, "Viral Infections"
    if any(x in t for x in ["hiv", "aids", "antiretroviral", "nrti", "nucleoside reverse transcriptase", "zidovudine", "lamivudine", "nevirapine", "prophylaxis of hiv"]):
        return 16, 100, "Human Immunodeficiency Virus Infection"
    if any(x in t for x in ["vaccine", "vaccination", "immunization", "pentavalent", "rotavirus vaccine", "mr vaccine", "polio vaccine", "bcg", "hepatitis b vaccine", "hpv vaccine", "cancer vaccine", "pentavalent vaccine"]):
        return 16, 93, "Infectious Diseases: Introduction"  # Vaccines are often in intro or specific chapters
    if any(x in t for x in ["penicillin", "antibiotic", "antimicrobial", "antibacterial"]):
        return 16, 93, "Infectious Diseases: Introduction"
    if any(x in t for x in ["acute laryngotracheobronchitis", "croup", "laryngotracheobronchitis"]):
        return 16, 111, "Respiratory Tract Infections"
    if any(x in t for x in ["fever of unknown origin", "fuo"]):
        return 16, 106, "Fever of Unknown Origin"
    if any(x in t for x in ["tetanus", "neonatal tetanus"]):
        return 16, 124, "Tetanus"
    if any(x in t for x in ["leprosy", "hansen disease"]):
        return 16, 125, "Leprosy"
    if any(x in t for x in ["osteomyelitis", "septic arthritis"]):
        return 16, 94, "Osteomyelitis and Septic Arthritis"

    # SECTION 17: Digestive System
    if any(x in t for x in ["portal hypertension", "esophageal varices", "cirrhosis", "liver disease", "hepatitis", "jaundice", "cholestasis", "biliary atresia"]):
        return 17, 131, "Disorders of the Liver"
    if any(x in t for x in ["gastroesophageal reflux", "gerd", "esophagitis", "achalasia", "tracheoesophageal fistula", "tesophageal atresia"]):
        return 17, 127, "Disorders of the Esophagus"
    if any(x in t for x in ["gastritis", "peptic ulcer", "duodenal ulcer", "gastric ulcer", "h. pylori"]):
        return 17, 128, "Disorders of the Stomach and Duodenum"
    if any(x in t for x in ["malabsorption", "celiac disease", "celiac", "short bowel", "tropical sprue"]):
        return 17, 129, "Disorders of the Small Bowel"
    if any(x in t for x in ["constipation", "hirschsprung disease", "anal fissure", "encopresis", "inflammatory bowel disease", "crohn", "ulcerative colitis"]):
        return 17, 130, "Disorders of the Large Bowel"
    if any(x in t for x in ["pancreatitis", "pancreatic insufficiency", "cystic fibrosis digestive", "pancreas"]):
        return 17, 132, "Disorders of the Exocrine Pancreas"
    if any(x in t for x in ["puddle sign", "ascites", "abdominal distension", "peritonitis", "acute abdomen"]):
        return 17, 126, "Evaluation of the Digestive System"

    # SECTION 18: Respiratory System
    if any(x in t for x in ["bronchial asthma", "asthma", "wheezing", "bronchospasm", "acute exacerbation of asthma", "status asthmaticus", "reversible airway obstruction"]):
        return 18, 136, "Asthma"
    if any(x in t for x in ["bronchiolitis", "rsv", "respiratory syncytial virus"]):
        return 18, 135, "Disorders of the Lower Respiratory Tract"
    if any(x in t for x in ["pneumonia", "pneumococcal", "staphylococcal pneumonia", "lobar pneumonia", "bronchopneumonia", "community acquired pneumonia", "severe pneumonia", "ari control"]):
        return 18, 135, "Disorders of the Lower Respiratory Tract"
    if any(x in t for x in ["cystic fibrosis", "cystic fibrosis respiratory", "cf"]):
        return 18, 137, "Cystic Fibrosis"
    if any(x in t for x in ["pleural effusion", "empyema", "pneumothorax", "hemothorax"]):
        return 18, 135, "Disorders of the Lower Respiratory Tract"
    if any(x in t for x in ["upper respiratory tract infection", "common cold", "rhinitis", "sinusitis", "tonsillitis", "pharyngitis", "otitis media", "otitis externa"]):
        return 18, 134, "Disorders of the Upper Respiratory Tract"
    if any(x in t for x in ["laryngotracheobronchitis", "croup", "epiglottitis", "bacterial tracheitis"]):
        return 18, 134, "Disorders of the Upper Respiratory Tract"
    if any(x in t for x in ["surface marking of the lungs", "lung anatomy", "lung volumes", "pulmonary function test", "breath sounds", "vesicular breath sounds", "bronchial breath sounds", "auscultation of lungs", "percussion of chest"]):
        return 18, 133, "Evaluation of the Respiratory System"

    # SECTION 19: Cardiovascular System
    if any(x in t for x in ["tetralogy of fallot", "tetralogy", "cyanotic spell", "cyanotic spells", "tof", "ventricular septal defect", "vsd", "atrial septal defect", "asd", "patent ductus arteriosus", "pda", "coarctation of aorta", "aortic stenosis", "pulmonary stenosis", "transposition of great arteries", "tga", "total anomalous pulmonary venous connection", "tapvc", "truncus arteriosus", "hypoplastic left heart syndrome", "hlhs", "congenital heart disease", "chd"]):
        return 19, 140, "Congenital Heart Disease"
    if any(x in t for x in ["congestive cardiac failure", "heart failure", "ccf", "cardiac failure", "myocarditis", "cardiomyopathy", "dilated cardiomyopathy", "hypertrophic cardiomyopathy", "restrictive cardiomyopathy"]):
        return 19, 143, "Heart Failure"
    if any(x in t for x in ["hypertension", "high blood pressure", "bp elevation"]):
        return 19, 144, "Hypertension"
    if any(x in t for x in ["arrhythmia", "heart block", "bradycardia", "tachycardia", "supraventricular tachycardia", "svt", "atrial flutter", "atrial fibrillation", "ventricular tachycardia", "vt"]):
        return 19, 142, "Arrhythmias"
    if any(x in t for x in ["rheumatic heart disease", "rheumatic carditis", "valvular heart disease", "mitral stenosis", "mitral regurgitation", "aortic regurgitation"]):
        return 19, 141, "Acquired Heart Disease"
    if any(x in t for x in ["endocarditis", "infective endocarditis", "prophylaxis of endocarditis"]):
        return 19, 141, "Acquired Heart Disease"
    if any(x in t for x in ["pericarditis", "cardiac tamponade", "pericardial effusion"]):
        return 19, 141, "Acquired Heart Disease"
    if any(x in t for x in ["syncope", "fainting"]):
        return 19, 145, "Syncope"
    if any(x in t for x in ["chest pain", "angina", "chest discomfort"]):
        return 19, 146, "Chest Pain"
    if any(x in t for x in ["shock", "cardiogenic shock", "hypovolemic shock", "septic shock", "anaphylactic shock", "distributive shock"]):
        return 19, 147, "Shock"
    if any(x in t for x in ["dyslipidemia", "hyperlipidemia", "hypercholesterolemia"]):
        return 19, 148, "Dyslipidemia"
    if any(x in t for x in ["fetal circulation"]):
        return 19, 139, "Evaluation of the Cardiovascular System"

    # SECTION 20: Hematology
    if any(x in t for x in ["anemia", "iron deficiency anemia", "hemolytic anemia", "sickle cell", "thalassemia", "thalassemia major", "g6pd deficiency", "megaloblastic anemia", "aplastic anemia", "diamond-blackfan anemia", "fanconi anemia"]):
        return 20, 149, "Anemias"
    if any(x in t for x in ["bleeding disorder", "hemophilia", "von willebrand disease", "thrombocytopenia", "itp", "idiopathic thrombocytopenic purpura", "hemorrhagic disease of newborn", "disseminated intravascular coagulation", "dic", "coagulopathy"]):
        return 20, 150, "Bleeding Disorders"
    if any(x in t for x in ["thrombosis", "thrombotic disorder", "deep vein thrombosis", "pulmonary embolism", "protein c deficiency", "protein s deficiency", "antithrombin iii deficiency", "factor v leiden"]):
        return 20, 151, "Thrombotic Disorders"
    if any(x in t for x in ["transfusion", "blood transfusion", "exchange transfusion", "packed red blood cells", "platelet transfusion", "fresh frozen plasma", "ffp", "transfusion reaction", "hemolytic transfusion reaction", "febrile nonhemolytic transfusion reaction", "allergic transfusion reaction", "anaphylactic transfusion reaction", "transfusion-related acute lung injury", "trali"]):
        return 20, 152, "Transfusion Medicine"
    if any(x in t for x in ["peripheral smear", "blood film", "cbc", "complete blood count", "hemoglobin", "hematocrit", "mcv", "mch", "mchc", "rdw", "reticulocyte count", "peripheral blood smear"]):
        return 20, 149, "Anemias"

    # SECTION 21: Oncology
    if any(x in t for x in ["leukemia", "all", "aml", "cml", "cll", "lymphoma", "hodgkin lymphoma", "non-hodgkin lymphoma", "burkitt lymphoma", "brain tumor", "medulloblastoma", "astrocytoma", "ependymoma", "craniopharyngioma", "neuroblastoma", "wilms tumor", "nephroblastoma", "osteosarcoma", "ewing sarcoma", "rhabdomyosarcoma", "retinoblastoma", "hepatoblastoma", "germ cell tumor", "teratoma", "lymphadenopathy"]):
        return 21, 154, "Leukemia"
    if any(x in t for x in ["tumor lysis syndrome", "tls", "oncologic emergency", "spinal cord compression", "superior vena cava syndrome", "svcs"]):
        return 21, 153, "Epidemiology of Childhood Cancer"

    # SECTION 22: Nephrology and Urology
    if any(x in t for x in ["nephrotic syndrome", "nephrotic", "minimal change disease", "focal segmental glomerulosclerosis", "fsgs", "membranoproliferative glomerulonephritis", "mpgn"]):
        return 22, 165, "Nephrotic Syndrome"
    if any(x in t for x in ["glomerulonephritis", "acute glomerulonephritis", "post-streptococcal glomerulonephritis", "psgn", "iga nephropathy", "henoch-schonlein purpura nephritis", "lupus nephritis", "rapidly progressive glomerulonephritis", "rpgn", "hematuria", "proteinuria", "nephritic syndrome", "nephritic"]):
        return 22, 162, "Glomerular Disease"
    if any(x in t for x in ["urinary tract infection", "urinary tract infections", "uti", "pyelonephritis", "cystitis", "vesicoureteral reflux", "vur", "obstructive uropathy", "posterior urethral valves", "puv", "hydronephrosis", "renal calculi", "nephrolithiasis", "urolithiasis", "renal stone", "kidney stone"]):
        return 22, 164, "Urinary Tract Infections"
    if any(x in t for x in ["acute kidney injury", "aki", "acute renal failure", "arf", "hemolytic uremic syndrome", "hus", "thrombotic thrombocytopenic purpura", "ttp"]):
        return 22, 166, "Acute Kidney Injury"
    if any(x in t for x in ["chronic kidney disease", "ckd", "chronic renal failure", "crf", "end-stage renal disease", "esrd", "dialysis", "peritoneal dialysis", "hemodialysis", "renal transplant", "kidney transplant"]):
        return 22, 167, "Chronic Kidney Disease"
    if any(x in t for x in ["tubular disorder", "renal tubular acidosis", "rta", "nephrogenic diabetes insipidus", "bartter syndrome", "gitelman syndrome", "fanconi syndrome", "renal tubule"]):
        return 22, 163, "Tubular Disorders"
    if any(x in t for x in ["nephron", "renal anatomy", "kidney anatomy", "renal physiology", "glomerular filtration rate", "gfr"]):
        return 22, 161, "Evaluation of the Kidney and Urinary Tract"
    if any(x in t for x in ["enuresis", "nocturnal enuresis", "bedwetting", "daytime urinary incontinence", "dribbling of urine", "neurogenic bladder"]):
        return 22, 169, "Disorders of the Urinary Tract"
    if any(x in t for x in ["hematuria", "blood in urine", "cola coloured urine", "colored urine", "red urine", "smoky urine"]):
        return 22, 161, "Evaluation of the Kidney and Urinary Tract"
    if any(x in t for x in ["edema", "periorbital edema", "periorbital puffiness", "puffiness around eyes", "facial puffiness", "generalized edema", "nephrotic", "nephritic"]):
        # Check for nephrotic first
        if any(x in t for x in ["nephrotic"]):
            return 22, 165, "Nephrotic Syndrome"
        if any(x in t for x in ["nephritic", "glomerulonephritis", "post-streptococcal", "hematuria", "cola coloured urine", "high coloured urine", "cola colored urine", "hypertensive"]):
            return 22, 162, "Glomerular Disease"
        # Default to nephrotic if proteinuria without hematuria
        if "proteinuria" in t and "hematuria" not in t and "blood" not in t:
            return 22, 165, "Nephrotic Syndrome"
        # Default to glomerular if hematuria
        if "hematuria" in t or "blood" in t or "cola" in t or "colored" in t:
            return 22, 162, "Glomerular Disease"
        return 22, 161, "Evaluation of the Kidney and Urinary Tract"
    if any(x in t for x in ["diuretic", "furosemide", "potassium sparing diuretic", "spironolactone"]):
        return 22, 161, "Evaluation of the Kidney and Urinary Tract"

    # SECTION 23: Endocrinology
    if any(x in t for x in ["congenital hypothyroidism", "hypothyroidism", "thyroid", "goiter", "cretinism", "thyroxine", "tsh", "hyperthyroidism", "graves disease", "thyroiditis", "hashimoto thyroiditis"]):
        return 23, 171, "Thyroid Disease"
    if any(x in t for x in ["diabetes mellitus", "type 1 diabetes", "type 2 diabetes", "diabetic ketoacidosis", "dkd", "insulin", "hypoglycemia", "growth hormone deficiency", "gh deficiency", "short stature", "dwarfism", "constitutional delay of growth and puberty", "cdgp"]):
        return 23, 175, "Diabetes Mellitus"
    if any(x in t for x in ["precocious puberty", "delayed puberty", "puberty", "gonadotropin", "sexual development", "disorders of sexual development", "ambiguous genitalia", "congenital adrenal hyperplasia", "cah"]):
        return 23, 174, "Puberty"
    if any(x in t for x in ["adrenal insufficiency", "addison disease", "cushing syndrome", "hypercortisolism", "pheochromocytoma", "aldosterone", "congenital adrenal hyperplasia", "cah", "adrenal"]):
        return 23, 172, "Disorders of the Adrenal Gland"
    if any(x in t for x in ["calcium", "hypercalcemia", "hypocalcemia", "rickets", "vitamin d", "parathyroid", "pseudohypoparathyroidism", "pth"]):
        return 23, 177, "Calcium and Bone Disorders"
    if any(x in t for x in ["diabetes insipidus", "siadh", "syndrome of inappropriate antidiuretic hormone", "posterior pituitary", "vasopressin", "ddavp"]):
        return 23, 178, "Disorders of the Posterior Pituitary"
    if any(x in t for x in ["growth hormone", "gh", "igf-1", "short stature", "tall stature"]):
        return 23, 170, "Growth"

    # SECTION 24: Neurology
    if any(x in t for x in ["seizure", "epilepsy", "febrile seizure", "febrile convulsion", "status epilepticus", "absence seizure", "tonic-clonic seizure", "myoclonic seizure", "infantile spasm", "west syndrome", "lennox-gastaut syndrome", "child with fever and seizure"]):
        return 24, 180, "Seizures and Epilepsy"
    if any(x in t for x in ["headache", "migraine", "tension headache", "cluster headache"]):
        return 24, 181, "Headaches"
    if any(x in t for x in ["cerebral palsy", "cp", "spastic diplegia", "hemiplegia", "quadriplegia", "dyskinetic cerebral palsy", "ataxic cerebral palsy"]):
        return 24, 182, "Neurodegenerative Disorders"
    if any(x in t for x in ["muscular dystrophy", "duchenne muscular dystrophy", "becker muscular dystrophy", "gower sign", "gower's sign", "myotonic dystrophy", "limb-girdle muscular dystrophy", "facioscapulohumeral muscular dystrophy", "congenital muscular dystrophy"]):
        return 24, 184, "Neuromuscular Disorders"
    if any(x in t for x in ["guillain-barre syndrome", "gbs", "chronic inflammatory demyelinating polyneuropathy", "cidp", "bell palsy", "facial nerve palsy"]):
        return 24, 184, "Neuromuscular Disorders"
    if any(x in t for x in ["neural tube defect", "spina bifida", "meningomyelocele", "myelomeningocele", "encephalocele", "anencephaly", "hydrocephalus", "ventriculoperitoneal shunt", "vp shunt"]):
        return 24, 185, "Neural Tube Defects"
    if any(x in t for x in ["internal capsule", "internal capsule anatomy", "basal ganglia", "cerebellum", "brainstem", "cerebral cortex", "white matter", "corpus callosum", "cerebrospinal fluid", "csf", "blood-brain barrier", "neuroanatomy", "neurophysiology", "neurological examination", "fontanelle", "cranial nerve", "reflexes", "primitive reflexes", "deep tendon reflexes"]):
        return 24, 179, "Evaluation of the Nervous System"
    if any(x in t for x in ["meningitis", "encephalitis", "brain abscess", "subdural empyema", "neurocysticercosis", "cns infection", "central nervous system infection"]):
        return 24, 187, "Central Nervous System Infections"
    if any(x in t for x in ["movement disorder", "tremor", "chorea", "athetosis", "dystonia", "tourette syndrome", "tics", "wilson disease", "hepatolenticular degeneration"]):
        return 24, 183, "Movement Disorders"
    if any(x in t for x in ["neurodegenerative disorder", "tay-sachs disease", "neimann-pick disease", "gaucher disease", "metachromatic leukodystrophy", "adrenoleukodystrophy", "alzheimer disease", "parkinson disease"]):
        return 24, 182, "Neurodegenerative Disorders"
    if any(x in t for x in ["hypotonia", "floppy infant", "benign congenital hypotonia"]):
        return 24, 184, "Neuromuscular Disorders"
    if any(x in t for x in ["ataxia", "friedreich ataxia", "ataxia telangiectasia", "spinocerebellar ataxia"]):
        return 24, 182, "Neurodegenerative Disorders"
    if any(x in t for x in ["neonatal seizure", "neonatal seizures"]):
        return 11, 59, "The Newborn Infant"  # override, neonatal seizures are in neonatal medicine

    # SECTION 25: Dermatology
    if any(x in t for x in ["eczema", "atopic dermatitis", "contact dermatitis", "seborrheic dermatitis", "diaper dermatitis"]):
        return 25, 190, "Eczematous Disorders"
    if any(x in t for x in ["psoriasis", "lichen planus", "pityriasis rosea", "papulosquamous"]):
        return 25, 191, "Papulosquamous Disorders"
    if any(x in t for x in ["bullous", "pemphigus", "epidermolysis bullosa", "vesiculobullous"]):
        return 25, 192, "Vesiculobullous Disorders"
    if any(x in t for x in ["bacterial skin infection", "impetigo", "cellulitis", "folliculitis", "abscess", "furuncle", "carbuncle", "scalded skin syndrome", "staphylococcal scalded skin syndrome", "ssss", "toxic shock syndrome"]):
        return 25, 193, "Infections of the Skin"
    if any(x in t for x in ["viral exanthem", "measles", "rubella", "roseola", "fifth disease", "parvovirus", "hand foot and mouth disease", "hfmd", "herpes simplex", "varicella", "molluscum contagiosum", "warts", "verruca"]):
        return 25, 193, "Infections of the Skin"
    if any(x in t for x in ["fungal skin infection", "tinea", "dermatophytosis", "ringworm", "candidiasis", "pityriasis versicolor"]):
        return 25, 193, "Infections of the Skin"
    if any(x in t for x in ["scabies", "lice", "pediculosis", "infestation"]):
        return 25, 194, "Infestations of the Skin"
    if any(x in t for x in ["pigment", "vitiligo", "albinism", "melasma", "hyperpigmentation", "hypopigmentation"]):
        return 25, 195, "Disorders of Pigmentation"
    if any(x in t for x in ["hair", "alopecia", "hirsutism", "nail", "nail disorder", "onychomycosis"]):
        return 25, 196, "Disorders of Hair and Nails"
    if any(x in t for x in ["birthmark", "hemangioma", "port wine stain", "salmon patch", "mongolian spot", "café-au-lait spot", "nevus", "melanocytic nevus", "congenital melanocytic nevus"]):
        return 25, 188, "Evaluation of the Skin"
    if any(x in t for x in ["kramer rule", "kramer's rule", "birth weight", "gestational age assessment", "ballard score", "newballard score", "dubowitz score", "physical maturity", "neurological maturity", "intrauterine growth restriction", "iugr", "small for gestational age", "sga", "appropriate for gestational age", "aga", "large for gestational age", "lga"]):
        return 11, 59, "The Newborn Infant"
    if any(x in t for x in ["skin manifestation", "cutaneous manifestation", "skin sign of systemic disease", "rash in systemic disease", "petechiae", "purpura", "ecchymosis"]):
        return 25, 189, "Cutaneous Manifestations of Systemic Diseases"

    # SECTION 26: Orthopedics
    if any(x in t for x in ["fracture", "bone fracture", "greenstick fracture", "supracondylar fracture", "colles fracture", "smith fracture", "monteggia fracture", "galeazzi fracture", "salter-harris classification", "growth plate injury", "physeal injury"]):
        return 26, 203, "Common Fractures"
    if any(x in t for x in ["congenital talipes equinovarus", "clubfoot", "ctev", "developmental dysplasia of hip", "ddh", "congenital dislocation of hip", "cdh", "slipped capital femoral epiphysis", "scfe", "legg-calve-perthes disease", "lcpd", "coxa vara", "coxa valga"]):
        return 26, 198, "Common Orthopedic Problems"
    if any(x in t for x in ["scoliosis", "kyphosis", "lordosis", "congenital scoliosis", "idiopathic scoliosis", "adolescent idiopathic scoliosis", "ais", "neuromuscular scoliosis"]):
        return 26, 202, "Scoliosis"
    if any(x in t for x in ["osteomyelitis", "septic arthritis", "bone infection", "joint infection", "pyogenic arthritis", "suppurative arthritis", "transient synovitis", "irritable hip", "perthes disease"]):
        return 26, 201, "Osteomyelitis and Septic Arthritis"
    if any(x in t for x in ["rickets", "metabolic bone disease", "osteogenesis imperfecta", "oi", "achondroplasia", "skeletal dysplasia", "dysplasia"]):
        return 26, 199, "Metabolic Bone Disease"
    if any(x in t for x in ["sports injury", "sports medicine", "overuse injury", "stress fracture", "anterior cruciate ligament", "acl", "meniscal tear", "patellofemoral pain syndrome", "osgood-schlatter disease", "little league elbow", "gymnast wrist", "spondylolysis", "spondylolisthesis"]):
        return 26, 204, "Sports Medicine"
    if any(x in t for x in ["torticollis", "plagiocephaly", "positional plagiocephaly", "metatarsus adductus", "calcaneovalgus", "internal tibial torsion", "femoral anteversion", "genu varum", "genu valgum", "bow legs", "knock knees", "flat feet", "pes planus", "intoeing", "out-toeing", "limp", "gait abnormality", "gower sign"]):
        return 26, 198, "Common Orthopedic Problems"
    if any(x in t for x in ["musculoskeletal examination", "bone age", "bone mineral density", "skeletal survey", "orthopedic assessment"]):
        return 26, 197, "Evaluation of the Musculoskeletal System"

    # Vaccines general
    if any(x in t for x in ["vaccine", "vaccination", "immunization", "pentavalent", "rotavirus vaccine", "mr vaccine", "polio vaccine", "bcg", "hepatitis b vaccine", "hpv vaccine", "cancer vaccine", "pentavalent vaccine", "vaccines given on day one"]):
        return 16, 93, "Infectious Diseases: Introduction"

    # SECTION 1: Profession of Pediatrics (general pediatrics)
    if any(x in t for x in ["growth chart", "percentile", "developmental milestone", "developmental assessment", "developmental screening", "pediatric assessment", "history taking", "physical examination", "vital signs", "anthropometry", "head circumference", "length", "height", "weight", "bmi", "body mass index"]):
        return 1, 1, "The Profession of Pediatrics"

    # Default
    return 1, 1, "The Profession of Pediatrics"


# Manual overrides for specific questions that might be ambiguous
OVERRIDES = {
    "Routes of administration' corrected as \"route of administration\"": (1, 1, "The Profession of Pediatrics"),
    "WHO classification of vitamin A deficiency": (6, 27, "Nutritional Requirements"),
    "Proper positioning during breast feeding": (6, 28, "Breastfeeding"),
    "Rota virus vaccine": (16, 93, "Infectious Diseases: Introduction"),
    "Antenatal diagnosis of down syndrome": (9, 50, "Dysmorphology"),
    "WIFS -Expand and write a short note": (6, 27, "Nutritional Requirements"),
    "Rates of growth of different tissues and organs in children": (2, 5, "Assessment of Fetal Growth and Development"),
    "Prolactin reflex": (6, 28, "Breastfeeding"),
    "Commonly used potassium sparing diuretic": (22, 161, "Evaluation of the Kidney and Urinary Tract"),
    "Age of starting complementary feeding in infants": (6, 29, "Complementary Feeding"),
    "Name two vaccines which prevent cancer": (16, 93, "Infectious Diseases: Introduction"),
    "A five years old male child presented with edema around eyes which progressed to generalized edema in few days. He had normal urine output. Urine examination showed heavy proteinuria, but no haematuria.": (22, 165, "Nephrotic Syndrome"),
    "A six years old child has been brought with history of facial puffiness and high coloured urine for last 12 hours. He is hypertensive, has pedal edema but no ascites or pleural effusion.": (22, 162, "Glomerular Disease"),
    "An eight year old female child is brought to the outpatient department with fever, pain and swelling over major joints which is migratory in nature. Her ESR is 66 mm in first hour. She gives history of sore throat 20 days back.": (15, 86, "Rheumatic Diseases of Childhood"),
    "A five year old child is brought with history of puffiness around eyes, decreased urine output and passing cola coloured urine for the past 3 days. She had pyoderma of legs three weeks back. On examination child has periorbital puffiness and bilateral pitting pedal edema. Her blood pressure is 132/88 mm of Hg": (22, 162, "Glomerular Disease"),
    "A two-year-old male child presented with bilateral pedal edema. His weight is 5 kg, height 75cm and mid upper arm circumference 11cm.": (6, 30, "Nutrition in the Toddler and Preschool Years"),  # Severe acute malnutrition
    "A 2-year-old male is brought to the Emergency room (ER) with history of fever and cough for 3 days followed by puffiness of face, more in the morning hours as soon as getting up from sleep, abdominal distension and reduced urine output. No past history of similar illness": (22, 165, "Nephrotic Syndrome"),
    "A 12-year-old boy is brought to casualty with history of cough, breathing difficulty and difficulty in speaking –one day. On examination he has respiratory rate of 42/mt and SPO is 88% and bilateral rhonchi present. He gives history of recurrent episodes of 2 cough and breathlessness and has been advised regular treatment to which he is not compliant": (18, 136, "Asthma"),
    "Describe the hemodyanamics, clinical features and complications of Ventricular Septal Defect": (19, 140, "Congenital Heart Disease"),
    "A two-year-old child is brought with fever for the last 24 hours and seizure 30 minutes back.": (24, 180, "Seizures and Epilepsy"),
    "Discuss clinical features and management of hemorrhagic disease of newborn.": (11, 59, "The Newborn Infant"),
    "WHO grading of xerophthalmia": (6, 27, "Nutritional Requirements"),
    "Management of cyanotic spells in an infant with tetralogy of fallot": (19, 140, "Congenital Heart Disease"),
    "Discuss the clinical features and management of nocturnal enuresis.": (3, 13, "Elimination Disorders"),
    "Puddle sign": (17, 126, "Evaluation of the Digestive System"),
    "Tracheo-esophageal fistula - Classification": (11, 63, "Congenital Anomalies"),
    "Mention the clinical features of scurvy": (6, 27, "Nutritional Requirements"),
    "Kramer’s rule": (11, 59, "The Newborn Infant"),
    "Internal capsule": (24, 179, "Evaluation of the Nervous System"),
    "Guthrie’s test is done to diagnose which disease.": (9, 48, "The Genetic Basis of Common Diseases"),
    "Mention the drug used for prophylaxis of portal hypertension in children.": (17, 131, "Disorders of the Liver"),
    "Gower’s sign is classically seen in which disease in children.": (24, 184, "Neuromuscular Disorders"),
    "Most common etiological agent causing acute otitis media in children.": (16, 111, "Respiratory Tract Infections"),
    "Drug of choice for acetaminophen (Paracetamol) poisoning": (8, 44, "Poisoning"),
    "Intrauterine infection in which congenital cataract is seen": (16, 95, "Viral Infections"),  # Rubella
    "Complication to be suspected in a five-year-old child having down syndrome with recent onset of gait disturbance": (9, 50, "Dysmorphology"),  # Atlantoaxial instability
    "Drug of choice for prophylaxis in an asymptomatic infant born to mother with active tuberculosis.": (16, 101, "Tuberculosis"),
    "Describe the differences between physiological jaundice and pathological Jaundice.": (11, 59, "The Newborn Infant"),
    "Enumerate the clinical features, radiological findings and management of Kerosene poisoning in children.": (8, 44, "Poisoning"),
    "Write the composition of ORS. Enumerate the management of a 2-year-old child with acute diarrheal disease with no dehydration.": (7, 32, "Maintenance and Replacement Therapy"),
    "Describe the clinical features and management of Idiopathic Thrombocytopenic Purpura in children.": (20, 150, "Bleeding Disorders"),
    "Describe the management of a new case of lymphnode tuberculosis in an 8-year-old child": (16, 101, "Tuberculosis"),
    "Describe the clinical features of a child with severe pneumonia": (18, 135, "Disorders of the Lower Respiratory Tract"),
    "Describe the clinical features and management of breath holding spell.": (3, 11, "Sleep Disorders"),  # Often in behavioral/sleep
    "List eight complications in a preterm baby.": (11, 60, "High-Risk Newborns"),
    "Types of trachea oesophageal fistula.": (11, 63, "Congenital Anomalies"),
    "Radiological features of rickets in children.": (6, 27, "Nutritional Requirements"),
    "Write the protein and calorie content of F75 formula feeds.": (6, 30, "Nutrition in the Toddler and Preschool Years"),
    "Name one non pulmonary cause of respiratory distress in the newborns.": (11, 59, "The Newborn Infant"),
    "Name one nucleo side reverse transcriptase inhibitor drug used in children.": (16, 100, "Human Immunodeficiency Virus Infection"),
    "Name one cause of large head.": (24, 179, "Evaluation of the Nervous System"),
    "Discuss the management of first episode of nephrotic syndrome": (22, 165, "Nephrotic Syndrome"),
    "Discuss the clinical features and management of very severe pneumonia as per National ARI Control Programme.": (18, 135, "Disorders of the Lower Respiratory Tract"),
    "Discuss the management of dengue shock syndrome": (16, 120, "Dengue"),
    "Discuss the clinical features of congestive cardiac failure in infants and children": (19, 143, "Heart Failure"),
    "Physiologic jaundice": (11, 59, "The Newborn Infant"),
    "Modified Jones criteria": (15, 86, "Rheumatic Diseases of Childhood"),
    "Temper tantrum": (3, 14, "Discipline"),
    "MR vaccine campaign": (16, 93, "Infectious Diseases: Introduction"),
    "Breath sounds in lobar pneumonia and acute exacerbation of bronchial asthma": (18, 135, "Disorders of the Lower Respiratory Tract"),
    "Fetal circulation": (19, 139, "Evaluation of the Cardiovascular System"),
    "Name the vaccines given on day one of life.": (16, 93, "Infectious Diseases: Introduction"),
    "Treatment of choice of scrub typhus": (16, 123, "Scrub Typhus"),
    "Number of iron folic acid tablets given during pregnancy in anemia control program.": (6, 27, "Nutritional Requirements"),
    "Sodium content in low osmolar ORS": (7, 32, "Maintenance and Replacement Therapy"),
    "Neonatal seizures": (11, 59, "The Newborn Infant"),
    "Acute follicular tonsillitis": (16, 111, "Respiratory Tract Infections"),
    "Cyanotic spell in tetralogy of fallot": (19, 140, "Congenital Heart Disease"),
    "Pentavalent vaccine": (16, 93, "Infectious Diseases: Introduction"),
    "Management of otitis media": (16, 111, "Respiratory Tract Infections"),
    "Temper tantrums": (3, 14, "Discipline"),
    "Low osmolar ORS": (7, 32, "Maintenance and Replacement Therapy"),
    "Fine motor development in a three-year-old child": (2, 9, "The Preschool Years"),
    "Hypernatremic dehydration": (7, 33, "Dehydration"),
    "Surface marking of the lungs": (18, 133, "Evaluation of the Respiratory System"),
    "Nephron": (22, 161, "Evaluation of the Kidney and Urinary Tract"),
    "Name the long acting penicillin": (16, 93, "Infectious Diseases: Introduction"),
    "Age at which Moro reflex disappears": (2, 6, "The Newborn"),
    "Toxicity of digitalis is increased by which electrolyte disturbance.": (19, 141, "Acquired Heart Disease"),  # or 7, but cardiac glycoside toxicity is in cardiology
    "Currently used oral polio vaccine and the types of viruses it contain.": (16, 93, "Infectious Diseases: Introduction"),
    "Congenital hypothyroidism": (23, 171, "Thyroid Disease"),
    "Autism spectrum disorder": (4, 19, "Autism Spectrum Disorder"),
    "Kangaroo mother care": (11, 60, "High-Risk Newborns"),
    "Management of urinary tract infections in children": (16, 112, "Urinary Tract Infections"),
    "Prevention and management of respiratory distress syndrome in preterm babies of gestational age less than 32 weeks": (11, 60, "High-Risk Newborns"),
    "Complimentary feeding": (6, 29, "Complementary Feeding"),
    "Acute laryngotracheobronchitis - etiology and management": (18, 134, "Disorders of the Upper Respiratory Tract"),
    "Fine motor development up to one year of life": (2, 7, "The First Year"),
    "Normal vesicular breath sounds and breath sounds in acute exacerbation of bronchial asthma": (18, 136, "Asthma"),
    "Peripheral smear in thalassemia major": (20, 149, "Anemias"),
    "Clinical features and management of acute watery diarrhoea with some dehydration": (7, 35, "Fluid and Electrolyte Treatment of Specific Disorders"),
    "Microcephaly": (2, 5, "Assessment of Fetal Growth and Development"),
    "Staphylococcal pneumonia": (16, 111, "Respiratory Tract Infections"),
    "Components and hemodynamics of tetralogy of fallot": (19, 140, "Congenital Heart Disease"),
    "Commonest type of muscular dystrophy in children and its mode of inheritance": (24, 184, "Neuromuscular Disorders"),
    "Dosage and duration of zinc supplementation in a one-year-old child with diarrhea": (6, 27, "Nutritional Requirements"),
    "Cause of hemorrhagic disease of new born": (11, 59, "The Newborn Infant"),
    "One indication for intravenous immunoglobulin in children": (13, 74, "Primary Immunodeficiency Diseases"),
}

def classify(text):
    # First check overrides
    for key, val in OVERRIDES.items():
        if key.lower() in text.lower():
            return val
    # Then keyword classifier
    return classify_question(text)


if __name__ == "__main__":
    main()
