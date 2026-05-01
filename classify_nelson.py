import json
import os
import re
from collections import Counter, defaultdict

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

# Load extracted questions
with open(os.path.join(OUTPUT_DIR, "questions_raw.json"), 'r', encoding='utf-8') as f:
    data = json.load(f)

# Nelson Essentials of Pediatrics 8th Edition - Chapter mapping
# Each chapter has keywords that help classify questions

NELSON_CHAPTERS = [
    # Section 1: Profession of Pediatrics
    {"section": "1. Profession of Pediatrics", "chapter": "1. Population and Culture", "keywords": ["population", "culture", "health disparity", "infant mortality", "breast feeding rate", "cause of death"]},
    {"section": "1. Profession of Pediatrics", "chapter": "2. Professionalism", "keywords": ["professionalism", "altruism", "advocacy", "integrity"]},
    {"section": "1. Profession of Pediatrics", "chapter": "3. Ethics and Legal Issues", "keywords": ["ethics", "legal", "consent", "assent", "autonomy", "beneficence", "nonmaleficence", "justice", "paternalism", "poCSO", "medicolegal"]},
    {"section": "1. Profession of Pediatrics", "chapter": "4. Palliative Care and End-of-Life Issues", "keywords": ["palliative", "end of life", "hospice", "death", "bereavement", "do not resuscitate"]},
    
    # Section 2: Growth and Development
    {"section": "2. Growth and Development", "chapter": "5. Normal Growth", "keywords": ["normal growth", "growth chart", "who growth", "iap growth", "percentile", "mcp card", "mid arm circumference", "muac", "weight for age", "height for age", "weight for height", "bmi", "head circumference"]},
    {"section": "2. Growth and Development", "chapter": "6. Disorders of Growth", "keywords": ["failure to thrive", "ftt", "short stature", "tall stature", "growth hormone deficiency", "familial short stature", "constitutional delay"]},
    {"section": "2. Growth and Development", "chapter": "7. Normal Development", "keywords": ["normal development", "developmental milestone", "primitive reflex", "moro", "grasp", "rooting", "sucking", "denver", "ddst", "developmental screening"]},
    {"section": "2. Growth and Development", "chapter": "8. Disorders of Development", "keywords": ["developmental delay", "developmental disorder", "global delay", "intellectual disability"]},
    {"section": "2. Growth and Development", "chapter": "9. Evaluation of the Well Child", "keywords": ["well child", "routine examination", "preventive care"]},
    {"section": "2. Growth and Development", "chapter": "10. Evaluation of the Child With Special Needs", "keywords": ["special needs", "disability", "cerebral palsy screening"]},
    
    # Section 3: Behavioral Disorders
    {"section": "3. Behavioral Disorders", "chapter": "11. Crying and Colic", "keywords": ["colic", "excessive crying", "infantile colic"]},
    {"section": "3. Behavioral Disorders", "chapter": "12. Temper Tantrums", "keywords": ["temper tantrum", "tantrum"]},
    {"section": "3. Behavioral Disorders", "chapter": "13. Attention-Deficit/Hyperactivity Disorder", "keywords": ["adhd", "attention deficit", "hyperactivity"]},
    {"section": "3. Behavioral Disorders", "chapter": "14. Control of Elimination", "keywords": ["enuresis", "encopresis", "bedwetting", "soiling"]},
    {"section": "3. Behavioral Disorders", "chapter": "15. Normal Sleep and Pediatric Sleep Disorders", "keywords": ["sleep disorder", "apnea", "insomnia", "night terror"]},
    
    # Section 4: Psychiatric Disorders
    {"section": "4. Psychiatric Disorders", "chapter": "16. Somatic Symptom and Related Disorders", "keywords": ["somatic symptom", "conversion disorder"]},
    {"section": "4. Psychiatric Disorders", "chapter": "17. Anxiety Disorders", "keywords": ["anxiety", "phobia", "separation anxiety"]},
    {"section": "4. Psychiatric Disorders", "chapter": "18. Depressive Disorders and Bipolar Disorders", "keywords": ["depression", "bipolar", "mood disorder"]},
    {"section": "4. Psychiatric Disorders", "chapter": "19. Obsessive-Compulsive Disorder", "keywords": ["obsessive compulsive", "ocd"]},
    {"section": "4. Psychiatric Disorders", "chapter": "20. Autism Spectrum Disorder and Schizophrenia Spectrum Disorders", "keywords": ["autism", "autistic", "asperger", "schizophrenia"]},
    
    # Section 5: Psychosocial Issues
    {"section": "5. Psychosocial Issues", "chapter": "21. Failure to Thrive", "keywords": ["failure to thrive", "ftt", "nonorganic", "psychosocial"]},
    {"section": "5. Psychosocial Issues", "chapter": "22. Child Abuse and Neglect", "keywords": ["child abuse", "neglect", "maltreatment", "shaken baby", "nonaccidental", "bruise", "burn", "fracture abuse"]},
    {"section": "5. Psychosocial Issues", "chapter": "23. Homosexuality and Gender Identity", "keywords": ["gender identity", "homosexuality", "lgbtq"]},
    {"section": "5. Psychosocial Issues", "chapter": "24. Family Structure and Function", "keywords": ["family structure", "divorce", "separation"]},
    {"section": "5. Psychosocial Issues", "chapter": "25. Violence", "keywords": ["violence", "assault", "homicide"]},
    {"section": "5. Psychosocial Issues", "chapter": "26. Divorce, Separation, and Bereavement", "keywords": ["divorce", "separation", "bereavement", "grief"]},
    
    # Section 6: Pediatric Nutrition and Nutritional Disorders
    {"section": "6. Pediatric Nutrition", "chapter": "27. Diet of the Normal Infant", "keywords": ["infant diet", "complementary feeding", "weaning", "solids", "exclusive breast feeding"]},
    {"section": "6. Pediatric Nutrition", "chapter": "28. Diet of the Normal Child and Adolescent", "keywords": ["child diet", "adolescent diet", "nutritional requirement"]},
    {"section": "6. Pediatric Nutrition", "chapter": "29. Obesity", "keywords": ["obesity", "overweight", "bmi", "weight loss"]},
    {"section": "6. Pediatric Nutrition", "chapter": "30. Pediatric Undernutrition", "keywords": ["undernutrition", "malnutrition", "sam", "mam", "severe acute malnutrition", "marasmus", "kwashiorkor"]},
    {"section": "6. Pediatric Nutrition", "chapter": "31. Vitamin and Mineral Deficiencies", "keywords": ["vitamin deficiency", "mineral deficiency", "vitamin a", "vitamin d", "vitamin k", "iron", "zinc", "folate", "b12"]},
    
    # Section 7: Fluids and Electrolytes
    {"section": "7. Fluids and Electrolytes", "chapter": "32. Maintenance Fluid Therapy", "keywords": ["maintenance fluid", "fluid requirement", "holliday segar"]},
    {"section": "7. Fluids and Electrolytes", "chapter": "33. Dehydration and Replacement Therapy", "keywords": ["dehydration", "replacement therapy", "fluid deficit", "ors", "oral rehydration", "zinc", "rehydration"]},
    {"section": "7. Fluids and Electrolytes", "chapter": "34. Parenteral Nutrition", "keywords": ["parenteral nutrition", "tpn", "total parenteral"]},
    {"section": "7. Fluids and Electrolytes", "chapter": "35. Sodium Disorders", "keywords": ["hyponatremia", "hypernatremia", "sodium"]},
    {"section": "7. Fluids and Electrolytes", "chapter": "36. Potassium Disorders", "keywords": ["hypokalemia", "hyperkalemia", "potassium"]},
    {"section": "7. Fluids and Electrolytes", "chapter": "37. Acid-Base Disorders", "keywords": ["acid base", "metabolic acidosis", "metabolic alkalosis", "respiratory acidosis", "respiratory alkalosis"]},
    
    # Section 8: Acutely Ill or Injured Child
    {"section": "8. Acutely Ill or Injured Child", "chapter": "38. Assessment and Resuscitation", "keywords": ["resuscitation", "cpr", "bls", "pals", "assessment", "primary survey", "abc"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "39. Respiratory Failure", "keywords": ["respiratory failure", "respiratory distress", "hypoxia"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "40. Shock", "keywords": ["shock", "septic shock", "hypovolemic shock", "cardiogenic shock", "distributive shock"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "41. Injury Prevention", "keywords": ["injury prevention", "accident prevention", "safety"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "42. Major Trauma", "keywords": ["trauma", "major trauma", "head injury", "polytrauma"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "43. Drowning", "keywords": ["drowning", "near drowning", "submersion"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "44. Burns", "keywords": ["burn", "thermal injury", "scalds"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "45. Poisoning", "keywords": ["poisoning", "organophosphorus", "kerosene", "corrosive", "ingestion", "overdose"]},
    {"section": "8. Acutely Ill or Injured Child", "chapter": "46. Sedation and Analgesia", "keywords": ["sedation", "analgesia", "pain management"]},
    
    # Section 9: Human Genetics and Dysmorphology
    {"section": "9. Human Genetics and Dysmorphology", "chapter": "47. Patterns of Inheritance", "keywords": ["inheritance", "autosomal dominant", "autosomal recessive", "x linked", "x-linked", "mitochondrial"]},
    {"section": "9. Human Genetics and Dysmorphology", "chapter": "48. Genetic Assessment", "keywords": ["genetic assessment", "genetic counseling", "karyotype"]},
    {"section": "9. Human Genetics and Dysmorphology", "chapter": "49. Chromosomal Disorders", "keywords": ["chromosomal disorder", "trisomy", "down syndrome", "trisomy 21", "turner", "klinefelter", "edwards", "patau", "cri du chat", "translocation"]},
    {"section": "9. Human Genetics and Dysmorphology", "chapter": "50. Approach to the Dysmorphic Child", "keywords": ["dysmorphic", "dysmorphism", "congenital anomaly", "malformation"]},
    
    # Section 10: Metabolic Disorders
    {"section": "10. Metabolic Disorders", "chapter": "51. Metabolic Assessment", "keywords": ["metabolic assessment", "inborn error", "newborn screening"]},
    {"section": "10. Metabolic Disorders", "chapter": "52. Carbohydrate Disorders", "keywords": ["galactosemia", "glycogen storage", "fructose intolerance", "carbohydrate"]},
    {"section": "10. Metabolic Disorders", "chapter": "53. Amino Acid Disorders", "keywords": ["phenylketonuria", "pku", "amino acid", "maple syrup", "homocystinuria"]},
    {"section": "10. Metabolic Disorders", "chapter": "54. Organic Acid Disorders", "keywords": ["organic aciduria", "methylmalonic", "propionic"]},
    {"section": "10. Metabolic Disorders", "chapter": "55. Disorders of Fat Metabolism", "keywords": ["fat metabolism", "fatty acid oxidation"]},
    {"section": "10. Metabolic Disorders", "chapter": "56. Lysosomal and Peroxisomal Disorders", "keywords": ["lysosomal", "peroxisomal", "storage disorder", "mucopolysaccharidosis"]},
    {"section": "10. Metabolic Disorders", "chapter": "57. Mitochondrial Disorders", "keywords": ["mitochondrial"]},
    
    # Section 11: Fetal and Neonatal Medicine
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "58. Assessment of the Mother, Fetus, and Newborn", "keywords": ["newborn assessment", "apgar", "neonatal examination", "gestational age", "ballard", "warm chain", "newborn baby", "neonate examination", "benign findings newborn", "normal newborn", "newborn care", "immediate newborn care"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "59. Maternal Diseases Affecting the Newborn", "keywords": ["maternal disease", "maternal diabetes", "maternal infection"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "60. Diseases of the Fetus", "keywords": ["fetal disease", "hydrops fetalis", "fetal anomaly"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "61. Respiratory Diseases of the Newborn", "keywords": ["respiratory distress syndrome", "rds", "surfactant", "ttn", "transient tachypnea", "meconium aspiration", "mas", "pphn"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "62. Anemia and Hyperbilirubinemia", "keywords": ["neonatal anemia", "hyperbilirubinemia", "jaundice", "phototherapy", "exchange transfusion", "kernicterus", "physiological jaundice", "pathological jaundice", "hemolytic disease"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "63. Necrotizing Enterocolitis", "keywords": ["necrotizing enterocolitis", "nec"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "64. Hypoxic-Ischemic Encephalopathy, Intracranial Hemorrhage, and Seizures", "keywords": ["hypoxic ischemic encephalopathy", "hie", "intracranial hemorrhage", "ivh", "periventricular", "pvl", "neonatal seizure", "birth asphyxia"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "65. Sepsis and Meningitis", "keywords": ["neonatal sepsis", "neonatal meningitis", "early onset sepsis", "late onset sepsis", "omphalitis"]},
    {"section": "11. Fetal and Neonatal Medicine", "chapter": "66. Congenital Infections", "keywords": ["congenital infection", "torch", "toxoplasmosis", "rubella", "cmv", "herpes", "syphilis", "congenital toxoplasmosis"]},
    
    # Section 12: Adolescent Medicine
    {"section": "12. Adolescent Medicine", "chapter": "67. Overview and Assessment of Adolescents", "keywords": ["adolescent assessment", "puberty", "tanner stage"]},
    {"section": "12. Adolescent Medicine", "chapter": "68. Well-Adolescent Care", "keywords": ["well adolescent", "adolescent friendly", "afhs"]},
    {"section": "12. Adolescent Medicine", "chapter": "69. Adolescent Gynecology", "keywords": ["adolescent gynecology", "menstrual", "menarche", "dysmenorrhea", "amenorrhea", "pcos"]},
    {"section": "12. Adolescent Medicine", "chapter": "70. Eating Disorders", "keywords": ["eating disorder", "anorexia", "bulimia"]},
    {"section": "12. Adolescent Medicine", "chapter": "71. Substance Abuse", "keywords": ["substance abuse", "drug abuse", "alcohol", "smoking", "tobacco"]},
    
    # Section 13: Immunology
    {"section": "13. Immunology", "chapter": "72. Immunological Assessment", "keywords": ["immunological assessment", "immune deficiency", "immunodeficiency"]},
    {"section": "13. Immunology", "chapter": "73. Lymphocyte Disorders", "keywords": ["lymphocyte disorder", "scid", "combined immunodeficiency", "di george", "wiskott aldrich"]},
    {"section": "13. Immunology", "chapter": "74. Neutrophil Disorders", "keywords": ["neutrophil disorder", "cgd", "chronic granulomatous", "leukocyte adhesion"]},
    {"section": "13. Immunology", "chapter": "75. Complement System", "keywords": ["complement", "c3", "c4", "hereditary angioedema"]},
    {"section": "13. Immunology", "chapter": "76. Hematopoietic Stem Cell Transplantation", "keywords": ["stem cell transplant", "bone marrow transplant", "hsct"]},
    
    # Section 14: Allergy
    {"section": "14. Allergy", "chapter": "77. Allergy Assessment", "keywords": ["allergy assessment", "allergic disease", "atopy"]},
    {"section": "14. Allergy", "chapter": "78. Asthma", "keywords": ["asthma", "bronchial asthma", "wheezing", "inhaled steroid", "salbutamol", "bronchodilator"]},
    {"section": "14. Allergy", "chapter": "79. Allergic Rhinitis", "keywords": ["allergic rhinitis", "hay fever"]},
    {"section": "14. Allergy", "chapter": "80. Atopic Dermatitis", "keywords": ["atopic dermatitis", "eczema"]},
    {"section": "14. Allergy", "chapter": "81. Urticaria, Angioedema, and Anaphylaxis", "keywords": ["urticaria", "angioedema", "anaphylaxis", "anaphylactic"]},
    {"section": "14. Allergy", "chapter": "82. Serum Sickness", "keywords": ["serum sickness"]},
    {"section": "14. Allergy", "chapter": "83. Insect Allergies", "keywords": ["insect allergy", "bee sting", "wasp"]},
    {"section": "14. Allergy", "chapter": "84. Adverse Reactions to Foods", "keywords": ["food allergy", "food intolerance", "cow milk protein"]},
    {"section": "14. Allergy", "chapter": "85. Adverse Reactions to Drugs", "keywords": ["drug allergy", "drug reaction", "adverse drug"]},
    
    # Section 15: Rheumatic Diseases of Childhood
    {"section": "15. Rheumatic Diseases", "chapter": "86. Rheumatic Assessment", "keywords": ["rheumatic assessment", "arthritis assessment"]},
    {"section": "15. Rheumatic Diseases", "chapter": "87. Henoch-Schönlein Purpura", "keywords": ["henoch schonlein", "purpura", "hsp", "iga vasculitis"]},
    {"section": "15. Rheumatic Diseases", "chapter": "88. Kawasaki Disease", "keywords": ["kawasaki", "mucocutaneous", "mcls"]},
    {"section": "15. Rheumatic Diseases", "chapter": "89. Juvenile Idiopathic Arthritis", "keywords": ["juvenile idiopathic arthritis", "jia", "juvenile rheumatoid"]},
    {"section": "15. Rheumatic Diseases", "chapter": "90. Systemic Lupus Erythematosus", "keywords": ["systemic lupus", "sle", "lupus nephritis"]},
    {"section": "15. Rheumatic Diseases", "chapter": "91. Juvenile Dermatomyositis", "keywords": ["juvenile dermatomyositis"]},
    {"section": "15. Rheumatic Diseases", "chapter": "92. Musculoskeletal Pain Syndromes", "keywords": ["musculoskeletal pain", "growing pain"]},
    
    # Section 16: Infectious Diseases
    {"section": "16. Infectious Diseases", "chapter": "93. Infectious Disease Assessment", "keywords": ["infectious disease assessment", "fever evaluation"]},
    {"section": "16. Infectious Diseases", "chapter": "94. Immunization and Prophylaxis", "keywords": ["immunization", "vaccine", "vaccination", "national immunization schedule", "immunization schedule", "pentavalent", "mmr", "bcg", "opv", "ipv", "rota", "hepatitis b", "hepatitis a", "hib", "dpt", "dtp", "td", "hpv", "aefi", "adverse event"]},
    {"section": "16. Infectious Diseases", "chapter": "95. Antiinfective Therapy", "keywords": ["antibiotic", "antimicrobial", "antiinfective", "antiviral"]},
    {"section": "16. Infectious Diseases", "chapter": "96. Fever Without a Focus", "keywords": ["fever without focus", "fuo", "pyrexia of unknown origin"]},
    {"section": "16. Infectious Diseases", "chapter": "97. Infections Characterized by Fever and Rash", "keywords": ["fever and rash", "exanthem", "maculopapular", "petechial", "fever with rash", "rash with fever", "enanthem"]},
    {"section": "16. Infectious Diseases", "chapter": "98. Cutaneous Infections", "keywords": ["cutaneous infection", "skin infection", "impetigo", "cellulitis", "abscess"]},
    {"section": "16. Infectious Diseases", "chapter": "99. Lymphadenopathy", "keywords": ["lymphadenopathy", "lymph node"]},
    {"section": "16. Infectious Diseases", "chapter": "100. Meningitis", "keywords": ["meningitis", "pyogenic meningitis", "bacterial meningitis", "viral meningitis", "tuberculous meningitis", "csf"]},
    {"section": "16. Infectious Diseases", "chapter": "101. Encephalitis", "keywords": ["encephalitis", "viral encephalitis", "herpes encephalitis", "japanese encephalitis"]},
    {"section": "16. Infectious Diseases", "chapter": "102. Upper Respiratory Tract Infection", "keywords": ["upper respiratory", "common cold", "rhinitis"]},
    {"section": "16. Infectious Diseases", "chapter": "103. Pharyngitis", "keywords": ["pharyngitis", "sore throat", "tonsillitis", "diphtheria", "exudative pharyngitis"]},
    {"section": "16. Infectious Diseases", "chapter": "104. Sinusitis", "keywords": ["sinusitis"]},
    {"section": "16. Infectious Diseases", "chapter": "105. Otitis Media", "keywords": ["otitis media", "acute otitis media", "aom", "ear infection", "mastoiditis"]},
    {"section": "16. Infectious Diseases", "chapter": "106. Otitis Externa", "keywords": ["otitis externa", "swimmer ear"]},
    {"section": "16. Infectious Diseases", "chapter": "107. Croup (Laryngotracheobronchitis)", "keywords": ["croup", "laryngotracheobronchitis", "stridor", "barking cough"]},
    {"section": "16. Infectious Diseases", "chapter": "108. Pertussis", "keywords": ["pertussis", "whooping cough", "parapertussis"]},
    {"section": "16. Infectious Diseases", "chapter": "109. Bronchiolitis", "keywords": ["bronchiolitis", "rsv", "respiratory syncytial"]},
    {"section": "16. Infectious Diseases", "chapter": "110. Pneumonia", "keywords": ["pneumonia", "ari", "alri", "very severe pneumonia", "lobar pneumonia", "bronchopneumonia", "community acquired pneumonia", "pneumococcal"]},
    {"section": "16. Infectious Diseases", "chapter": "111. Infective Endocarditis", "keywords": ["infective endocarditis", "bacterial endocarditis", "duke criteria"]},
    {"section": "16. Infectious Diseases", "chapter": "112. Acute Gastroenteritis", "keywords": ["gastroenteritis", "acute gastroenteritis", "diarrhea", "vomiting", "rotavirus", "norovirus"]},
    {"section": "16. Infectious Diseases", "chapter": "113. Viral Hepatitis", "keywords": ["viral hepatitis", "hepatitis a", "hepatitis b", "hepatitis c", "hepatitis e"]},
    {"section": "16. Infectious Diseases", "chapter": "114. Urinary Tract Infection", "keywords": ["urinary tract infection", "uti", "pyelonephritis", "cystitis", "vesicoureteral reflux", "vur"]},
    {"section": "16. Infectious Diseases", "chapter": "115. Vulvovaginitis", "keywords": ["vulvovaginitis"]},
    {"section": "16. Infectious Diseases", "chapter": "116. Sexually Transmitted Infections", "keywords": ["sexually transmitted", "sti", "std", "gonorrhea", "chlamydia", "syphilis"]},
    {"section": "16. Infectious Diseases", "chapter": "117. Osteomyelitis", "keywords": ["osteomyelitis", "bone infection"]},
    {"section": "16. Infectious Diseases", "chapter": "118. Infectious Arthritis", "keywords": ["infectious arthritis", "septic arthritis"]},
    {"section": "16. Infectious Diseases", "chapter": "119. Ocular Infections", "keywords": ["ocular infection", "conjunctivitis", "orbital cellulitis", "periorbital cellulitis"]},
    {"section": "16. Infectious Diseases", "chapter": "120. Infection in the Immunocompromised Person", "keywords": ["immunocompromised", "opportunistic infection"]},
    {"section": "16. Infectious Diseases", "chapter": "121. Infections Associated With Medical Devices", "keywords": ["medical device infection", "catheter infection", "clabsi"]},
    {"section": "16. Infectious Diseases", "chapter": "122. Zoonoses and Vector Borne Infections", "keywords": ["zoonosis", "vector borne", "rickettsial", "scrub typhus", "leptospirosis", "lyme"]},
    {"section": "16. Infectious Diseases", "chapter": "123. Parasitic Diseases", "keywords": ["parasitic", "malaria", "giardia", "amebiasis", "helminth", "worm"]},
    {"section": "16. Infectious Diseases", "chapter": "124. Tuberculosis", "keywords": ["tuberculosis", "tb ", "mantoux", "tuberculin", "bcg", "primary complex", "miliary tb"]},
    {"section": "16. Infectious Diseases", "chapter": "125. Human Immunodeficiency Virus and Acquired Immunodeficiency Syndrome", "keywords": ["hiv", "aids", "acquired immunodeficiency"]},
    
    # Section 17: Digestive System
    {"section": "17. Digestive System", "chapter": "126. Digestive System Assessment", "keywords": ["digestive assessment", "gastrointestinal assessment", "abdominal pain", "abdomen"]},
    {"section": "17. Digestive System", "chapter": "127. Oral Cavity", "keywords": ["oral cavity", "stomatitis", "gingivitis", "aphthous", "oral ulcer", "teething"]},
    {"section": "17. Digestive System", "chapter": "128. Esophagus and Stomach", "keywords": ["esophagus", "stomach", "gastroesophageal reflux", "gerd", "pyloric stenosis", "gastritis", "peptic ulcer"]},
    {"section": "17. Digestive System", "chapter": "129. Intestinal Tract", "keywords": ["intestinal tract", "intussusception", "malrotation", "volvulus", "hirschsprung", "aganglionic", "megacolon", "celiac", "cystic fibrosis gi", "crohn", "ulcerative colitis", "ibd", "meckel", "appendicitis", "constipation", "encopresis", "recurrent abdominal pain"]},
    {"section": "17. Digestive System", "chapter": "130. Liver Disease", "keywords": ["liver disease", "hepatitis", "liver failure", "hepatic failure", "cirrhosis", "biliary atresia", "portal hypertension", "ascites", "wilson", "hemochromatosis"]},
    {"section": "17. Digestive System", "chapter": "131. Pancreatic Disease", "keywords": ["pancreatitis", "pancreatic", "cystic fibrosis pancreas"]},
    {"section": "17. Digestive System", "chapter": "132. Peritonitis", "keywords": ["peritonitis"]},
    
    # Section 18: Respiratory System
    {"section": "18. Respiratory System", "chapter": "133. Respiratory System Assessment", "keywords": ["respiratory assessment", "breath sound", "wheeze", "crepitation", "rales", "rhonchi", "tachypnea", "respiratory rate"]},
    {"section": "18. Respiratory System", "chapter": "134. Control of Breathing", "keywords": ["control of breathing", "apnea", "hyperventilation"]},
    {"section": "18. Respiratory System", "chapter": "135. Upper Airway Obstruction", "keywords": ["upper airway obstruction", "stridor", "epiglottitis", "foreign body airway", "laryngomalacia", "subglottic stenosis"]},
    {"section": "18. Respiratory System", "chapter": "136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases", "keywords": ["lower airway", "parenchymal", "pneumonia", "bronchiolitis", "bronchitis", "emphysema", "pulmonary vascular", "pulmonary hypertension", "cor pulmonale"]},
    {"section": "18. Respiratory System", "chapter": "137. Cystic Fibrosis", "keywords": ["cystic fibrosis", "cf ", "sweat chloride", "meconium ileus"]},
    {"section": "18. Respiratory System", "chapter": "138. Chest Wall and Pleura", "keywords": ["chest wall", "pleura", "pleural effusion", "empyema", "pneumothorax", "empyema"]},
    
    # Section 19: Cardiovascular System
    {"section": "19. Cardiovascular System", "chapter": "139. Cardiovascular System Assessment", "keywords": ["cardiovascular assessment", "cardiac assessment", "heart murmur", "murmur", "heart sound", "apex beat", "precordium"]},
    {"section": "19. Cardiovascular System", "chapter": "140. Syncope", "keywords": ["syncope", "fainting"]},
    {"section": "19. Cardiovascular System", "chapter": "141. Chest Pain", "keywords": ["chest pain", "chest discomfort"]},
    {"section": "19. Cardiovascular System", "chapter": "142. Dysrhythmias", "keywords": ["dysrhythmia", "arrhythmia", "heart block", "bradycardia", "tachycardia"]},
    {"section": "19. Cardiovascular System", "chapter": "143. Acyanotic Congenital Heart Disease", "keywords": ["acyanotic chd", "left to right shunt", "vsd", "ventricular septal defect", "asd", "atrial septal defect", "pda", "patent ductus", "av canal", "endocardial cushion"]},
    {"section": "19. Cardiovascular System", "chapter": "144. Cyanotic Congenital Heart Disease", "keywords": ["cyanotic chd", "right to left shunt", "tetralogy of fallot", "tof", "transposition", "tga", "tapvc", "truncus", "tricuspid atresia", "single ventricle", "eisenmenger"]},
    {"section": "19. Cardiovascular System", "chapter": "145. Heart Failure", "keywords": ["heart failure", "congestive cardiac failure", "ccf", "cardiac failure"]},
    {"section": "19. Cardiovascular System", "chapter": "146. Rheumatic Fever", "keywords": ["rheumatic fever", "acute rheumatic fever", "jones criteria", "carditis", "chorea", "sydenham", "rheumatic heart disease"]},
    {"section": "19. Cardiovascular System", "chapter": "147. Cardiomyopathies", "keywords": ["cardiomyopathy", "dilated cardiomyopathy", "hypertrophic cardiomyopathy"]},
    {"section": "19. Cardiovascular System", "chapter": "148. Pericarditis", "keywords": ["pericarditis", "pericardial effusion", "tamponade"]},
    
    # Section 20: Hematology
    {"section": "20. Hematology", "chapter": "149. Hematology Assessment", "keywords": ["hematology assessment", "peripheral smear", "blood film", "bone marrow", "reticulocyte"]},
    {"section": "20. Hematology", "chapter": "150. Anemia", "keywords": ["anemia", "anaemia", "iron deficiency anemia", "megaloblastic anemia", "folate deficiency", "b12 deficiency", "aplastic anemia", "hemolytic anemia", "g6pd deficiency", "thalassemia", "sickle cell", "hereditary spherocytosis"]},
    {"section": "20. Hematology", "chapter": "151. Hemostatic Disorders", "keywords": ["hemophilia", "von willebrand", "itp", "immune thrombocytopenia", "dic", "coagulopathy", "bleeding disorder", "hemorrhagic disease", "vitamin k deficiency"]},
    {"section": "20. Hematology", "chapter": "152. Blood Component Therapy", "keywords": ["blood transfusion", "component therapy", "packed cell", "platelet transfusion", "ffp"]},
    
    # Section 21: Oncology
    {"section": "21. Oncology", "chapter": "153. Oncology Assessment", "keywords": ["oncology assessment", "tumor assessment", "mass"]},
    {"section": "21. Oncology", "chapter": "154. Principles of Cancer Treatment", "keywords": ["cancer treatment", "chemotherapy", "radiation", "surgery oncology"]},
    {"section": "21. Oncology", "chapter": "155. Leukemia", "keywords": ["leukemia", "all", "aml", "cml", "cll", "lymphoblast", "myeloblast"]},
    {"section": "21. Oncology", "chapter": "156. Lymphoma", "keywords": ["lymphoma", "hodgkin", "non-hodgkin", "burkitt"]},
    {"section": "21. Oncology", "chapter": "157. Central Nervous System Tumors", "keywords": ["brain tumor", "cns tumor", "medulloblastoma", "craniopharyngioma", "astrocytoma", "glioma"]},
    {"section": "21. Oncology", "chapter": "158. Neuroblastoma", "keywords": ["neuroblastoma"]},
    {"section": "21. Oncology", "chapter": "159. Wilms Tumor", "keywords": ["wilms tumor", "nephroblastoma"]},
    {"section": "21. Oncology", "chapter": "160. Sarcomas", "keywords": ["sarcoma", "osteosarcoma", "ewing sarcoma", "rhabdomyosarcoma"]},
    
    # Section 22: Nephrology and Urology
    {"section": "22. Nephrology and Urology", "chapter": "161. Nephrology and Urology Assessment", "keywords": ["nephrology assessment", "urinalysis", "renal function", "creatinine", "bun"]},
    {"section": "22. Nephrology and Urology", "chapter": "162. Nephrotic Syndrome and Proteinuria", "keywords": ["nephrotic syndrome", "minimal change disease", "steroid sensitive", "steroid resistant", "steroid dependent", "fsgs", "focal segmental", "membranous", "proteinuria", "hypoalbuminemia", "edema"]},
    {"section": "22. Nephrology and Urology", "chapter": "163. Glomerulonephritis and Hematuria", "keywords": ["glomerulonephritis", "agn", "acute glomerulonephritis", "post streptococcal", "psgn", "hematuria", "nephritic", "nephritic syndrome", "rapidly progressive", "rpgn", "iga nephropathy", "mpgn"]},
    {"section": "22. Nephrology and Urology", "chapter": "164. Hemolytic Uremic Syndrome", "keywords": ["hemolytic uremic syndrome", "hus", "thrombotic microangiopathy", "e coli 0157"]},
    {"section": "22. Nephrology and Urology", "chapter": "165. Acute and Chronic Renal Failure", "keywords": ["acute renal failure", "acute kidney injury", "aki", "chronic renal failure", "ckd", "chronic kidney disease", "dialysis", "renal transplant"]},
    {"section": "22. Nephrology and Urology", "chapter": "166. Hypertension", "keywords": ["hypertension", "high blood pressure", "bp percentile"]},
    {"section": "22. Nephrology and Urology", "chapter": "167. Vesicoureteral Reflux", "keywords": ["vesicoureteral reflux", "vur"]},
    {"section": "22. Nephrology and Urology", "chapter": "168. Congenital and Developmental Abnormalities of the Urinary Tract", "keywords": ["congenital urinary", "renal anomaly", "polycystic kidney", "horseshoe kidney", "puv", "posterior urethral valves"]},
    {"section": "22. Nephrology and Urology", "chapter": "169. Other Urinary Tract and Genital Disorders", "keywords": ["urinary tract", "genital disorder", "hydrocele", "inguinal hernia", "undescended testes", "cryptorchidism", "hypospadias", "epispadias", "phimosis", "testicular torsion", "torsion", "varicocele"]},
    
    # Section 23: Endocrinology
    {"section": "23. Endocrinology", "chapter": "170. Endocrinology Assessment", "keywords": ["endocrine assessment", "hormone", "pituitary", "hypothalamus"]},
    {"section": "23. Endocrinology", "chapter": "171. Diabetes Mellitus", "keywords": ["diabetes mellitus", "type 1 diabetes", "insulin", "diabetic ketoacidosis", "dka", "hypoglycemia diabetic", "hba1c"]},
    {"section": "23. Endocrinology", "chapter": "172. Hypoglycemia", "keywords": ["hypoglycemia", "low blood sugar", "hyperinsulinism"]},
    {"section": "23. Endocrinology", "chapter": "173. Short Stature", "keywords": ["short stature", "growth hormone deficiency", "gh deficiency", "constitutional delay", "familial short stature"]},
    {"section": "23. Endocrinology", "chapter": "174. Disorders of Puberty", "keywords": ["precocious puberty", "delayed puberty", "pubarche", "thelarche", "menarche", "gonadarche"]},
    {"section": "23. Endocrinology", "chapter": "175. Thyroid Disease", "keywords": ["thyroid", "hypothyroidism", "hyperthyroidism", "goiter", "cretinism", "congenital hypothyroidism", "thyroiditis", " Graves"]},
    {"section": "23. Endocrinology", "chapter": "176. Disorders of Parathyroid Bone and Mineral Endocrinology", "keywords": ["parathyroid", "hypocalcemia", "hypercalcemia", "tetany", "rickets", "vitamin d deficiency", "vitamin d resistant", "pseudohypoparathyroidism"]},
    {"section": "23. Endocrinology", "chapter": "177. Disorders of Sexual Development", "keywords": ["disorder of sexual development", "ambiguous genitalia", "intersex", "congenital adrenal hyperplasia", "cah", "21 hydroxylase", "11 hydroxylase", "virilization"]},
    {"section": "23. Endocrinology", "chapter": "178. Adrenal Gland Dysfunction", "keywords": ["adrenal", "cushing syndrome", "addison disease", "primary adrenal insufficiency", "congenital adrenal hyperplasia", "cah", "pheochromocytoma", "aldosterone"]},
    
    # Section 24: Neurology
    {"section": "24. Neurology", "chapter": "179. Neurology Assessment", "keywords": ["neurology assessment", "neurological examination", "fontanelle", "head circumference", "cranial nerve", "tone", "reflex"]},
    {"section": "24. Neurology", "chapter": "180. Headache and Migraine", "keywords": ["headache", "migraine", "tension headache"]},
    {"section": "24. Neurology", "chapter": "181. Seizures", "keywords": ["seizure", "epilepsy", "febrile seizure", "febrile convulsion", "status epilepticus", "absence seizure", "generalized tonic clonic", "gtcs", "partial seizure", "complex partial", "myoclonic", "infantile spasm", "west syndrome", "lennox gastaut"]},
    {"section": "24. Neurology", "chapter": "182. Weakness and Hypotonia", "keywords": ["weakness", "hypotonia", "floppy infant", "muscular dystrophy", "duchenne", "becker", "spinal muscular atrophy", "sma", "guillain barre", "gbs", "myasthenia", "poliomyelitis", "polio"]},
    {"section": "24. Neurology", "chapter": "183. Ataxia and Movement Disorders", "keywords": ["ataxia", "movement disorder", "chorea", "athetosis", "dystonia", "tremor", "tics", "tourette"]},
    {"section": "24. Neurology", "chapter": "184. Altered Mental Status", "keywords": ["altered mental status", "encephalopathy", "coma", "delirium", "brain death"]},
    {"section": "24. Neurology", "chapter": "185. Neurodegenerative Disorders", "keywords": ["neurodegenerative", "alzheimer childhood", "batten"]},
    {"section": "24. Neurology", "chapter": "186. Neurocutaneous Disorders", "keywords": ["neurofibromatosis", "tuberous sclerosis", "sturge weber"]},
    {"section": "24. Neurology", "chapter": "187. Congenital Malformations of the Central Nervous System", "keywords": ["neural tube defect", "meningomyelocele", "spina bifida", "encephalocele", "anencephaly", "microcephaly", "macrocephaly", "hydrocephalus", "arnold chiari", "dandy walker"]},
    
    # Section 25: Dermatology
    {"section": "25. Dermatology", "chapter": "188. Dermatology Assessment", "keywords": ["dermatology assessment", "skin lesion", "rash assessment"]},
    {"section": "25. Dermatology", "chapter": "189. Acne", "keywords": ["acne"]},
    {"section": "25. Dermatology", "chapter": "190. Atopic Dermatitis", "keywords": ["atopic dermatitis", "eczema"]},
    {"section": "25. Dermatology", "chapter": "191. Contact Dermatitis", "keywords": ["contact dermatitis"]},
    {"section": "25. Dermatology", "chapter": "192. Seborrheic Dermatitis", "keywords": ["seborrheic dermatitis", "cradle cap"]},
    {"section": "25. Dermatology", "chapter": "193. Pigmented Lesions", "keywords": ["pigmented lesion", "nevus", "mole", "melanoma"]},
    {"section": "25. Dermatology", "chapter": "194. Vascular Anomalies", "keywords": ["vascular anomaly", "hemangioma", "port wine stain", "salmon patch"]},
    {"section": "25. Dermatology", "chapter": "195. Erythema Multiforme, Stevens-Johnson Syndrome, and Toxic Epidermal Necrolysis", "keywords": ["erythema multiforme", "stevens johnson", "toxic epidermal necrolysis", "sjs", "ten"]},
    {"section": "25. Dermatology", "chapter": "196. Cutaneous Infestations", "keywords": ["scabies", "pediculosis", "lice", "mite"]},
    
    # Section 26: Orthopedics
    {"section": "26. Orthopedics", "chapter": "197. Orthopedics Assessment", "keywords": ["orthopedic assessment", "gait", "limp", "deformity"]},
    {"section": "26. Orthopedics", "chapter": "198. Fractures", "keywords": ["fracture", "greenstick", "supracondylar", "epiphyseal"]},
    {"section": "26. Orthopedics", "chapter": "199. Hip", "keywords": ["ddh", "developmental dysplasia", "congenital hip", "cdh", "legg calve perthes", "perthes", "slipped capital femoral", "scfe"]},
    {"section": "26. Orthopedics", "chapter": "200. Lower Extremity and Knee", "keywords": ["lower extremity", "knee", "genu varum", "genu valgum", "bow leg", "knock knee", "o leg", "x leg"]},
    {"section": "26. Orthopedics", "chapter": "201. Foot", "keywords": ["clubfoot", "talipes", "metatarsus adductus", "flat foot", "pes planus"]},
    {"section": "26. Orthopedics", "chapter": "202. Spine", "keywords": ["scoliosis", "kyphosis", "lordosis", "torticollis", "plagiocephaly"]},
    {"section": "26. Orthopedics", "chapter": "203. Upper Extremity", "keywords": ["upper extremity", "club hand", "radial aplasia"]},
    {"section": "26. Orthopedics", "chapter": "204. Benign Bone Tumors and Cystic Lesions", "keywords": ["bone tumor", "bone cyst", "osteochondroma", "enchondroma", "aneurysmal bone cyst"]},
]

def classify_question(text):
    """Classify a question into Nelson chapters."""
    text_lower = text.lower()
    scores = []
    
    for chapter in NELSON_CHAPTERS:
        score = 0
        matched_keywords = []
        for keyword in chapter["keywords"]:
            # Use substring matching for broader coverage
            keyword_lower = keyword.lower()
            if keyword_lower in text_lower:
                # Count occurrences
                count = text_lower.count(keyword_lower)
                score += count
                matched_keywords.append(keyword)
        
        if score > 0:
            scores.append({
                "section": chapter["section"],
                "chapter": chapter["chapter"],
                "score": score,
                "keywords": matched_keywords
            })
    
    # Sort by score descending
    scores.sort(key=lambda x: x["score"], reverse=True)
    
    if scores:
        # Return top match
        return scores[0]["section"], scores[0]["chapter"], scores[0]["score"], scores[0]["keywords"]
    else:
        return "Uncategorized", "Uncategorized", 0, []

def classify_all_questions(data):
    """Classify all questions and add chapter info."""
    classified = []
    
    for q in data['questions']:
        section, chapter, score, keywords = classify_question(q['question_text'])
        q_copy = q.copy()
        q_copy['nelson_section'] = section
        q_copy['nelson_chapter'] = chapter
        q_copy['classification_score'] = score
        q_copy['matched_keywords'] = keywords
        classified.append(q_copy)
    
    return classified

def generate_classified_excel(classified):
    """Generate Excel with Nelson chapter classification."""
    import pandas as pd
    
    rows = []
    for q in classified:
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
            "Sub Parts": json.dumps(q['sub_parts']) if q.get('sub_parts') else "",
            "Nelson Section": q['nelson_section'],
            "Nelson Chapter": q['nelson_chapter'],
            "Classification Score": q['classification_score'],
            "Matched Keywords": ', '.join(q['matched_keywords']) if q['matched_keywords'] else ""
        }
        rows.append(row)
    
    df = pd.DataFrame(rows)
    
    excel_path = os.path.join(OUTPUT_DIR, "pediatrics_questions_nelson.xlsx")
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        # Main sheet
        df.to_excel(writer, sheet_name='All Questions', index=False)
        
        # Nelson Chapter Summary
        chapter_summary = df.groupby(['Nelson Section', 'Nelson Chapter']).agg({
            'Question Number': 'count',
            'Marks': 'sum'
        }).reset_index()
        chapter_summary.columns = ['Nelson Section', 'Nelson Chapter', 'Question Count', 'Total Marks']
        chapter_summary = chapter_summary.sort_values('Question Count', ascending=False)
        chapter_summary.to_excel(writer, sheet_name='Nelson Chapter Summary', index=False)
        
        # Section Summary
        section_summary = df.groupby('Nelson Section').agg({
            'Question Number': 'count',
            'Marks': 'sum'
        }).reset_index()
        section_summary.columns = ['Nelson Section', 'Question Count', 'Total Marks']
        section_summary = section_summary.sort_values('Question Count', ascending=False)
        section_summary.to_excel(writer, sheet_name='Nelson Section Summary', index=False)
        
        # Year vs Chapter heatmap data
        year_chapter = df.groupby(['Exam Year', 'Nelson Chapter']).agg({
            'Question Number': 'count'
        }).reset_index()
        year_chapter.columns = ['Exam Year', 'Nelson Chapter', 'Count']
        year_chapter.to_excel(writer, sheet_name='Year vs Chapter', index=False)
        
        # High-yield chapters (appeared most frequently)
        high_yield = chapter_summary.head(30)
        high_yield.to_excel(writer, sheet_name='Top 30 Chapters', index=False)
    
    return excel_path

def generate_classified_markdown(classified):
    """Generate markdown organized by Nelson chapters."""
    lines = []
    lines.append("# KUHS Pediatrics Questions - Organized by Nelson Chapters")
    lines.append("")
    lines.append(f"**Total Questions:** {len(classified)}")
    lines.append(f"**Textbook:** Nelson Essentials of Pediatrics, 8th Edition")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Group by Nelson section and chapter
    by_section = defaultdict(lambda: defaultdict(list))
    for q in classified:
        by_section[q['nelson_section']][q['nelson_chapter']].append(q)
    
    # Sort sections by total question count
    section_counts = {}
    for section, chapters in by_section.items():
        count = sum(len(qs) for qs in chapters.values())
        section_counts[section] = count
    
    sorted_sections = sorted(section_counts.keys(), key=lambda x: section_counts[x], reverse=True)
    
    for section in sorted_sections:
        chapters = by_section[section]
        lines.append(f"## {section}")
        lines.append("")
        
        # Sort chapters by question count
        sorted_chapters = sorted(chapters.keys(), key=lambda x: len(chapters[x]), reverse=True)
        
        for chapter in sorted_chapters:
            qs = chapters[chapter]
            total_marks = sum(q['marks'] for q in qs)
            lines.append(f"### {chapter} ({len(qs)} questions, {total_marks} marks)")
            lines.append("")
            
            for q in qs:
                lines.append(f"**[{q['exam_year']} {q['exam_month']}] Q{q['question_number']} ({q['marks']} marks)** — {q['question_text']}")
                if q.get('sub_parts'):
                    for part_letter, part_text in q['sub_parts']:
                        lines.append(f"- ({part_letter}) {part_text}")
                lines.append("")
        
        lines.append("---")
        lines.append("")
    
    return '\n'.join(lines)

def main():
    print("Classifying questions into Nelson chapters...")
    classified = classify_all_questions(data)
    
    # Generate Excel
    excel_path = generate_classified_excel(classified)
    print(f"Generated: {excel_path}")
    
    # Generate Markdown
    md_content = generate_classified_markdown(classified)
    md_path = os.path.join(OUTPUT_DIR, "pediatrics_questions_nelson.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Generated: {md_path}")
    
    # Print summary
    section_counter = Counter(q['nelson_section'] for q in classified)
    print("\nTop Nelson Sections by Question Count:")
    for section, count in section_counter.most_common(15):
        print(f"  {section}: {count} questions")
    
    # Print unclassified
    unclassified = [q for q in classified if q['nelson_section'] == 'Uncategorized']
    print(f"\nUncategorized questions: {len(unclassified)}")
    if unclassified:
        print("Sample unclassified questions:")
        for q in unclassified[:5]:
            print(f"  [{q['filename']}] {q['question_text'][:80]}...")

if __name__ == "__main__":
    main()
