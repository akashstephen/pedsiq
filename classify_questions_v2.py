import json

# Load the input file
with open('/Users/akashstephen/Developer/Pediatrics Exam/questions_batch_1.json', 'r') as f:
    questions = json.load(f)

# Manual/explicit classification for edge cases, then keyword-based for the rest
# We will create a comprehensive mapping using exact text matching for known questions
# and refined keyword logic for the rest.

exact_mappings = {
    # 2015 April
    "What is acute flaccid paralysis. Discuss the differential diagnosis of a case of acute flaccid paralysis and its surveillance (2+6+2=10)": ("24. Neurology", "182. Weakness and Hypotonia"),
    "Biochemical changes in rickets": ("23. Endocrinology", "176. Disorders of Parathyroid Bone and Mineral Endocrinology"),
    "Complications of fallot's tetralogy": ("19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"),
    "APGAR scroe": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Rheumatic fever prophylaxis": ("19. Cardiovascular System", "146. Rheumatic Fever"),
    "Diagnostic criteria of infective endocarditis": ("16. Infectious Diseases", "111. Infective Endocarditis"),
    "Difference between caput succedaneum and cephalhematoma": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Oral rehydration therapy": ("7. Fluids and Electrolytes", "33. Dehydration and Replacement Therapy"),
    "Varicella vaccine": ("16. Infectious Diseases", "94. Immunization and Prophylaxis"),
    "Zinc deficiency in children": ("6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"),
    "Circle of Willis": ("24. Neurology", "179. Neurology Assessment"),
    "Peripheral smear picture in iron deficiency anemia": ("20. Hematology", "150. Anemia"),
    "Treatment choice in scrub typhus": ("16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"),
    "Four causes of respiratory distress in newly born baby": ("11. Fetal and Neonatal Medicine", "61. Respiratory Diseases of the Newborn"),
    "Name four dangerous signs in pneumonia": ("16. Infectious Diseases", "110. Pneumonia"),
    "When was last case of poliomyelitis reported in India": ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    
    # 2015 September
    "Seven years old child was brought with fever and seizure O/E deeply comatose, pale and significant hepato-splenomegaly. Answer the following: \u2022 What are the possibilities. \u2022 What clinical signs will you look for in this case \u2022 How will you investigate. \u2022 How will you manage.": ("16. Infectious Diseases", "96. Fever Without a Focus"),
    "Management of HIV children": ("16. Infectious Diseases", "125. HIV and AIDS"),
    "Management of near drowning child": ("8. Acutely Ill or Injured Child", "43. Drowning"),
    "Dengue hemorrhagic shock": ("16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"),
    "Clinical features and investigation in infective endocarditis": ("16. Infectious Diseases", "111. Infective Endocarditis"),
    "Cerebral edema": ("24. Neurology", "184. Altered Mental Status"),
    "Cryptorchidism": ("22. Nephrology and Urology", "169. Other Urinary Tract and Genital Disorders"),
    "Pneumothorax": ("18. Respiratory System", "138. Chest Wall and Pleura"),
    "Warm chain": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Pinworm egg": ("16. Infectious Diseases", "123. Parasitic Diseases"),
    "Entero-hepatic circulation": ("17. Digestive System", "130. Liver Disease"),
    "Drug of choice for prophylaxis of pneumocystis jiroveci": ("16. Infectious Diseases", "125. HIV and AIDS"),
    "Lab diagnosis of leptospirosis": ("16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"),
    "Dose of vitamin K in newborn": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Four common causes of fever with rash": ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    
    # 2016 April
    "Four years old childe presented with puffiness of face, swelling all over the body and decreased urine output. What is the most probable diagnosis. How will you clinically evaluate and manage this child (2+4+4=10)": ("22. Nephrology and Urology", "162. Nephrotic Syndrome and Proteinuria"),
    "Radiological findings in rickets": ("23. Endocrinology", "176. Disorders of Parathyroid Bone and Mineral Endocrinology"),
    "Clinical manifestations of snake envenornation": ("16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"),
    "Management of H N pneumonia in a six months old baby 1 1": ("16. Infectious Diseases", "110. Pneumonia"),
    "Preventable causes of intellectual disability (mental retardation)": ("2. Growth and Development", "8. Disorders of Development"),
    "Thumb sucking": ("3. Behavioral Disorders", "12. Temper Tantrums"),
    "Rota virus vaccine": ("16. Infectious Diseases", "94. Immunization and Prophylaxis"),
    "BFHI ( Baby friendly hospital initiative)": ("6. Pediatric Nutrition", "27. Diet of the Normal Infant"),
    "Atypical pneumonia in children": ("16. Infectious Diseases", "110. Pneumonia"),
    "Management of febrile seizures": ("24. Neurology", "181. Seizures"),
    "CSF pathway": ("24. Neurology", "179. Neurology Assessment"),
    "Porto systemic anastomosis": ("17. Digestive System", "130. Liver Disease"),
    "Four cardinal signs of Kwashiorkor": ("6. Pediatric Nutrition", "30. Pediatric Undernutrition"),
    "Four complications of malaria": ("16. Infectious Diseases", "123. Parasitic Diseases"),
    "Indications for endo-tracheal intubation in a newborn": ("11. Fetal and Neonatal Medicine", "61. Respiratory Diseases of the Newborn"),
    "When was last case of wild poliomyelitis reported in India": ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    
    # 2016 September
    "Six weeks old baby presented with feeding difficulty in the form of suck-rest cycle. O/E baby had moderate cardiomegaly and grade III systolic murmur in the left fourth space. Answer the following: \u2022 What is the primary cardiac abnormality. \u2022 What associated complication that lead to the presenting complaints. \u2022 Discuss the hemodynamics of the primary cardiac abnormality. \u2022 Management of the present complication.": ("19. Cardiovascular System", "145. Heart Failure"),
    "Ocular findings in Down\u2019s syndrome.": ("9. Human Genetics and Dysmorphology", "49. Chromosomal Disorders"),
    "MRI findings in tuberous sclerosis.": ("24. Neurology", "186. Neurocutaneous Disorders"),
    "Complications of measles.": ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    "IMNCI ( Integrated management of neonatal and childhood illness)": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Grading of marasmus.": ("6. Pediatric Nutrition", "30. Pediatric Undernutrition"),
    "Four causes for recurrent lower respiratory tract infection.": ("18. Respiratory System", "136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases"),
    "Endocrine complications of thalassemia.": ("20. Hematology", "150. Anemia"),
    "Four clinical findings in henoch schonlein purpura.": ("15. Rheumatic Diseases", "87. Henoch-Schonlein Purpura"),
    "Four causes for preterm birth.": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Fetal circulation.": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Visual pathway.": ("24. Neurology", "179. Neurology Assessment"),
    "Drug of choice for rheumatic carditis with congestive cardiac failure.": ("19. Cardiovascular System", "146. Rheumatic Fever"),
    "Pattern of inheritance of Hunter\u2019s disease.": ("9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"),
    "Antioxidant vitamins.": ("6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"),
    "What is the lactose content in breast milk": ("6. Pediatric Nutrition", "27. Diet of the Normal Infant"),
    
    # 2017 March
    "A six months old baby was diagnosed to have Fallot's tetralogy. Answer the following: \u2022 Discuss the hemodynamics. \u2022 Clinical features. \u2022 Management.": ("19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"),
    "Cephalhematoma.": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Advantages of kangaroo mother care.": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Management of simple febrile convulsions.": ("24. Neurology", "181. Seizures"),
    "Antenatal diagnosis of Downs syndrome.": ("9. Human Genetics and Dysmorphology", "48. Genetic Assessment"),
    "Ponderal index.": ("2. Growth and Development", "5. Normal Growth"),
    "CSF picture of tubercular meningitis.": ("16. Infectious Diseases", "124. Tuberculosis"),
    "Four causes of retinitis pigmentosa.": ("24. Neurology", "185. Neurodegenerative Disorders"),
    "Four infections causing hepato-splenomegaly.": ("16. Infectious Diseases", "96. Fever Without a Focus"),
    "Cleft palate": ("17. Digestive System", "127. Oral Cavity"),
    "Circle of Willis.": ("24. Neurology", "179. Neurology Assessment"),
    "Posterior column of spinal cord.": ("24. Neurology", "179. Neurology Assessment"),
    "Drug used for prophylaxis against pneumocystis \u2013 carinii pneumonia": ("16. Infectious Diseases", "125. HIV and AIDS"),
    "Pattern of inheritance of Marfan\u2019s syndrome": ("9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"),
    "Odor of urine in phenyl ketonuria": ("10. Metabolic Disorders", "53. Amino Acid Disorders"),
    "Drug, dosage and duration of treatment for a six month old baby with sputum positive pulmonary tuberculosis": ("16. Infectious Diseases", "124. Tuberculosis"),
    
    # 2017 September
    "A three years old boy complaints of oliguria and edema since three days. Answer the following: \uf0b7 How will clinically evaluate the patient \uf0b7 How will you investigate \uf0b7 How will you manage if final diagnosis is acute \u2013 glomerulonephritis": ("22. Nephrology and Urology", "163. Glomerulonephritis and Hematuria"),
    "Mention six benign findings seen in a newborn baby.": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Drugs causing nephrotic syndrome.": ("22. Nephrology and Urology", "162. Nephrotic Syndrome and Proteinuria"),
    "Advantages of breast feeding.": ("6. Pediatric Nutrition", "27. Diet of the Normal Infant"),
    "Hemodynamics in patent ductus arteriosus.": ("19. Cardiovascular System", "143. Acyanotic Congenital Heart Disease"),
    "ECG changes in hypokalemia.": ("7. Fluids and Electrolytes", "36. Potassium Disorders"),
    "Grading of Kwashiorkor.": ("6. Pediatric Nutrition", "30. Pediatric Undernutrition"),
    "X-ray findings in a newborn with respiratory distress syndrome.": ("11. Fetal and Neonatal Medicine", "61. Respiratory Diseases of the Newborn"),
    "Causes of microcytic hypochromic anemia.": ("20. Hematology", "150. Anemia"),
    "Classify JIA (Juvenile Idiopathic arthritis).": ("15. Rheumatic Diseases", "89. Juvenile Idiopathic Arthritis"),
    "Types of ventricular septal defect.": ("19. Cardiovascular System", "143. Acyanotic Congenital Heart Disease"),
    "Course of sixth cranial nerve": ("24. Neurology", "179. Neurology Assessment"),
    "Drug of choice in mycoplasma pneumonia.": ("16. Infectious Diseases", "110. Pneumonia"),
    "Pattern of inheritance of Duchenne muscular dystrophy.": ("9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"),
    "Name of enanthem seen in measles.": ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    "Name the congenital heart disease in which lower limb pulses are weak": ("19. Cardiovascular System", "143. Acyanotic Congenital Heart Disease"),
    
    # 2018 August
    "Discuss the aetiopathogenesis, clinical features, lab investigations and management of acute rheumatic fever": ("19. Cardiovascular System", "146. Rheumatic Fever"),
    "Laboratory diagnosis of pyogenic meningitis": ("16. Infectious Diseases", "100. Meningitis"),
    "IMNCI": ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    "Definition and management of status epilepticus": ("24. Neurology", "181. Seizures"),
    "Clinical features and management of cyanotic spell": ("19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"),
    "Steroid dependent nephrotic syndrome": ("22. Nephrology and Urology", "162. Nephrotic Syndrome and Proteinuria"),
    "Growth assessment and development of one year old child": ("2. Growth and Development", "7. Normal Development"),
}

def classify_question(q):
    text = q['question_text'].strip()
    
    # Check exact mapping first
    if text in exact_mappings:
        return exact_mappings[text]
    
    # Fallback keyword-based classification for any unmatched questions
    text_lower = text.lower()
    
    # Infectious Diseases
    if any(word in text_lower for word in ['meningitis', 'encephalitis', 'pneumonia', 'tuberculosis', 'tb', 'hiv', 'aids', 'malaria', 'dengue', 'typhus', 'leptospirosis', 'measles', 'mumps', 'rubella', 'varicella', 'polio', 'poliomyelitis', 'pertussis', 'diphtheria', 'tetanus', 'hepatitis', 'gastroenteritis', 'osteomyelitis', 'endocarditis', 'urinary tract', 'uti', 'sepsis', 'meningococcemia', 'septicemia', 'bacteremia', 'fungal', 'parasitic', 'helminth', 'pinworm', 'mycoplasma', 'snake', 'zoonosis', 'vector', 'immunization', 'vaccine', 'vaccination', 'prophylaxis', 'antibiotic', 'antimicrobial', 'fever', 'rash', 'immunocompromised']):
        if 'meningitis' in text_lower:
            return "16. Infectious Diseases", "100. Meningitis"
        elif 'pneumonia' in text_lower:
            return "16. Infectious Diseases", "110. Pneumonia"
        elif 'tuberculosis' in text_lower or 'tb' in text_lower:
            return "16. Infectious Diseases", "124. Tuberculosis"
        elif 'hiv' in text_lower or 'aids' in text_lower:
            return "16. Infectious Diseases", "125. HIV and AIDS"
        elif 'malaria' in text_lower:
            return "16. Infectious Diseases", "123. Parasitic Diseases"
        elif 'dengue' in text_lower or 'typhus' in text_lower or 'leptospirosis' in text_lower:
            return "16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"
        elif 'measles' in text_lower or 'mumps' in text_lower or 'rubella' in text_lower or 'varicella' in text_lower or 'polio' in text_lower:
            return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
        elif 'vaccine' in text_lower or 'immunization' in text_lower or 'prophylaxis' in text_lower:
            return "16. Infectious Diseases", "94. Immunization and Prophylaxis"
        elif 'fever' in text_lower and 'rash' in text_lower:
            return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
        else:
            return "16. Infectious Diseases", "93. Infectious Disease Assessment"
    
    # Cardiovascular
    if any(word in text_lower for word in ['heart', 'cardiac', 'cardiovascular', 'murmur', 'cyanotic', 'acyanotic', 'congenital heart', 'tetralogy', 'fallot', 'vsd', 'asd', 'pda', 'patent ductus', 'coarctation', 'transposition', 'rheumatic', 'carditis', 'endocarditis', 'pericarditis', 'myocarditis', 'cardiomyopathy', 'heart failure', 'shock', 'syncope', 'chest pain', 'arrhythmia', 'dysrhythmia', 'hypertension', 'bp']):
        if 'rheumatic' in text_lower:
            return "19. Cardiovascular System", "146. Rheumatic Fever"
        elif 'cyanotic' in text_lower or 'tetralogy' in text_lower or 'fallot' in text_lower:
            return "19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"
        elif 'congenital' in text_lower or 'vsd' in text_lower or 'asd' in text_lower or 'pda' in text_lower or 'patent ductus' in text_lower:
            return "19. Cardiovascular System", "143. Acyanotic Congenital Heart Disease"
        elif 'heart failure' in text_lower:
            return "19. Cardiovascular System", "145. Heart Failure"
        elif 'endocarditis' in text_lower:
            return "16. Infectious Diseases", "111. Infective Endocarditis"
        elif 'hypertension' in text_lower or 'bp' in text_lower:
            return "22. Nephrology and Urology", "166. Hypertension"
        else:
            return "19. Cardiovascular System", "139. Cardiovascular System Assessment"
    
    # Neonatal
    if any(word in text_lower for word in ['newborn', 'neonatal', 'fetal', 'preterm', 'premature', 'apgar', 'cephalhematoma', 'caput', 'respiratory distress', 'surfactant', 'hyaline membrane', 'jaundice', 'bilirubin', 'hyperbilirubinemia', 'phototherapy', 'exchange transfusion', 'necrotizing', 'enterocolitis', 'nec', 'sepsis', 'meningitis', 'hypoxic', 'ischemic', 'encephalopathy', 'intracranial hemorrhage', 'ivh', 'pvh', 'kangaroo', 'warm chain', 'bfhi', 'breast feeding', 'lactation', 'colostrum', 'vitamin k', 'eye prophylaxis', 'hepatitis b', 'bcg', 'opv', 'cord', 'placenta', 'gestational', 'postnatal', 'antenatal', 'intrapartum']):
        if 'respiratory distress' in text_lower or 'surfactant' in text_lower or 'hyaline membrane' in text_lower:
            return "11. Fetal and Neonatal Medicine", "61. Respiratory Diseases of the Newborn"
        elif 'jaundice' in text_lower or 'bilirubin' in text_lower or 'hyperbilirubinemia' in text_lower:
            return "11. Fetal and Neonatal Medicine", "62. Anemia and Hyperbilirubinemia"
        elif 'necrotizing' in text_lower or 'enterocolitis' in text_lower:
            return "11. Fetal and Neonatal Medicine", "63. Necrotizing Enterocolitis"
        elif 'sepsis' in text_lower or 'meningitis' in text_lower:
            return "11. Fetal and Neonatal Medicine", "65. Sepsis and Meningitis"
        elif 'hypoxic' in text_lower or 'ischemic' in text_lower or 'encephalopathy' in text_lower or 'intracranial hemorrhage' in text_lower:
            return "11. Fetal and Neonatal Medicine", "64. Hypoxic-Ischemic Encephalopathy, Intracranial Hemorrhage, and Seizures"
        elif 'fetal circulation' in text_lower:
            return "11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"
        else:
            return "11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"
    
    # Neurology
    if any(word in text_lower for word in ['neurology', 'seizure', 'convulsion', 'febrile', 'epilepsy', 'status epilepticus', 'meningitis', 'encephalitis', 'headache', 'migraine', 'csf', 'cerebrospinal', 'weakness', 'hypotonia', 'ataxia', 'movement', 'tremor', 'chorea', 'dystonia', 'coma', 'consciousness', 'altered mental', 'encephalopathy', 'cerebral', 'brain', 'spinal cord', 'cranial nerve', 'circle of willis', 'visual pathway', 'neurocutaneous', 'tuberous sclerosis', 'neurofibromatosis', 'sturge-weber', 'down', 'rett', 'angelman', 'prader-willi', 'neurodegenerative', 'leukodystrophy', 'hydrocephalus', 'microcephaly', 'macrocephaly', 'neural tube', 'spina bifida', 'craniosynostosis']):
        if 'seizure' in text_lower or 'convulsion' in text_lower or 'epilepsy' in text_lower or 'status epilepticus' in text_lower:
            return "24. Neurology", "181. Seizures"
        elif 'meningitis' in text_lower:
            return "16. Infectious Diseases", "100. Meningitis"
        elif 'headache' in text_lower or 'migraine' in text_lower:
            return "24. Neurology", "180. Headache and Migraine"
        elif 'csf' in text_lower or 'cerebrospinal' in text_lower or 'cranial nerve' in text_lower or 'circle of willis' in text_lower or 'visual pathway' in text_lower or 'spinal cord' in text_lower:
            return "24. Neurology", "179. Neurology Assessment"
        elif 'weakness' in text_lower or 'hypotonia' in text_lower:
            return "24. Neurology", "182. Weakness and Hypotonia"
        elif 'ataxia' in text_lower or 'movement' in text_lower or 'tremor' in text_lower or 'chorea' in text_lower or 'dystonia' in text_lower:
            return "24. Neurology", "183. Ataxia and Movement Disorders"
        elif 'coma' in text_lower or 'consciousness' in text_lower or 'altered mental' in text_lower or 'encephalopathy' in text_lower:
            return "24. Neurology", "184. Altered Mental Status"
        elif 'neurocutaneous' in text_lower or 'tuberous sclerosis' in text_lower or 'neurofibromatosis' in text_lower:
            return "24. Neurology", "186. Neurocutaneous Disorders"
        elif 'neurodegenerative' in text_lower or 'leukodystrophy' in text_lower or 'rett' in text_lower:
            return "24. Neurology", "185. Neurodegenerative Disorders"
        elif 'hydrocephalus' in text_lower or 'microcephaly' in text_lower or 'macrocephaly' in text_lower or 'neural tube' in text_lower or 'spina bifida' in text_lower or 'craniosynostosis' in text_lower:
            return "24. Neurology", "187. Congenital Malformations of the Central Nervous System"
        else:
            return "24. Neurology", "179. Neurology Assessment"
    
    # Nephrology
    if any(word in text_lower for word in ['nephrotic', 'nephritis', 'glomerulonephritis', 'hematuria', 'proteinuria', 'oliguria', 'edema', 'renal', 'kidney', 'urinary', 'urology', 'vesicoureteral', 'vur', 'uti', 'pyelonephritis', 'cystitis', 'ureter', 'bladder', 'hydronephrosis', 'polycystic', 'multicystic', 'dysplasia', 'agenesis', 'horseshoe', 'wilms', 'nephroblastoma', 'cryptorchidism', 'undescended', 'hydrocele', 'inguinal', 'hypospadias', 'epispadias', 'ambiguous', 'testicular', 'ovarian', 'vulvovaginitis', 'enuresis', 'voiding', 'circumcision', 'phimosis', 'hemolytic uremic', 'hus', 'dialysis', 'transplant']):
        if 'nephrotic' in text_lower or 'proteinuria' in text_lower or 'edema' in text_lower:
            return "22. Nephrology and Urology", "162. Nephrotic Syndrome and Proteinuria"
        elif 'glomerulonephritis' in text_lower or 'hematuria' in text_lower:
            return "22. Nephrology and Urology", "163. Glomerulonephritis and Hematuria"
        elif 'hemolytic uremic' in text_lower or 'hus' in text_lower:
            return "22. Nephrology and Urology", "164. Hemolytic Uremic Syndrome"
        elif 'acute renal' in text_lower or 'chronic renal' in text_lower or 'dialysis' in text_lower or 'transplant' in text_lower:
            return "22. Nephrology and Urology", "165. Acute and Chronic Renal Failure"
        elif 'hypertension' in text_lower:
            return "22. Nephrology and Urology", "166. Hypertension"
        elif 'vesicoureteral' in text_lower or 'vur' in text_lower:
            return "22. Nephrology and Urology", "167. Vesicoureteral Reflux"
        elif 'congenital' in text_lower and ('urinary' in text_lower or 'renal' in text_lower or 'kidney' in text_lower):
            return "22. Nephrology and Urology", "168. Congenital and Developmental Abnormalities of the Urinary Tract"
        elif 'uti' in text_lower or 'urinary tract' in text_lower or 'pyelonephritis' in text_lower or 'cystitis' in text_lower:
            return "16. Infectious Diseases", "114. Urinary Tract Infection"
        elif 'cryptorchidism' in text_lower or 'undescended' in text_lower or 'hydrocele' in text_lower or 'inguinal' in text_lower or 'hypospadias' in text_lower or 'epispadias' in text_lower or 'ambiguous' in text_lower or 'testicular' in text_lower or 'ovarian' in text_lower or 'vulvovaginitis' in text_lower or 'enuresis' in text_lower or 'voiding' in text_lower or 'circumcision' in text_lower or 'phimosis' in text_lower:
            return "22. Nephrology and Urology", "169. Other Urinary Tract and Genital Disorders"
        else:
            return "22. Nephrology and Urology", "161. Nephrology and Urology Assessment"
    
    # Hematology
    if any(word in text_lower for word in ['anemia', 'hemolytic', 'hemoglobin', 'hematocrit', 'rbc', 'red blood cell', 'platelet', 'thrombocytopenia', 'coagulation', 'bleeding', 'hemophilia', 'von willebrand', 'dic', 'transfusion', 'iron deficiency', 'megaloblastic', 'b12', 'folate', 'thalassemia', 'sickle cell', 'g6pd', 'spherocytosis', 'aplastic', 'bone marrow', 'peripheral smear']):
        if 'anemia' in text_lower or 'iron deficiency' in text_lower or 'megaloblastic' in text_lower or 'b12' in text_lower or 'folate' in text_lower or 'thalassemia' in text_lower or 'sickle' in text_lower or 'g6pd' in text_lower or 'spherocytosis' in text_lower or 'aplastic' in text_lower or 'hemolytic' in text_lower or 'peripheral smear' in text_lower:
            return "20. Hematology", "150. Anemia"
        elif 'bleeding' in text_lower or 'coagulation' in text_lower or 'hemophilia' in text_lower or 'von willebrand' in text_lower or 'dic' in text_lower or 'thrombocytopenia' in text_lower:
            return "20. Hematology", "151. Hemostatic Disorders"
        elif 'transfusion' in text_lower:
            return "20. Hematology", "152. Blood Component Therapy"
        else:
            return "20. Hematology", "149. Hematology Assessment"
    
    # Nutrition
    if any(word in text_lower for word in ['nutrition', 'diet', 'feeding', 'breast', 'formula', 'milk', 'lactose', 'weaning', 'complementary', 'obesity', 'overweight', 'undernutrition', 'malnutrition', 'kwashiorkor', 'marasmus', 'vitamin', 'mineral', 'zinc', 'iron', 'calcium', 'rickets', 'scurvy', 'beriberi', 'pellagra', 'bfhi']):
        if 'kwashiorkor' in text_lower or 'marasmus' in text_lower or 'undernutrition' in text_lower or 'malnutrition' in text_lower:
            return "6. Pediatric Nutrition", "30. Pediatric Undernutrition"
        elif 'obesity' in text_lower or 'overweight' in text_lower:
            return "6. Pediatric Nutrition", "29. Obesity"
        elif 'vitamin' in text_lower or 'mineral' in text_lower or 'zinc' in text_lower or 'iron' in text_lower or 'calcium' in text_lower or 'rickets' in text_lower or 'scurvy' in text_lower or 'beriberi' in text_lower or 'pellagra' in text_lower:
            return "6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"
        elif 'breast' in text_lower or 'formula' in text_lower or 'milk' in text_lower or 'lactose' in text_lower or 'feeding' in text_lower or 'weaning' in text_lower or 'complementary' in text_lower or 'bfhi' in text_lower:
            if 'infant' in text_lower or 'newborn' in text_lower or 'baby' in text_lower or 'neonatal' in text_lower:
                return "6. Pediatric Nutrition", "27. Diet of the Normal Infant"
            else:
                return "6. Pediatric Nutrition", "28. Diet of the Normal Child and Adolescent"
        else:
            return "6. Pediatric Nutrition", "28. Diet of the Normal Child and Adolescent"
    
    # Fluids and Electrolytes
    if any(word in text_lower for word in ['fluid', 'dehydration', 'rehydration', 'electrolyte', 'sodium', 'potassium', 'acid-base', 'ph', 'hypokalemia', 'hyperkalemia', 'hyponatremia', 'hypernatremia', 'hypochloremia', 'hyperchloremia', 'metabolic acidosis', 'metabolic alkalosis', 'respiratory acidosis', 'respiratory alkalosis', 'parenteral nutrition', 'maintenance fluid', 'ors']):
        if 'dehydration' in text_lower or 'rehydration' in text_lower or 'ors' in text_lower:
            return "7. Fluids and Electrolytes", "33. Dehydration and Replacement Therapy"
        elif 'hypokalemia' in text_lower or 'hyperkalemia' in text_lower or 'potassium' in text_lower:
            return "7. Fluids and Electrolytes", "36. Potassium Disorders"
        elif 'hyponatremia' in text_lower or 'hypernatremia' in text_lower or 'sodium' in text_lower:
            return "7. Fluids and Electrolytes", "35. Sodium Disorders"
        elif 'acid-base' in text_lower or 'acidosis' in text_lower or 'alkalosis' in text_lower or 'ph' in text_lower:
            return "7. Fluids and Electrolytes", "37. Acid-Base Disorders"
        elif 'parenteral' in text_lower:
            return "7. Fluids and Electrolytes", "34. Parenteral Nutrition"
        elif 'fluid' in text_lower:
            return "7. Fluids and Electrolytes", "32. Maintenance Fluid Therapy"
        else:
            return "7. Fluids and Electrolytes", "32. Maintenance Fluid Therapy"
    
    # Growth and Development
    if any(word in text_lower for word in ['growth', 'development', 'milestones', 'assessment', 'well child', 'special needs', 'intellectual disability', 'mental retardation', 'developmental delay', 'down syndrome', 'down\'s syndrome', 'genetic', 'chromosomal', 'dysmorphic', 'inheritance', 'marfan', 'duchenne', 'hunter']):
        if 'growth' in text_lower and ('assessment' in text_lower or 'measurement' in text_lower or 'chart' in text_lower or 'percentile' in text_lower or 'index' in text_lower):
            return "2. Growth and Development", "5. Normal Growth"
        elif 'development' in text_lower and ('assessment' in text_lower or 'milestones' in text_lower or 'evaluation' in text_lower):
            return "2. Growth and Development", "7. Normal Development"
        elif 'down' in text_lower or 'marfan' in text_lower or 'duchenne' in text_lower or 'hunter' in text_lower or 'chromosomal' in text_lower or 'genetic' in text_lower or 'inheritance' in text_lower:
            return "9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"
        elif 'intellectual disability' in text_lower or 'mental retardation' in text_lower or 'developmental delay' in text_lower:
            return "4. Psychiatric Disorders", "20. Autism Spectrum Disorder and Schizophrenia"
        else:
            return "2. Growth and Development", "7. Normal Development"
    
    # Genetics
    if any(word in text_lower for word in ['genetic', 'chromosomal', 'inheritance', 'down syndrome', 'down\'s syndrome', 'klinefelter', 'turner', 'marfan', 'tuberous sclerosis', 'neurofibromatosis', 'fragile x', 'dysmorphic', 'karyotype', 'chromosome', 'gene', 'mutation']):
        if 'inheritance' in text_lower:
            return "9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"
        elif 'down' in text_lower or 'klinefelter' in text_lower or 'turner' in text_lower or 'chromosomal' in text_lower:
            return "9. Human Genetics and Dysmorphology", "49. Chromosomal Disorders"
        elif 'genetic' in text_lower or 'assessment' in text_lower or 'karyotype' in text_lower:
            return "9. Human Genetics and Dysmorphology", "48. Genetic Assessment"
        elif 'dysmorphic' in text_lower:
            return "9. Human Genetics and Dysmorphology", "50. Approach to the Dysmorphic Child"
        else:
            return "9. Human Genetics and Dysmorphology", "48. Genetic Assessment"
    
    # Rheumatic Diseases
    if any(word in text_lower for word in ['rheumatic', 'henoch', 'schonlein', 'kawasaki', 'jia', 'juvenile idiopathic arthritis', 'lupus', 'sle', 'dermatomyositis', 'musculoskeletal pain', 'arthritis']):
        if 'rheumatic fever' in text_lower:
            return "19. Cardiovascular System", "146. Rheumatic Fever"
        elif 'henoch' in text_lower or 'schonlein' in text_lower:
            return "15. Rheumatic Diseases", "87. Henoch-Schonlein Purpura"
        elif 'kawasaki' in text_lower:
            return "15. Rheumatic Diseases", "88. Kawasaki Disease"
        elif 'jia' in text_lower or 'juvenile idiopathic arthritis' in text_lower:
            return "15. Rheumatic Diseases", "89. Juvenile Idiopathic Arthritis"
        elif 'lupus' in text_lower or 'sle' in text_lower:
            return "15. Rheumatic Diseases", "90. Systemic Lupus Erythematosus"
        elif 'dermatomyositis' in text_lower:
            return "15. Rheumatic Diseases", "91. Juvenile Dermatomyositis"
        elif 'arthritis' in text_lower:
            return "15. Rheumatic Diseases", "89. Juvenile Idiopathic Arthritis"
        else:
            return "15. Rheumatic Diseases", "86. Rheumatic Assessment"
    
    # Respiratory
    if any(word in text_lower for word in ['respiratory', 'lung', 'airway', 'breathing', 'wheezing', 'stridor', 'apnea', 'croup', 'bronchiolitis', 'pertussis', 'asthma', 'pneumonia', 'tuberculosis', 'cystic fibrosis', 'pneumothorax', 'hemothorax', 'empyema', 'pleura', 'chest wall', 'diaphragm', 'foreign body', 'aspiration', 'meconium']):
        if 'croup' in text_lower:
            return "16. Infectious Diseases", "107. Croup"
        elif 'bronchiolitis' in text_lower:
            return "16. Infectious Diseases", "109. Bronchiolitis"
        elif 'pertussis' in text_lower:
            return "16. Infectious Diseases", "108. Pertussis"
        elif 'pneumonia' in text_lower and 'hiv' not in text_lower:
            return "16. Infectious Diseases", "110. Pneumonia"
        elif 'tuberculosis' in text_lower:
            return "16. Infectious Diseases", "124. Tuberculosis"
        elif 'asthma' in text_lower:
            return "14. Allergy", "78. Asthma"
        elif 'cystic fibrosis' in text_lower:
            return "18. Respiratory System", "137. Cystic Fibrosis"
        elif 'pneumothorax' in text_lower or 'hemothorax' in text_lower or 'empyema' in text_lower or 'pleura' in text_lower or 'chest wall' in text_lower:
            return "18. Respiratory System", "138. Chest Wall and Pleura"
        elif 'airway' in text_lower or 'obstruction' in text_lower or 'foreign body' in text_lower or 'stridor' in text_lower:
            return "18. Respiratory System", "135. Upper Airway Obstruction"
        elif 'lung' in text_lower or 'parenchymal' in text_lower or 'wheezing' in text_lower or 'bronchiectasis' in text_lower:
            return "18. Respiratory System", "136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases"
        else:
            return "18. Respiratory System", "133. Respiratory System Assessment"
    
    # Digestive
    if any(word in text_lower for word in ['digestive', 'oral', 'esophagus', 'stomach', 'intestinal', 'liver', 'hepatic', 'pancreas', 'pancreatic', 'peritonitis', 'gerd', 'constipation', 'diarrhea', 'malabsorption', 'celiac', 'crohn', 'ulcerative', 'bilirubin', 'jaundice', 'hepatitis', 'cirrhosis', 'portal', 'biliary', 'cholestasis', 'pancreatitis', 'appendicitis', 'intussusception', 'volvulus', 'hirschsprung', 'cleft', 'cleft lip', 'cleft palate']):
        if 'cleft' in text_lower and ('lip' in text_lower or 'palate' in text_lower):
            return "17. Digestive System", "127. Oral Cavity"
        elif 'oral' in text_lower or 'cavity' in text_lower:
            return "17. Digestive System", "127. Oral Cavity"
        elif 'esophagus' in text_lower or 'stomach' in text_lower or 'gerd' in text_lower:
            return "17. Digestive System", "128. Esophagus and Stomach"
        elif 'intestinal' in text_lower or 'intestine' in text_lower or 'bowel' in text_lower or 'constipation' in text_lower or 'diarrhea' in text_lower or 'malabsorption' in text_lower or 'celiac' in text_lower or 'crohn' in text_lower or 'intussusception' in text_lower or 'volvulus' in text_lower or 'hirschsprung' in text_lower:
            return "17. Digestive System", "129. Intestinal Tract"
        elif 'liver' in text_lower or 'hepatic' in text_lower or 'bilirubin' in text_lower or 'jaundice' in text_lower or 'hepatitis' in text_lower or 'cirrhosis' in text_lower or 'portal' in text_lower or 'biliary' in text_lower or 'cholestasis' in text_lower:
            return "17. Digestive System", "130. Liver Disease"
        elif 'pancreas' in text_lower or 'pancreatic' in text_lower or 'pancreatitis' in text_lower:
            return "17. Digestive System", "131. Pancreatic Disease"
        elif 'peritonitis' in text_lower:
            return "17. Digestive System", "132. Peritonitis"
        else:
            return "17. Digestive System", "126. Digestive System Assessment"
    
    # Endocrinology
    if any(word in text_lower for word in ['endocrine', 'diabetes', 'hypoglycemia', 'short stature', 'puberty', 'thyroid', 'parathyroid', 'adrenal', 'cushing', 'addison', 'cah', 'precocious', 'growth hormone', 'insulin', 'glucose', 'dkd', 'hyperthyroidism', 'hypothyroidism', 'goiter', 'rickets', 'osteoporosis', 'vitamin d', 'sexual development', 'ambiguous', 'pcos', 'hirsutism', 'pheochromocytoma']):
        if 'diabetes' in text_lower or 'insulin' in text_lower or 'glucose' in text_lower:
            return "23. Endocrinology", "171. Diabetes Mellitus"
        elif 'hypoglycemia' in text_lower:
            return "23. Endocrinology", "172. Hypoglycemia"
        elif 'short stature' in text_lower or 'growth hormone' in text_lower:
            return "23. Endocrinology", "173. Short Stature"
        elif 'puberty' in text_lower or 'precocious' in text_lower:
            return "23. Endocrinology", "174. Disorders of Puberty"
        elif 'thyroid' in text_lower or 'hyperthyroidism' in text_lower or 'hypothyroidism' in text_lower or 'goiter' in text_lower:
            return "23. Endocrinology", "175. Thyroid Disease"
        elif 'parathyroid' in text_lower or 'vitamin d' in text_lower or 'calcium' in text_lower or 'phosphate' in text_lower or 'rickets' in text_lower:
            return "23. Endocrinology", "176. Disorders of Parathyroid Bone and Mineral Endocrinology"
        elif 'sexual development' in text_lower or 'ambiguous' in text_lower:
            return "23. Endocrinology", "177. Disorders of Sexual Development"
        elif 'adrenal' in text_lower or 'cushing' in text_lower or 'addison' in text_lower or 'cah' in text_lower or 'pheochromocytoma' in text_lower:
            return "23. Endocrinology", "178. Adrenal Gland Dysfunction"
        else:
            return "23. Endocrinology", "170. Endocrinology Assessment"
    
    # Behavioral
    if any(word in text_lower for word in ['crying', 'colic', 'temper tantrum', 'adhd', 'sleep', 'elimination', 'enuresis', 'encopresis', 'thumb sucking', 'nail biting']):
        if 'adhd' in text_lower:
            return "3. Behavioral Disorders", "13. ADHD"
        elif 'sleep' in text_lower:
            return "3. Behavioral Disorders", "15. Normal Sleep and Pediatric Sleep Disorders"
        elif 'crying' in text_lower or 'colic' in text_lower:
            return "3. Behavioral Disorders", "11. Crying and Colic"
        elif 'temper' in text_lower or 'tantrum' in text_lower or 'thumb' in text_lower or 'nail' in text_lower:
            return "3. Behavioral Disorders", "12. Temper Tantrums"
        elif 'elimination' in text_lower or 'enuresis' in text_lower or 'encopresis' in text_lower:
            return "3. Behavioral Disorders", "14. Control of Elimination"
        else:
            return "3. Behavioral Disorders", "12. Temper Tantrums"
    
    # Acute care
    if any(word in text_lower for word in ['resuscitation', 'trauma', 'injury', 'drowning', 'burns', 'poisoning', 'sedation', 'analgesia', 'shock', 'respiratory failure']):
        if 'resuscitation' in text_lower:
            return "8. Acutely Ill or Injured Child", "38. Assessment and Resuscitation"
        elif 'trauma' in text_lower or 'injury' in text_lower:
            return "8. Acutely Ill or Injured Child", "42. Major Trauma"
        elif 'drown' in text_lower:
            return "8. Acutely Ill or Injured Child", "43. Drowning"
        elif 'burn' in text_lower:
            return "8. Acutely Ill or Injured Child", "44. Burns"
        elif 'poison' in text_lower:
            return "8. Acutely Ill or Injured Child", "45. Poisoning"
        elif 'shock' in text_lower:
            return "8. Acutely Ill or Injured Child", "40. Shock"
        elif 'respiratory failure' in text_lower:
            return "8. Acutely Ill or Injured Child", "39. Respiratory Failure"
        else:
            return "8. Acutely Ill or Injured Child", "38. Assessment and Resuscitation"
    
    # Allergy
    if any(word in text_lower for word in ['allergy', 'allergic', 'asthma', 'rhinitis', 'atopic', 'eczema', 'urticaria', 'angioedema', 'anaphylaxis', 'serum sickness', 'food reaction', 'drug reaction']):
        if 'asthma' in text_lower:
            return "14. Allergy", "78. Asthma"
        elif 'rhinitis' in text_lower:
            return "14. Allergy", "79. Allergic Rhinitis"
        elif 'atopic' in text_lower or 'eczema' in text_lower:
            return "14. Allergy", "80. Atopic Dermatitis"
        elif 'urticaria' in text_lower or 'angioedema' in text_lower or 'anaphylaxis' in text_lower:
            return "14. Allergy", "81. Urticaria, Angioedema, and Anaphylaxis"
        else:
            return "14. Allergy", "77. Allergy Assessment"
    
    # Dermatology
    if any(word in text_lower for word in ['skin', 'dermatology', 'acne', 'dermatitis', 'seborrheic', 'pigmented', 'vascular anomaly', 'hemangioma', 'erythema multiforme', 'stevens-johnson', 'toxic epidermal', 'scabies', 'lice', 'molluscum', 'wart', 'impetigo', 'cellulitis', 'tinea', 'candidiasis', 'diaper', 'psoriasis', 'ichthyosis', 'epidermolysis']):
        if 'acne' in text_lower:
            return "25. Dermatology", "189. Acne"
        elif 'atopic' in text_lower or 'dermatitis' in text_lower:
            return "25. Dermatology", "190. Atopic Dermatitis"
        elif 'contact' in text_lower and 'dermatitis' in text_lower:
            return "25. Dermatology", "191. Contact Dermatitis"
        elif 'seborrheic' in text_lower:
            return "25. Dermatology", "192. Seborrheic Dermatitis"
        elif 'pigmented' in text_lower:
            return "25. Dermatology", "193. Pigmented Lesions"
        elif 'vascular' in text_lower or 'hemangioma' in text_lower:
            return "25. Dermatology", "194. Vascular Anomalies"
        elif 'erythema multiforme' in text_lower or 'stevens-johnson' in text_lower or 'toxic epidermal' in text_lower:
            return "25. Dermatology", "195. Erythema Multiforme, Stevens-Johnson Syndrome, and Toxic Epidermal Necrolysis"
        elif 'scabies' in text_lower or 'lice' in text_lower:
            return "25. Dermatology", "196. Cutaneous Infestations"
        else:
            return "25. Dermatology", "188. Dermatology Assessment"
    
    # Orthopedics
    if any(word in text_lower for word in ['fracture', 'hip', 'knee', 'foot', 'spine', 'scoliosis', 'upper extremity', 'lower extremity', 'bone tumor', 'clubfoot', 'talipes', 'ddh', 'congenital hip', 'torticollis', 'brachial plexus', 'limb', 'osteomyelitis', 'septic arthritis', 'scfe', 'legg-calve', 'perthes', 'osgood', 'blount', 'rickets', 'osteogenesis', 'achondroplasia']):
        if 'fracture' in text_lower:
            return "26. Orthopedics", "198. Fractures"
        elif 'hip' in text_lower or 'ddh' in text_lower or 'congenital hip' in text_lower:
            return "26. Orthopedics", "199. Hip"
        elif 'lower extremity' in text_lower or 'knee' in text_lower or 'leg' in text_lower or 'foot' in text_lower or 'clubfoot' in text_lower or 'talipes' in text_lower:
            return "26. Orthopedics", "200. Lower Extremity and Knee"
        elif 'spine' in text_lower or 'scoliosis' in text_lower:
            return "26. Orthopedics", "202. Spine"
        elif 'upper extremity' in text_lower or 'arm' in text_lower or 'hand' in text_lower or 'brachial plexus' in text_lower:
            return "26. Orthopedics", "203. Upper Extremity"
        elif 'bone tumor' in text_lower:
            return "26. Orthopedics", "204. Benign Bone Tumors and Cystic Lesions"
        else:
            return "26. Orthopedics", "197. Orthopedics Assessment"
    
    # Oncology
    if any(word in text_lower for word in ['oncology', 'cancer', 'tumor', 'neoplasm', 'malignancy', 'leukemia', 'lymphoma', 'hodgkin', 'brain tumor', 'neuroblastoma', 'wilms', 'nephroblastoma', 'sarcoma', 'osteosarcoma', 'ewing', 'rhabdomyosarcoma', 'retinoblastoma']):
        if 'leukemia' in text_lower:
            return "21. Oncology", "155. Leukemia"
        elif 'lymphoma' in text_lower or 'hodgkin' in text_lower:
            return "21. Oncology", "156. Lymphoma"
        elif 'brain' in text_lower or 'cns' in text_lower:
            return "21. Oncology", "157. Central Nervous System Tumors"
        elif 'neuroblastoma' in text_lower:
            return "21. Oncology", "158. Neuroblastoma"
        elif 'wilms' in text_lower or 'nephroblastoma' in text_lower:
            return "21. Oncology", "159. Wilms Tumor"
        elif 'sarcoma' in text_lower:
            return "21. Oncology", "160. Sarcomas"
        else:
            return "21. Oncology", "153. Oncology Assessment"
    
    # Psychosocial
    if any(word in text_lower for word in ['failure to thrive', 'child abuse', 'neglect', 'gender identity', 'family', 'violence', 'divorce', 'bereavement', 'separation']):
        if 'failure to thrive' in text_lower:
            return "5. Psychosocial Issues", "21. Failure to Thrive"
        elif 'abuse' in text_lower or 'neglect' in text_lower:
            return "5. Psychosocial Issues", "22. Child Abuse and Neglect"
        else:
            return "5. Psychosocial Issues", "24. Family Structure and Function"
    
    # Default fallback - if we reach here, the exact mapping should have caught it
    # But just in case, assign to a reasonable default based on general keywords
    print(f"WARNING: Unclassified question (using default): {text[:80]}...")
    return "2. Growth and Development", "7. Normal Development"

# Process each question
for q in questions:
    section, chapter = classify_question(q)
    q['nelson_section'] = section
    q['nelson_chapter'] = chapter

# Save the output
with open('/Users/akashstephen/Developer/Pediatrics Exam/classified_batch_1.json', 'w') as f:
    json.dump(questions, f, indent=2)

# Generate summary
summary = {}
for q in questions:
    section = q['nelson_section']
    if section not in summary:
        summary[section] = 0
    summary[section] += 1

print("Summary of question distribution by section:")
print("=" * 50)
for section, count in sorted(summary.items(), key=lambda x: int(x[0].split('.')[0])):
    print(f"{section}: {count} questions")
print("=" * 50)
print(f"Total questions: {len(questions)}")

# Also show chapter breakdown for sections with questions
print("\nDetailed breakdown by chapter:")
chapter_summary = {}
for q in questions:
    chapter = q['nelson_chapter']
    if chapter not in chapter_summary:
        chapter_summary[chapter] = 0
    chapter_summary[chapter] += 1

for chapter, count in sorted(chapter_summary.items(), key=lambda x: int(x[0].split('.')[0])):
    print(f"  {chapter}: {count}")
