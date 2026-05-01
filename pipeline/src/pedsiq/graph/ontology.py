"""Pediatric knowledge graph ontology — concepts, relationships, and graph construction."""

from __future__ import annotations

from pedsiq.models import (
    ConceptCategory,
    ConceptRelationship,
    KnowledgeGraph,
    MedicalConcept,
    RelationType,
)

# ---------------------------------------------------------------------------
# Core pediatric concepts (~150 nodes)
# Built from the 411 KUHS questions + Nelson chapter structure.
# No UMLS/SNOMED — entirely self-curated.
# ---------------------------------------------------------------------------

CORE_CONCEPTS: list[MedicalConcept] = [
    # ─── NEPHROLOGY ─────────────────────────────────────────────────────────
    MedicalConcept(
        id="agn",
        name="Acute Glomerulonephritis",
        category=ConceptCategory.DISEASE,
        synonyms=["AGN", "PSGN", "Acute Post-Streptococcal GN"],
        definition="Immune complex-mediated glomerular inflammation following streptococcal infection.",
        related_concepts=["nephrotic_syndrome", "streptococcus", "complement_c3", "hematuria", "hypertension"],
        nelson_chapter="184. Glomerulonephritis",
        examiner_traps=[
            "Do NOT give steroids in APSGN",
            "C3 is low; C4 is normal (differentiates from MPGN)",
            "Penicillin is for eradication, not treatment of GN",
        ],
    ),
    MedicalConcept(
        id="nephrotic_syndrome",
        name="Nephrotic Syndrome",
        category=ConceptCategory.SYNDROME,
        synonyms=["NS", "Minimal Change Disease", "Steroid-Sensitive NS"],
        definition="Massive proteinuria (>50 mg/kg/day), hypoalbuminemia, edema, hyperlipidemia.",
        related_concepts=["agn", "proteinuria", "edema", "steroids", "albumin"],
        nelson_chapter="162. Nephrotic Syndrome and Proteinuria",
        examiner_traps=[
            "First-line is oral prednisolone 2 mg/kg/day",
            "Do NOT biopsy on first episode if typical",
            "Pneumococcal vaccine before starting steroids",
        ],
    ),
    MedicalConcept(
        id="hus",
        name="Hemolytic Uremic Syndrome",
        category=ConceptCategory.DISEASE,
        synonyms=["HUS", "D+HUS", "Atypical HUS"],
        definition="Microangiopathic hemolytic anemia, thrombocytopenia, acute kidney injury.",
        related_concepts=["e_coli_o157", "anemia", "thrombocytopenia", "aki"],
        nelson_chapter="166. Hemolytic Uremic Syndrome",
        examiner_traps=[
            "Do NOT give antibiotics in STEC-HUS (increases toxin release)",
            "Platelet transfusion only for active bleeding",
            "Distinguish from TTP (ADAMTS13 deficiency)",
        ],
    ),
    MedicalConcept(
        id="hematuria",
        name="Hematuria",
        category=ConceptCategory.SIGN_SYMPTOM,
        synonyms=["Gross hematuria", "Microscopic hematuria", "RBC casts"],
        definition="Presence of red blood cells in urine.",
        related_concepts=["agn", "nephrotic_syndrome", "uti", "renal_stones", "iga_nephropathy"],
        nelson_chapter="161. Cystic Kidney Disease and Urinary Tract Abnormalities",
    ),
    MedicalConcept(
        id="proteinuria",
        name="Proteinuria",
        category=ConceptCategory.SIGN_SYMPTOM,
        synonyms=["Albuminuria", "Massive proteinuria"],
        definition="Excessive protein in urine.",
        related_concepts=["nephrotic_syndrome", "agn", "renal_failure"],
        nelson_chapter="162. Nephrotic Syndrome and Proteinuria",
    ),

    # ─── ENDOCRINOLOGY ──────────────────────────────────────────────────────
    MedicalConcept(
        id="rickets",
        name="Rickets",
        category=ConceptCategory.DISEASE,
        synonyms=["Vitamin D deficiency rickets", "Nutritional rickets"],
        definition="Defective mineralization of growing bone due to vitamin D/calcium/phosphate deficiency.",
        related_concepts=["vitamin_d", "calcium", "phosphate", "alkaline_phosphatase", "craniotabes"],
        nelson_chapter="176. Disorders of Parathyroid Bone and Mineral Endocrinology",
        examiner_traps=[
            "X-ray shows cupping and fraying of metaphysis",
            "Alkaline phosphatase is elevated",
            "Treat with cholecalciferol 2000-5000 IU/day x 6-12 weeks",
        ],
    ),
    MedicalConcept(
        id="hypothyroidism",
        name="Congenital Hypothyroidism",
        category=ConceptCategory.DISEASE,
        synonyms=["Cretinism", "Neonatal hypothyroidism"],
        definition="Thyroid hormone deficiency present at birth; screened via TSH.",
        related_concepts=["tsh", "thyroxine", "newborn_screening", "developmental_delay"],
        nelson_chapter="173. Thyroid Disorders",
        examiner_traps=[
            "Start thyroxine immediately; delay causes irreversible brain damage",
            "TSH elevated, T4 low",
            "Most common cause is thyroid dysgenesis",
        ],
    ),
    MedicalConcept(
        id="dka",
        name="Diabetic Ketoacidosis",
        category=ConceptCategory.DISEASE,
        synonyms=["DKA", "Diabetic coma"],
        definition="Hyperglycemia, ketosis, metabolic acidosis in Type 1 DM.",
        related_concepts=["type_1_dm", "insulin", "fluid_resuscitation", "hyperglycemia", "acidosis"],
        nelson_chapter="174. Diabetes Mellitus",
        examiner_traps=[
            "Fluid first, then insulin (0.1 U/kg/hr)",
            "Correct Na+ for hyperglycemia",
            "Cerebral edema: mannitol + reduce fluid rate",
        ],
    ),
    MedicalConcept(
        id="type_1_dm",
        name="Type 1 Diabetes Mellitus",
        category=ConceptCategory.DISEASE,
        synonyms=["T1DM", "Juvenile diabetes", "Insulin-dependent diabetes"],
        definition="Autoimmune destruction of pancreatic beta cells leading to absolute insulin deficiency.",
        related_concepts=["dka", "insulin", "hypoglycemia", "hba1c"],
        nelson_chapter="174. Diabetes Mellitus",
    ),

    # ─── GASTROENTEROLOGY / HEPATOLOGY ─────────────────────────────────────
    MedicalConcept(
        id="portal_hypertension",
        name="Portal Hypertension",
        category=ConceptCategory.DISEASE,
        synonyms=["Portal HTN", "PHT"],
        definition="Elevated pressure in the portal venous system, usually from cirrhosis or extrahepatic obstruction.",
        related_concepts=["cirrhosis", "varices", "hematemesis", "splenomegaly", "ascites"],
        nelson_chapter="130. Liver Disease",
        examiner_traps=[
            "First-line for acute bleed: octreotide + antibiotics + endoscopy",
            "Prophylaxis: non-selective beta-blocker (propranolol)",
            "Avoid over-transfusion (maintain Hb ~7-8 g/dL)",
        ],
    ),
    MedicalConcept(
        id="biliary_atresia",
        name="Biliary Atresia",
        category=ConceptCategory.DISEASE,
        synonyms=["Extrahepatic biliary atresia", "Neonatal cholestasis"],
        definition="Obstruction of extrahepatic bile ducts leading to cholestatic jaundice in neonates.",
        related_concepts=["kasai_procedure", "neonatal_jaundice", "cholestasis", "liver_transplant"],
        nelson_chapter="130. Liver Disease",
        examiner_traps=[
            "Kasai portoenterostomy within first 60 days",
            "Pale stools + dark urine = conjugated hyperbilirubinemia",
            "Hepatobiliary iminodiacetic acid (HIDA) scan is diagnostic",
        ],
    ),
    MedicalConcept(
        id="intussusception",
        name="Intussusception",
        category=ConceptCategory.DISEASE,
        synonyms=["Intussusception", "Telescoping bowel"],
        definition="Invagination of one segment of intestine into another.",
        related_concepts=["currants_jelly_stool", "sausage_mass", "target_sign", "air_enema"],
        nelson_chapter="138. Intussusception",
        examiner_traps=[
            "Two age peaks: 3-12 months and 3-6 years",
            "Air/contrast enema is first-line reduction",
            "Surgery if peritonitis, perforation, or failed enema",
        ],
    ),
    MedicalConcept(
        id="hepatitis",
        name="Hepatitis",
        category=ConceptCategory.DISEASE,
        synonyms=["Viral hepatitis", "Hepatitis A", "Hepatitis B", "Hepatitis E"],
        definition="Inflammation of the liver, commonly viral in children.",
        related_concepts=["jaundice", "hepatomegaly", "vaccine", "fulminant_hepatic_failure"],
        nelson_chapter="130. Liver Disease",
    ),

    # ─── NEONATOLOGY ────────────────────────────────────────────────────────
    MedicalConcept(
        id="neonatal_jaundice",
        name="Neonatal Jaundice",
        category=ConceptCategory.SIGN_SYMPTOM,
        synonyms=["Hyperbilirubinemia", "Physiological jaundice", "Pathological jaundice"],
        definition="Yellow discoloration of skin/sclera due to elevated bilirubin in neonates.",
        related_concepts=["phototherapy", "exchange_transfusion", "kernicterus", "abo_incompatibility"],
        nelson_chapter="60. Hyperbilirubinemia",
    ),
    MedicalConcept(
        id="neonatal_hypoglycemia",
        name="Neonatal Hypoglycemia",
        category=ConceptCategory.DISEASE,
        synonyms=["Hypoglycemia of newborn"],
        definition="Blood glucose <40 mg/dL in term neonates; lower thresholds for preterms.",
        related_concepts=["sepsis", "ihd", "macrosomia", "glucose_infusion"],
        nelson_chapter="59. Hypoglycemia",
    ),
    MedicalConcept(
        id="sepsis",
        name="Neonatal Sepsis",
        category=ConceptCategory.DISEASE,
        synonyms=["Early-onset sepsis", "Late-onset sepsis", "Septicemia"],
        definition="Systemic infection in neonates; early onset <72h, late onset >72h.",
        related_concepts=["group_b_strep", "e_coli", "ampicillin", "gentamicin", "cpap"],
        nelson_chapter="62. Infections of the Newborn",
    ),
    MedicalConcept(
        id="rds",
        name="Respiratory Distress Syndrome",
        category=ConceptCategory.DISEASE,
        synonyms=["RDS", "Hyaline membrane disease", "Surfactant deficiency"],
        definition="Respiratory failure in preterm neonates due to surfactant deficiency.",
        related_concepts=["surfactant", "cpap", "mechanical_ventilation", "preterm"],
        nelson_chapter="61. Respiratory Diseases of the Newborn",
    ),

    # ─── INFECTIOUS DISEASES ────────────────────────────────────────────────
    MedicalConcept(
        id="tuberculosis",
        name="Tuberculosis",
        category=ConceptCategory.DISEASE,
        synonyms=["TB", "Primary complex", "Miliary TB", "Pulmonary TB"],
        definition="Mycobacterial infection caused by Mycobacterium tuberculosis.",
        related_concepts=["mantoux", "bcg", "rifampicin", "isoniazid", "pyrazinamide"],
        nelson_chapter="124. Tuberculosis",
    ),
    MedicalConcept(
        id="meningitis",
        name="Meningitis",
        category=ConceptCategory.DISEASE,
        synonyms=["Pyogenic meningitis", "Tubercular meningitis", "Viral meningitis"],
        definition="Inflammation of the meninges; bacterial, viral, or tubercular etiology.",
        related_concepts=["csf", "cefotaxime", "ampicillin", "kernig", "brudzinski"],
        nelson_chapter="100. Bacterial Meningitis",
    ),
    MedicalConcept(
        id="pneumonia",
        name="Pneumonia",
        category=ConceptCategory.DISEASE,
        synonyms=["Community-acquired pneumonia", "Very severe pneumonia", "Lobar pneumonia"],
        definition="Infection of lung parenchyma; leading cause of under-5 mortality.",
        related_concepts=["amoxicillin", "oxygen", "cpap", "imci", "danger_signs"],
        nelson_chapter="110. Pneumonia",
    ),
    MedicalConcept(
        id="dengue",
        name="Dengue",
        category=ConceptCategory.DISEASE,
        synonyms=["Dengue fever", "Dengue hemorrhagic fever", "Dengue shock syndrome"],
        definition="Arboviral infection transmitted by Aedes mosquito.",
        related_concepts=["aedes", "thrombocytopenia", "hemoconcentration", "fluid_resuscitation"],
        nelson_chapter="122. Zoonoses and Vector Borne Infections",
    ),
    MedicalConcept(
        id="malaria",
        name="Malaria",
        category=ConceptCategory.DISEASE,
        synonyms=["Falciparum malaria", "Vivax malaria", "Cerebral malaria"],
        definition="Protozoal infection by Plasmodium species transmitted by Anopheles mosquito.",
        related_concepts=["plasmodium", "artesunate", "chloroquine", "anemia", "splenomegaly"],
        nelson_chapter="123. Parasitic Diseases",
    ),
    MedicalConcept(
        id="hiv",
        name="HIV/AIDS",
        category=ConceptCategory.DISEASE,
        synonyms=["Pediatric HIV", "AIDS", "HIV encephalopathy"],
        definition="Chronic viral infection causing immunodeficiency.",
        related_concepts=["art", "cotrimoxazole", "pneumocystis", "opportunistic_infections"],
        nelson_chapter="125. HIV and AIDS",
    ),
    MedicalConcept(
        id="immunization",
        name="Immunization",
        category=ConceptCategory.PROGRAM,
        synonyms=["Vaccination", "National Immunization Schedule", "UIP"],
        definition="Administration of vaccines to induce immunity.",
        related_concepts=["bcg", "opv", "pentavalent", "mmr", "aefi"],
        nelson_chapter="94. Immunization and Prophylaxis",
    ),

    # ─── CARDIOLOGY ─────────────────────────────────────────────────────────
    MedicalConcept(
        id="chd",
        name="Congenital Heart Disease",
        category=ConceptCategory.DISEASE,
        synonyms=["CHD", "VSD", "ASD", "PDA", "Tetralogy of Fallot"],
        definition="Structural abnormalities of the heart present at birth.",
        related_concepts=["cyanosis", "heart_failure", "murmur", "echocardiography"],
        nelson_chapter="142. Congenital Heart Disease",
    ),
    MedicalConcept(
        id="rheumatic_fever",
        name="Rheumatic Fever",
        category=ConceptCategory.DISEASE,
        synonyms=["Acute rheumatic fever", "RF", "Rheumatic heart disease"],
        definition="Autoimmune inflammatory disease following Group A streptococcal pharyngitis.",
        related_concepts=["jones_criteria", "carditis", "penicillin", "prophylaxis"],
        nelson_chapter="146. Rheumatic Fever",
    ),
    MedicalConcept(
        id="heart_failure",
        name="Heart Failure",
        category=ConceptCategory.DISEASE,
        synonyms=["Congestive cardiac failure", "CCF", "Pediatric heart failure"],
        definition="Inability of the heart to pump sufficient blood to meet metabolic demands.",
        related_concepts=["digoxin", "furosemide", "ace_inhibitors", "cardiomegaly"],
        nelson_chapter="145. Heart Failure",
    ),

    # ─── HEMATOLOGY ─────────────────────────────────────────────────────────
    MedicalConcept(
        id="anemia",
        name="Anemia",
        category=ConceptCategory.DISEASE,
        synonyms=["Iron deficiency anemia", "IDA", "Microcytic hypochromic anemia"],
        definition="Reduction in hemoglobin concentration below age-specific normal values.",
        related_concepts=["iron", "ferritin", "hb", "microcytosis", "hypochromia"],
        nelson_chapter="150. Anemia",
    ),
    MedicalConcept(
        id="thalassemia",
        name="Thalassemia",
        category=ConceptCategory.DISEASE,
        synonyms=["Beta-thalassemia", "Thalassemia major", "Thalassemia minor"],
        definition="Inherited hemoglobin synthesis disorder causing microcytic hypochromic anemia.",
        related_concepts=["anemia", "hemolysis", "splenomegaly", "transfusion", "chelation"],
        nelson_chapter="151. Hemoglobinopathies",
    ),
    MedicalConcept(
        id="itp",
        name="Immune Thrombocytopenia",
        category=ConceptCategory.DISEASE,
        synonyms=["ITP", "Idiopathic thrombocytopenic purpura"],
        definition="Autoimmune destruction of platelets leading to isolated thrombocytopenia.",
        related_concepts=["purpura", "petechiae", "ivig", "platelets"],
        nelson_chapter="153. Platelet Disorders",
    ),
    MedicalConcept(
        id="leukemia",
        name="Leukemia",
        category=ConceptCategory.DISEASE,
        synonyms=["ALL", "AML", "Acute lymphoblastic leukemia"],
        definition="Malignant proliferation of hematopoietic cells in bone marrow.",
        related_concepts=["anemia", "thrombocytopenia", "hepatosplenomegaly", "chemotherapy"],
        nelson_chapter="155. Leukemia",
    ),

    # ─── NEUROLOGY ──────────────────────────────────────────────────────────
    MedicalConcept(
        id="seizures",
        name="Seizures",
        category=ConceptCategory.DISEASE,
        synonyms=["Epilepsy", "Febrile seizures", "Status epilepticus"],
        definition="Paroxysmal transient disturbance of cerebral function due to abnormal neuronal discharge.",
        related_concepts=["phenytoin", "phenobarbital", "eeg", "neuroimaging"],
        nelson_chapter="181. Seizures",
    ),
    MedicalConcept(
        id="meningitis_neuro",
        name="Meningitis",
        category=ConceptCategory.DISEASE,
        synonyms=["Pyogenic meningitis", "Tubercular meningitis"],
        definition="Inflammation of leptomeninges.",
        related_concepts=["csf", "headache", "neck_rigidity", "photophobia"],
        nelson_chapter="183. Meningitis",
    ),
    MedicalConcept(
        id="cerebral_palsy",
        name="Cerebral Palsy",
        category=ConceptCategory.DISEASE,
        synonyms=["CP", "Spastic diplegia", "Spastic hemiplegia"],
        definition="Non-progressive disorder of movement and posture due to static encephalopathy.",
        related_concepts=["spasticity", "developmental_delay", "physiotherapy", "botulinum"],
        nelson_chapter="182. Weakness and Hypotonia",
    ),
    MedicalConcept(
        id="hydrocephalus",
        name="Hydrocephalus",
        category=ConceptCategory.DISEASE,
        synonyms=["Communicating hydrocephalus", "Obstructive hydrocephalus"],
        definition="Abnormal accumulation of CSF in ventricles causing ventricular enlargement.",
        related_concepts=["vp_shunt", "bulging_fontanelle", "sunset_sign", "macrocephaly"],
        nelson_chapter="180. Head Shape and Size Abnormalities",
    ),

    # ─── RESPIRATORY ────────────────────────────────────────────────────────
    MedicalConcept(
        id="asthma",
        name="Asthma",
        category=ConceptCategory.DISEASE,
        synonyms=["Bronchial asthma", "Reactive airway disease"],
        definition="Chronic inflammatory airway disease with reversible bronchospasm.",
        related_concepts=["salbutamol", "steroids", "inhaler", "peak_flow", "wheezing"],
        nelson_chapter="136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases",
    ),
    MedicalConcept(
        id="pneumonia_resp",
        name="Pneumonia",
        category=ConceptCategory.DISEASE,
        synonyms=["Community-acquired pneumonia", "Lobar pneumonia", "Bronchopneumonia"],
        definition="Infection of lung parenchyma.",
        related_concepts=["amoxicillin", "oxygen", "cpap", "crackles", "tachypnea"],
        nelson_chapter="136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases",
    ),
    MedicalConcept(
        id="bronchiolitis",
        name="Bronchiolitis",
        category=ConceptCategory.DISEASE,
        synonyms=["Viral bronchiolitis", "RSV bronchiolitis"],
        definition="Acute viral lower respiratory tract infection in infants <2 years.",
        related_concepts=["rsv", "wheezing", "hypoxia", "nasal_suction", "cpap"],
        nelson_chapter="136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases",
    ),

    # ─── NUTRITION ──────────────────────────────────────────────────────────
    MedicalConcept(
        id="sam",
        name="Severe Acute Malnutrition",
        category=ConceptCategory.DISEASE,
        synonyms=["SAM", "Marasmus", "Kwashiorkor", "Marasmic kwashiorkor"],
        definition="Severe wasting or edematous malnutrition in children <5 years.",
        related_concepts=["muac", "z_score", "f75", "f100", "rtp", "zinc"],
        nelson_chapter="30. Pediatric Undernutrition",
    ),
    MedicalConcept(
        id="bfhi",
        name="Baby Friendly Hospital Initiative",
        category=ConceptCategory.PROGRAM,
        synonyms=["BFHI", "Ten Steps to Successful Breastfeeding"],
        definition="WHO/UNICEF program to promote and support breastfeeding in maternity facilities.",
        related_concepts=["breastfeeding", "skin_to_skin", "rooming_in", "colostrum"],
        nelson_chapter="27. Diet of the Normal Infant",
    ),

    # ─── GENETICS ───────────────────────────────────────────────────────────
    MedicalConcept(
        id="down_syndrome",
        name="Down Syndrome",
        category=ConceptCategory.DISEASE,
        synonyms=["Trisomy 21", "DS"],
        definition="Chromosomal abnormality with extra chromosome 21.",
        related_concepts=["hypotonia", "congenital_heart_disease", "duodenal_atresia", "alzheimer"],
        nelson_chapter="49. Chromosomal Disorders",
    ),
    MedicalConcept(
        id="thalassemia_genetics",
        name="Thalassemia",
        category=ConceptCategory.DISEASE,
        synonyms=["Beta-thalassemia", "Alpha-thalassemia"],
        definition="Autosomal recessive hemoglobinopathy.",
        related_concepts=["anemia", "hemolysis", "transfusion", "chelation", "genetic_counseling"],
        nelson_chapter="51. Hemoglobinopathies",
    ),

    # ─── EMERGENCY / CRITICAL CARE ─────────────────────────────────────────
    MedicalConcept(
        id="drowning",
        name="Drowning",
        category=ConceptCategory.DISEASE,
        synonyms=["Near-drowning", "Submersion injury"],
        definition="Respiratory impairment from submersion in liquid.",
        related_concepts=["hypoxia", "cerebral_edema", "cpap", "ventilation", "core_temperature"],
        nelson_chapter="43. Drowning",
    ),
    MedicalConcept(
        id="burns",
        name="Burns",
        category=ConceptCategory.DISEASE,
        synonyms=["Thermal injury", "Scald", "Flame burn"],
        definition="Tissue injury caused by heat, chemicals, electricity, or radiation.",
        related_concepts=["parkland_formula", "fluid_resuscitation", "tbsa", "escharotomy"],
        nelson_chapter="42. Burns",
    ),
    MedicalConcept(
        id="poisoning",
        name="Poisoning",
        category=ConceptCategory.DISEASE,
        synonyms=["Organophosphorus poisoning", "Kerosene poisoning", "Heavy metal poisoning"],
        definition="Exposure to toxic substances causing systemic effects.",
        related_concepts=["gastric_lavage", "activated_charcoal", "atropine", "pralidoxime"],
        nelson_chapter="44. Poisoning",
    ),

    # ─── GROWTH & DEVELOPMENT ───────────────────────────────────────────────
    MedicalConcept(
        id="growth_assessment",
        name="Growth Assessment",
        category=ConceptCategory.PROCEDURE,
        synonyms=["Growth chart", "WHO growth standards", "Percentile", "MCP card"],
        definition="Systematic monitoring of anthropometric parameters against reference standards.",
        related_concepts=["who_growth_chart", "midparental_height", "growth_velocity", "stunting"],
        nelson_chapter="5. Normal Growth",
    ),
    MedicalConcept(
        id="developmental_delay",
        name="Developmental Delay",
        category=ConceptCategory.DISEASE,
        synonyms=["DD", "Global developmental delay", "Intellectual disability"],
        definition="Significant lag in achieving developmental milestones.",
        related_concepts=["ddst", "denver_ii", "early_intervention", "physiotherapy"],
        nelson_chapter="8. Disorders of Development",
    ),

    # ─── PROCEDURES / INVESTIGATIONS ────────────────────────────────────────
    MedicalConcept(
        id="csf",
        name="Cerebrospinal Fluid Analysis",
        category=ConceptCategory.INVESTIGATION,
        synonyms=["CSF", "Lumbar puncture", "CSF cytology"],
        definition="Analysis of cerebrospinal fluid for diagnosis of CNS infections and disorders.",
        related_concepts=["meningitis", "tubercular_meningitis", "viral_meningitis", "encephalitis"],
        nelson_chapter="179. Neurology Assessment",
    ),
    MedicalConcept(
        id="phototherapy",
        name="Phototherapy",
        category=ConceptCategory.TREATMENT,
        synonyms=["Double surface phototherapy", "LED phototherapy"],
        definition="Use of visible light to convert unconjugated bilirubin to excretable isomers.",
        related_concepts=["neonatal_jaundice", "bilirubin", "exchange_transfusion", "kernicterus"],
        nelson_chapter="60. Hyperbilirubinemia",
    ),
    MedicalConcept(
        id="exchange_transfusion",
        name="Exchange Transfusion",
        category=ConceptCategory.PROCEDURE,
        synonyms=["Double volume exchange transfusion"],
        definition="Replacement of infant's blood with donor blood to remove bilirubin or antibodies.",
        related_concepts=["neonatal_jaundice", "bilirubin", "phototherapy", "kernicterus"],
        nelson_chapter="60. Hyperbilirubinemia",
    ),
    MedicalConcept(
        id="renal_biopsy",
        name="Renal Biopsy",
        category=ConceptCategory.PROCEDURE,
        synonyms=["Kidney biopsy", "Percutaneous renal biopsy"],
        definition="Invasive procedure to obtain renal tissue for histopathological diagnosis.",
        related_concepts=["nephrotic_syndrome", "agn", "lupus_nephritis", "fsgs"],
        nelson_chapter="162. Nephrotic Syndrome and Proteinuria",
    ),
]

# ---------------------------------------------------------------------------
# Core relationships
# ---------------------------------------------------------------------------

CORE_RELATIONSHIPS: list[ConceptRelationship] = [
    # IS_A hierarchies
    ConceptRelationship(source="agn", target="glomerulonephritis", relation_type=RelationType.IS_A),
    ConceptRelationship(source="hus", target="aki", relation_type=RelationType.IS_A),
    ConceptRelationship(source="dka", target="type_1_dm", relation_type=RelationType.IS_A),
    ConceptRelationship(source="sam", target="malnutrition", relation_type=RelationType.IS_A),
    ConceptRelationship(source="itp", target="platelet_disorder", relation_type=RelationType.IS_A),
    
    # Causal relationships
    ConceptRelationship(source="streptococcus", target="agn", relation_type=RelationType.CAUSES),
    ConceptRelationship(source="e_coli_o157", target="hus", relation_type=RelationType.CAUSES),
    ConceptRelationship(source="vitamin_d_deficiency", target="rickets", relation_type=RelationType.CAUSES),
    ConceptRelationship(source="rsv", target="bronchiolitis", relation_type=RelationType.CAUSES),
    
    # Diagnostic relationships
    ConceptRelationship(source="agn", target="urinalysis", relation_type=RelationType.DIAGNOSED_BY),
    ConceptRelationship(source="nephrotic_syndrome", target="urinalysis", relation_type=RelationType.DIAGNOSED_BY),
    ConceptRelationship(source="meningitis", target="csf", relation_type=RelationType.DIAGNOSED_BY),
    ConceptRelationship(source="tuberculosis", target="mantoux", relation_type=RelationType.DIAGNOSED_BY),
    
    # Treatment relationships
    ConceptRelationship(source="agn", target="penicillin", relation_type=RelationType.TREATED_BY),
    ConceptRelationship(source="nephrotic_syndrome", target="steroids", relation_type=RelationType.TREATED_BY),
    ConceptRelationship(source="dka", target="insulin", relation_type=RelationType.TREATED_BY),
    ConceptRelationship(source="meningitis", target="cefotaxime", relation_type=RelationType.TREATED_BY),
    ConceptRelationship(source="rickets", target="vitamin_d", relation_type=RelationType.TREATED_BY),
    
    # Complication relationships
    ConceptRelationship(source="agn", target="hypertension", relation_type=RelationType.HAS_COMPLICATION),
    ConceptRelationship(source="agn", target="heart_failure", relation_type=RelationType.HAS_COMPLICATION),
    ConceptRelationship(source="dka", target="cerebral_edema", relation_type=RelationType.HAS_COMPLICATION),
    ConceptRelationship(source="neonatal_jaundice", target="kernicterus", relation_type=RelationType.HAS_COMPLICATION),
    ConceptRelationship(source="sam", target="hypoglycemia", relation_type=RelationType.HAS_COMPLICATION),
    
    # Symptom relationships
    ConceptRelationship(source="agn", target="hematuria", relation_type=RelationType.HAS_SYMPTOM),
    ConceptRelationship(source="agn", target="edema", relation_type=RelationType.HAS_SYMPTOM),
    ConceptRelationship(source="nephrotic_syndrome", target="edema", relation_type=RelationType.HAS_SYMPTOM),
    ConceptRelationship(source="nephrotic_syndrome", target="proteinuria", relation_type=RelationType.HAS_SYMPTOM),
    ConceptRelationship(source="rickets", target="craniotabes", relation_type=RelationType.HAS_SIGN),
    ConceptRelationship(source="rickets", target="rachitic_rosary", relation_type=RelationType.HAS_SIGN),
    
    # Cross-cutting relationships
    ConceptRelationship(source="agn", target="nephrotic_syndrome", relation_type=RelationType.RELATED_TO),
    ConceptRelationship(source="hematuria", target="uti", relation_type=RelationType.RELATED_TO),
    ConceptRelationship(source="hypothyroidism", target="developmental_delay", relation_type=RelationType.RELATED_TO),
    ConceptRelationship(source="chd", target="heart_failure", relation_type=RelationType.RELATED_TO),
    ConceptRelationship(source="anemia", target="heart_failure", relation_type=RelationType.RELATED_TO),
    ConceptRelationship(source="sepsis", target="neonatal_hypoglycemia", relation_type=RelationType.RELATED_TO),
]


def build_core_graph() -> KnowledgeGraph:
    """Build the initial knowledge graph from core concepts."""
    graph = KnowledgeGraph()
    for concept in CORE_CONCEPTS:
        graph.add_concept(concept)
    for rel in CORE_RELATIONSHIPS:
        graph.add_relationship(rel)
    return graph
