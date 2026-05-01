import json
import re

# Load the input file
with open('/Users/akashstephen/Developer/Pediatrics Exam/questions_batch_1.json', 'r') as f:
    questions = json.load(f)

# Define classification function based on medical knowledge and keywords
def classify_question(q):
    text = q['question_text'].lower()
    
    # SECTION 1: Profession of Pediatrics
    if any(word in text for word in ['population', 'culture', 'professionalism', 'ethics', 'legal issues', 'palliative care', 'end-of-life']):
        return "1. Profession of Pediatrics", "1. Population and Culture"  # default
    
    # SECTION 2: Growth and Development
    if any(word in text for word in ['growth', 'development', 'well child', 'special needs', 'developmental']):
        if 'disorder' in text or 'delay' in text:
            return "2. Growth and Development", "8. Disorders of Development"
        elif 'growth' in text:
            return "2. Growth and Development", "6. Disorders of Growth"
        else:
            return "2. Growth and Development", "7. Normal Development"
    
    # SECTION 3: Behavioral Disorders
    if any(word in text for word in ['crying', 'colic', 'temper tantrum', 'adhd', 'elimination', 'sleep']):
        if 'adhd' in text or 'attention' in text:
            return "3. Behavioral Disorders", "13. ADHD"
        elif 'sleep' in text:
            return "3. Behavioral Disorders", "15. Normal Sleep and Pediatric Sleep Disorders"
        elif 'crying' in text or 'colic' in text:
            return "3. Behavioral Disorders", "11. Crying and Colic"
    
    # SECTION 4: Psychiatric Disorders
    if any(word in text for word in ['somatic', 'anxiety', 'depressive', 'bipolar', 'obsessive', 'autism', 'schizophrenia']):
        if 'autism' in text:
            return "4. Psychiatric Disorders", "20. Autism Spectrum Disorder and Schizophrenia"
        elif 'anxiety' in text:
            return "4. Psychiatric Disorders", "17. Anxiety Disorders"
    
    # SECTION 5: Psychosocial Issues
    if any(word in text for word in ['failure to thrive', 'child abuse', 'neglect', 'gender identity', 'family structure', 'violence', 'divorce', 'bereavement']):
        if 'failure to thrive' in text:
            return "5. Psychosocial Issues", "21. Failure to Thrive"
        elif 'abuse' in text or 'neglect' in text:
            return "5. Psychosocial Issues", "22. Child Abuse and Neglect"
    
    # SECTION 6: Pediatric Nutrition
    if any(word in text for word in ['diet', 'nutrition', 'obesity', 'undernutrition', 'kwashiorkor', 'marasmus', 'vitamin', 'mineral', 'deficiency', 'rickets', 'scurvy', 'beriberi', 'breast feeding', 'breast milk', 'lactose', 'bfhi', 'baby friendly', 'weaning']):
        if 'kwashiorkor' in text or 'marasmus' in text or 'undernutrition' in text:
            return "6. Pediatric Nutrition", "30. Pediatric Undernutrition"
        elif 'obesity' in text:
            return "6. Pediatric Nutrition", "29. Obesity"
        elif 'vitamin' in text or 'mineral' in text or 'zinc' in text or 'iron' in text or 'antioxidant' in text:
            return "6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"
        elif 'diet' in text or 'nutrition' in text or 'breast' in text or 'lactose' in text or 'bfhi' in text or 'baby friendly' in text or 'weaning' in text:
            if 'infant' in text or 'newborn' in text or 'baby' in text or 'lactose' in text or 'bfhi' in text:
                return "6. Pediatric Nutrition", "27. Diet of the Normal Infant"
            else:
                return "6. Pediatric Nutrition", "28. Diet of the Normal Child and Adolescent"
        elif 'rickets' in text:
            return "6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"
    
    # SECTION 7: Fluids and Electrolytes
    if any(word in text for word in ['fluid', 'dehydration', 'rehydration', 'electrolyte', 'sodium', 'potassium', 'acid-base', 'ph', 'hypokalemia', 'hyperkalemia', 'hyponatremia', 'hypernatremia', 'parenteral nutrition']):
        if 'dehydration' in text or 'rehydration' in text or 'oral rehydration' in text:
            return "7. Fluids and Electrolytes", "33. Dehydration and Replacement Therapy"
        elif 'hypokalemia' in text or 'hyperkalemia' in text or 'potassium' in text:
            return "7. Fluids and Electrolytes", "36. Potassium Disorders"
        elif 'hyponatremia' in text or 'hypernatremia' in text or 'sodium' in text:
            return "7. Fluids and Electrolytes", "35. Sodium Disorders"
        elif 'acid-base' in text or 'ph' in text:
            return "7. Fluids and Electrolytes", "37. Acid-Base Disorders"
        elif 'parenteral' in text:
            return "7. Fluids and Electrolytes", "34. Parenteral Nutrition"
        elif 'fluid' in text:
            return "7. Fluids and Electrolytes", "32. Maintenance Fluid Therapy"
    
    # SECTION 8: Acutely Ill or Injured Child
    if any(word in text for word in ['resuscitation', 'respiratory failure', 'shock', 'injury', 'trauma', 'drowning', 'burns', 'poisoning', 'sedation', 'analgesia', 'assessment', 'acute']):
        if 'resuscitation' in text or 'assessment' in text:
            return "8. Acutely Ill or Injured Child", "38. Assessment and Resuscitation"
        elif 'respiratory failure' in text:
            return "8. Acutely Ill or Injured Child", "39. Respiratory Failure"
        elif 'shock' in text:
            return "8. Acutely Ill or Injured Child", "40. Shock"
        elif 'injury' in text or 'prevention' in text:
            return "8. Acutely Ill or Injured Child", "41. Injury Prevention"
        elif 'trauma' in text:
            return "8. Acutely Ill or Injured Child", "42. Major Trauma"
        elif 'drown' in text:
            return "8. Acutely Ill or Injured Child", "43. Drowning"
        elif 'burn' in text:
            return "8. Acutely Ill or Injured Child", "44. Burns"
        elif 'poison' in text:
            return "8. Acutely Ill or Injured Child", "45. Poisoning"
    
    # SECTION 9: Human Genetics and Dysmorphology
    if any(word in text for word in ['genetic', 'inheritance', 'chromosomal', 'dysmorphic', 'down syndrome', 'down\'s syndrome', 'marfan', 'duchenne', 'hunter', 'tuberous sclerosis', 'neurofibromatosis', 'fragile x', 'klinefelter', 'turner']):
        if 'inheritance' in text or 'pattern' in text:
            return "9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"
        elif 'chromosomal' in text or 'down' in text or 'klinefelter' in text or 'turner' in text:
            return "9. Human Genetics and Dysmorphology", "49. Chromosomal Disorders"
        elif 'genetic' in text or 'assessment' in text:
            return "9. Human Genetics and Dysmorphology", "48. Genetic Assessment"
        elif 'dysmorphic' in text:
            return "9. Human Genetics and Dysmorphology", "50. Approach to the Dysmorphic Child"
        elif any(word in text for word in ['marfan', 'duchenne', 'hunter', 'tuberous', 'neurofibromatosis']):
            return "9. Human Genetics and Dysmorphology", "47. Patterns of Inheritance"
    
    # SECTION 10: Metabolic Disorders
    if any(word in text for word in ['metabolic', 'carbohydrate', 'amino acid', 'organic acid', 'fat metabolism', 'lysosomal', 'peroxisomal', 'mitochondrial', 'phenylketonuria', 'pku', 'galactosemia', 'glycogen storage']):
        if 'metabolic' in text and 'assessment' in text:
            return "10. Metabolic Disorders", "51. Metabolic Assessment"
        elif 'phenylketonuria' in text or 'pku' in text or 'amino acid' in text:
            return "10. Metabolic Disorders", "53. Amino Acid Disorders"
        elif 'galactosemia' in text or 'carbohydrate' in text:
            return "10. Metabolic Disorders", "52. Carbohydrate Disorders"
    
    # SECTION 11: Fetal and Neonatal Medicine
    if any(word in text for word in ['fetal', 'neonatal', 'newborn', 'maternal', 'necrotizing', 'enterocolitis', 'hypoxic', 'ischemic', 'encephalopathy', 'intracranial hemorrhage', 'seizure', 'sepsis', 'meningitis', 'congenital infection', 'apgar', 'caput', 'cephalhematoma', 'respiratory distress', 'premature', 'preterm', 'jaundice', 'hyperbilirubinemia', 'anemia', 'hemolytic', 'warm chain', 'kangaroo', 'vitamin k', 'surfactant', 'hyaline membrane', 'retinopathy', 'bronchopulmonary', 'patent ductus']):
        if 'fetal' in text and 'circulation' in text:
            return "11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"
        elif 'fetal' in text:
            return "11. Fetal and Neonatal Medicine", "60. Diseases of the Fetus"
        elif 'maternal' in text:
            return "11. Fetal and Neonatal Medicine", "59. Maternal Diseases Affecting the Newborn"
        elif 'respiratory distress' in text or 'hyaline membrane' in text or 'surfactant' in text:
            return "11. Fetal and Neonatal Medicine", "61. Respiratory Diseases of the Newborn"
        elif 'anemia' in text or 'hyperbilirubinemia' in text or 'jaundice' in text or 'hemolytic' in text:
            return "11. Fetal and Neonatal Medicine", "62. Anemia and Hyperbilirubinemia"
        elif 'necrotizing' in text or 'enterocolitis' in text:
            return "11. Fetal and Neonatal Medicine", "63. Necrotizing Enterocolitis"
        elif 'hypoxic' in text or 'ischemic' in text or 'encephalopathy' in text or 'intracranial hemorrhage' in text:
            return "11. Fetal and Neonatal Medicine", "64. Hypoxic-Ischemic Encephalopathy, Intracranial Hemorrhage, and Seizures"
        elif 'sepsis' in text or 'meningitis' in text:
            return "11. Fetal and Neonatal Medicine", "65. Sepsis and Meningitis"
        elif 'congenital infection' in text or 'torch' in text:
            return "11. Fetal and Neonatal Medicine", "66. Congenital Infections"
        elif 'apgar' in text or 'newborn' in text or 'neonatal' in text or 'preterm' in text or 'premature' in text or 'caput' in text or 'cephalhematoma' in text or 'warm chain' in text or 'kangaroo' in text or 'vitamin k' in text:
            return "11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"
    
    # SECTION 12: Adolescent Medicine
    if any(word in text for word in ['adolescent', 'puberty', 'eating disorder', 'substance abuse', 'gynecology']):
        if 'adolescent' in text and 'gynecology' in text:
            return "12. Adolescent Medicine", "69. Adolescent Gynecology"
        elif 'eating' in text:
            return "12. Adolescent Medicine", "70. Eating Disorders"
        elif 'substance' in text:
            return "12. Adolescent Medicine", "71. Substance Abuse"
        elif 'puberty' in text:
            return "12. Adolescent Medicine", "74. Disorders of Puberty"
        else:
            return "12. Adolescent Medicine", "67. Overview and Assessment of Adolescents"
    
    # SECTION 13: Immunology
    if any(word in text for word in ['immunological', 'lymphocyte', 'neutrophil', 'complement', 'stem cell', 'immunodeficiency', 'wiskott-aldrich', 'di george', 'severe combined']):
        if 'lymphocyte' in text:
            return "13. Immunology", "73. Lymphocyte Disorders"
        elif 'neutrophil' in text:
            return "13. Immunology", "74. Neutrophil Disorders"
        elif 'complement' in text:
            return "13. Immunology", "75. Complement System"
        elif 'stem cell' in text:
            return "13. Immunology", "76. Hematopoietic Stem Cell Transplantation"
        else:
            return "13. Immunology", "72. Immunological Assessment"
    
    # SECTION 14: Allergy
    if any(word in text for word in ['allergy', 'asthma', 'rhinitis', 'atopic', 'urticaria', 'angioedema', 'anaphylaxis', 'serum sickness', 'insect', 'food allergy', 'drug allergy']):
        if 'asthma' in text:
            return "14. Allergy", "78. Asthma"
        elif 'rhinitis' in text:
            return "14. Allergy", "79. Allergic Rhinitis"
        elif 'atopic' in text and 'dermatitis' in text:
            return "14. Allergy", "80. Atopic Dermatitis"
        elif 'urticaria' in text or 'angioedema' in text or 'anaphylaxis' in text:
            return "14. Allergy", "81. Urticaria, Angioedema, and Anaphylaxis"
        elif 'serum sickness' in text:
            return "14. Allergy", "82. Serum Sickness"
        elif 'insect' in text:
            return "14. Allergy", "83. Insect Allergies"
        elif 'food' in text and 'allergy' in text:
            return "14. Allergy", "84. Adverse Reactions to Foods"
        elif 'drug' in text and 'allergy' in text:
            return "14. Allergy", "85. Adverse Reactions to Drugs"
        else:
            return "14. Allergy", "77. Allergy Assessment"
    
    # SECTION 15: Rheumatic Diseases
    if any(word in text for word in ['rheumatic', 'henoch-schonlein', 'kawasaki', 'juvenile idiopathic arthritis', 'jia', 'lupus', 'dermatomyositis', 'musculoskeletal pain']):
        if 'rheumatic fever' in text and 'prophylaxis' not in text:
            return "19. Cardiovascular System", "146. Rheumatic Fever"
        elif 'rheumatic' in text and 'carditis' in text:
            return "19. Cardiovascular System", "146. Rheumatic Fever"
        elif 'henoch' in text or 'schonlein' in text:
            return "15. Rheumatic Diseases", "87. Henoch-Schonlein Purpura"
        elif 'kawasaki' in text:
            return "15. Rheumatic Diseases", "88. Kawasaki Disease"
        elif 'jia' in text or 'juvenile idiopathic arthritis' in text or 'juvenile rheumatoid' in text:
            return "15. Rheumatic Diseases", "89. Juvenile Idiopathic Arthritis"
        elif 'lupus' in text:
            return "15. Rheumatic Diseases", "90. Systemic Lupus Erythematosus"
        elif 'dermatomyositis' in text:
            return "15. Rheumatic Diseases", "91. Juvenile Dermatomyositis"
        elif 'rheumatic' in text and 'prophylaxis' in text:
            return "15. Rheumatic Diseases", "86. Rheumatic Assessment"
    
    # SECTION 16: Infectious Diseases
    if any(word in text for word in ['infectious', 'immunization', 'vaccine', 'vaccination', 'prophylaxis', 'antibiotics', 'antimicrobial', 'fever', 'rash', 'meningitis', 'encephalitis', 'pharyngitis', 'sinusitis', 'otitis', 'croup', 'pertussis', 'bronchiolitis', 'pneumonia', 'endocarditis', 'gastroenteritis', 'hepatitis', 'urinary tract infection', 'uti', 'vulvovaginitis', 'sexually transmitted', 'sti', 'osteomyelitis', 'arthritis', 'ocular infection', 'immunocompromised', 'zoonosis', 'parasitic', 'tuberculosis', 'tb', 'hiv', 'aids', 'malaria', 'dengue', 'typhoid', 'measles', 'mumps', 'rubella', 'varicella', 'chickenpox', 'polio', 'poliomyelitis', 'diphtheria', 'tetanus', 'pertussis', 'whooping cough', 'meningococcal', 'pneumococcal', 'hemophilus', 'rotavirus', 'influenza', 'leptospirosis', 'scrub typhus', 'mycoplasma', 'fungal', 'viral', 'bacterial', 'protozoal']):
        if 'immunization' in text or 'vaccine' in text or 'vaccination' in text or 'prophylaxis' in text:
            if 'rheumatic' in text:
                return "15. Rheumatic Diseases", "86. Rheumatic Assessment"
            elif 'varicella' in text:
                return "16. Infectious Diseases", "94. Immunization and Prophylaxis"
            elif 'rotavirus' in text:
                return "16. Infectious Diseases", "94. Immunization and Prophylaxis"
            elif 'pneumocystis' in text:
                return "16. Infectious Diseases", "120. Infection in the Immunocompromised Person"
            else:
                return "16. Infectious Diseases", "94. Immunization and Prophylaxis"
        elif 'meningitis' in text:
            if 'tubercular' in text or 'tb' in text:
                return "16. Infectious Diseases", "124. Tuberculosis"
            else:
                return "16. Infectious Diseases", "100. Meningitis"
        elif 'encephalitis' in text:
            return "16. Infectious Diseases", "101. Encephalitis"
        elif 'pharyngitis' in text or 'strep' in text or 'sore throat' in text:
            return "16. Infectious Diseases", "103. Pharyngitis"
        elif 'sinusitis' in text:
            return "16. Infectious Diseases", "104. Sinusitis"
        elif 'otitis media' in text:
            return "16. Infectious Diseases", "105. Otitis Media"
        elif 'otitis externa' in text:
            return "16. Infectious Diseases", "106. Otitis Externa"
        elif 'croup' in text:
            return "16. Infectious Diseases", "107. Croup"
        elif 'pertussis' in text or 'whooping' in text:
            return "16. Infectious Diseases", "108. Pertussis"
        elif 'bronchiolitis' in text:
            return "16. Infectious Diseases", "109. Bronchiolitis"
        elif 'pneumonia' in text or 'pneumococcal' in text or 'mycoplasma' in text:
            if 'hiv' in text or 'pneumocystis' in text:
                return "16. Infectious Diseases", "125. HIV and AIDS"
            elif 'atypical' in text:
                return "16. Infectious Diseases", "110. Pneumonia"
            else:
                return "16. Infectious Diseases", "110. Pneumonia"
        elif 'endocarditis' in text:
            return "16. Infectious Diseases", "111. Infective Endocarditis"
        elif 'gastroenteritis' in text or 'diarrhea' in text or 'diarrhoea' in text:
            return "16. Infectious Diseases", "112. Acute Gastroenteritis"
        elif 'hepatitis' in text:
            return "16. Infectious Diseases", "113. Viral Hepatitis"
        elif 'urinary tract' in text or 'uti' in text or 'pyelonephritis' in text or 'cystitis' in text:
            return "16. Infectious Diseases", "114. Urinary Tract Infection"
        elif 'vulvovaginitis' in text:
            return "16. Infectious Diseases", "115. Vulvovaginitis"
        elif 'sexually transmitted' in text or 'sti' in text or 'std' in text:
            return "16. Infectious Diseases", "116. Sexually Transmitted Infections"
        elif 'osteomyelitis' in text:
            return "16. Infectious Diseases", "117. Osteomyelitis"
        elif 'arthritis' in text and 'infectious' in text:
            return "16. Infectious Diseases", "118. Infectious Arthritis"
        elif 'ocular' in text and 'infection' in text:
            return "16. Infectious Diseases", "119. Ocular Infections"
        elif 'immunocompromised' in text or 'opportunistic' in text or 'pneumocystis' in text:
            return "16. Infectious Diseases", "120. Infection in the Immunocompromised Person"
        elif 'zoonosis' in text or 'vector' in text or 'leptospirosis' in text or 'scrub typhus' in text:
            return "16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"
        elif 'parasitic' in text or 'parasite' in text or 'malaria' in text or 'pinworm' in text or 'enterobius' in text or 'helminth' in text:
            return "16. Infectious Diseases", "123. Parasitic Diseases"
        elif 'tuberculosis' in text or 'tb' in text or 'mantoux' in text or 'bcg' in text:
            return "16. Infectious Diseases", "124. Tuberculosis"
        elif 'hiv' in text or 'aids' in text:
            return "16. Infectious Diseases", "125. HIV and AIDS"
        elif 'fever' in text and 'rash' in text:
            return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
        elif 'fever' in text and 'focus' in text:
            return "16. Infectious Diseases", "96. Fever Without a Focus"
        elif 'fever' in text and 'without' in text:
            return "16. Infectious Diseases", "96. Fever Without a Focus"
        elif 'rash' in text and ('infection' in text or 'viral' in text or 'exanthem' in text):
            return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
        elif 'cutaneous' in text and 'infection' in text:
            return "16. Infectious Diseases", "98. Cutaneous Infections"
        elif 'lymphadenopathy' in text or 'lymph node' in text:
            return "16. Infectious Diseases", "99. Lymphadenopathy"
        elif 'measles' in text or 'mumps' in text or 'rubella' in text or 'varicella' in text or 'chickenpox' in text or 'polio' in text or 'poliomyelitis' in text or 'diphtheria' in text or 'tetanus' in text or 'pertussis' in text:
            if 'measles' in text:
                return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
            elif 'polio' in text or 'poliomyelitis' in text:
                return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
            elif 'varicella' in text or 'chickenpox' in text:
                return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
            else:
                return "16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"
        elif 'dengue' in text:
            return "16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"
        elif 'snake' in text or 'envenomation' in text or 'scorpion' in text:
            return "16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"
        elif 'malaria' in text:
            return "16. Infectious Diseases", "123. Parasitic Diseases"
        elif 'influenza' in text or 'flu' in text:
            return "16. Infectious Diseases", "102. Upper Respiratory Tract Infection"
        elif 'upper respiratory' in text or 'cold' in text or 'coryza' in text:
            return "16. Infectious Diseases", "102. Upper Respiratory Tract Infection"
        elif 'antiinfective' in text or 'antibiotic' in text or 'antimicrobial' in text:
            return "16. Infectious Diseases", "95. Antiinfective Therapy"
        else:
            return "16. Infectious Diseases", "93. Infectious Disease Assessment"
    
    # SECTION 17: Digestive System
    if any(word in text for word in ['digestive', 'oral cavity', 'esophagus', 'stomach', 'intestinal', 'liver', 'hepatic', 'pancreatic', 'peritonitis', 'gastroesophageal', 'gerd', 'constipation', 'diarrhea', 'diarrhoea', 'malabsorption', 'celiac', 'crohn', 'ulcerative', 'bilirubin', 'jaundice', 'hepatitis', 'cirrhosis', 'portal', 'biliary', 'cholestasis', 'pancreatitis', 'appendicitis', 'intussusception', 'volvulus', 'hirschsprung', 'imperforate anus', 'cleft lip', 'cleft palate']):
        if 'oral' in text and 'cavity' in text:
            return "17. Digestive System", "127. Oral Cavity"
        elif 'esophagus' in text or 'stomach' in text or 'gerd' in text or 'gastroesophageal' in text:
            return "17. Digestive System", "128. Esophagus and Stomach"
        elif 'intestinal' in text or 'intestine' in text or 'bowel' in text or 'constipation' in text or 'diarrhea' in text or 'diarrhoea' in text or 'malabsorption' in text or 'celiac' in text or 'crohn' in text or 'ulcerative' in text or 'intussusception' in text or 'volvulus' in text or 'hirschsprung' in text:
            return "17. Digestive System", "129. Intestinal Tract"
        elif 'liver' in text or 'hepatic' in text or 'bilirubin' in text or 'jaundice' in text or 'hepatitis' in text or 'cirrhosis' in text or 'portal' in text or 'biliary' in text or 'cholestasis' in text or 'enterohepatic' in text:
            return "17. Digestive System", "130. Liver Disease"
        elif 'pancreatic' in text or 'pancreas' in text or 'pancreatitis' in text:
            return "17. Digestive System", "131. Pancreatic Disease"
        elif 'peritonitis' in text:
            return "17. Digestive System", "132. Peritonitis"
        elif 'cleft' in text and ('lip' in text or 'palate' in text):
            return "17. Digestive System", "127. Oral Cavity"
        elif 'digestive' in text or 'gastrointestinal' in text or 'gi' in text:
            return "17. Digestive System", "126. Digestive System Assessment"
    
    # SECTION 18: Respiratory System
    if any(word in text for word in ['respiratory', 'breathing', 'airway', 'obstruction', 'lung', 'parenchymal', 'pulmonary', 'cystic fibrosis', 'chest wall', 'pleura', 'pneumothorax', 'hemothorax', 'empyema', 'bronchiectasis', 'pneumonia', 'bronchitis', 'asthma', 'wheezing', 'stridor', 'apnea', 'sudden infant death', 'sids', 'respiratory distress', 'surfactant', 'hyaline membrane', 'meconium aspiration', 'persistent pulmonary', 'pphtn', 'diaphragmatic hernia', 'tracheoesophageal', 'choanal atresia', 'micrognathia', 'laryngomalacia', 'tracheomalacia', 'subglottic', 'epiglottitis', 'foreign body', 'bronchiolitis', 'croup', 'pertussis', 'tuberculosis', 'sarcoidosis', 'interstitial']):
        if 'control of breathing' in text or 'apnea' in text or 'sids' in text:
            return "18. Respiratory System", "134. Control of Breathing"
        elif 'upper airway' in text or 'obstruction' in text or 'choanal' in text or 'micrognathia' in text or 'laryngomalacia' in text or 'tracheomalacia' in text or 'subglottic' in text or 'epiglottitis' in text or 'foreign body' in text or 'stridor' in text:
            return "18. Respiratory System", "135. Upper Airway Obstruction"
        elif 'lower airway' in text or 'parenchymal' in text or 'pulmonary' in text or 'lung' in text or 'pneumonia' in text or 'bronchitis' in text or 'bronchiolitis' in text or 'wheezing' in text or 'asthma' in text or 'bronchiectasis' in text or 'tuberculosis' in text or 'sarcoidosis' in text or 'interstitial' in text:
            if 'asthma' in text:
                return "14. Allergy", "78. Asthma"
            elif 'croup' in text:
                return "16. Infectious Diseases", "107. Croup"
            elif 'bronchiolitis' in text:
                return "16. Infectious Diseases", "109. Bronchiolitis"
            elif 'pertussis' in text:
                return "16. Infectious Diseases", "108. Pertussis"
            elif 'pneumonia' in text and 'hiv' not in text and 'pneumocystis' not in text:
                return "16. Infectious Diseases", "110. Pneumonia"
            elif 'tuberculosis' in text:
                return "16. Infectious Diseases", "124. Tuberculosis"
            else:
                return "18. Respiratory System", "136. Lower Airway, Parenchymal, and Pulmonary Vascular Diseases"
        elif 'cystic fibrosis' in text:
            return "18. Respiratory System", "137. Cystic Fibrosis"
        elif 'chest wall' in text or 'pleura' in text or 'pneumothorax' in text or 'hemothorax' in text or 'empyema' in text:
            return "18. Respiratory System", "138. Chest Wall and Pleura"
        elif 'respiratory' in text:
            return "18. Respiratory System", "133. Respiratory System Assessment"
    
    # SECTION 19: Cardiovascular System
    if any(word in text for word in ['cardiovascular', 'heart', 'syncope', 'chest pain', 'dysrhythmia', 'arrhythmia', 'congenital heart', 'cyanotic', 'acyanotic', 'heart failure', 'cardiac', 'rheumatic fever', 'cardiomyopathy', 'pericarditis', 'myocarditis', 'endocarditis', 'hypertension', 'bp', 'blood pressure', 'murmur', 'patent ductus', 'pda', 'atrial septal', 'asd', 'ventricular septal', 'vsd', 'tetralogy', 'tof', 'fallot', 'transposition', 'tga', 'coarctation', 'aortic stenosis', 'pulmonary stenosis', 'hypoplastic', 'ebstein', 'total anomalous', 'tapvr', 'truncus arteriosus', 'single ventricle']):
        if 'syncope' in text:
            return "19. Cardiovascular System", "140. Syncope"
        elif 'chest pain' in text:
            return "19. Cardiovascular System", "141. Chest Pain"
        elif 'dysrhythmia' in text or 'arrhythmia' in text:
            return "19. Cardiovascular System", "142. Dysrhythmias"
        elif 'congenital heart' in text or 'acyanotic' in text or 'cyanotic' in text or 'tetralogy' in text or 'tof' in text or 'fallot' in text or 'transposition' in text or 'tga' in text or 'coarctation' in text or 'aortic stenosis' in text or 'pulmonary stenosis' in text or 'hypoplastic' in text or 'ebstein' in text or 'tapvr' in text or 'truncus' in text or 'single ventricle' in text or 'vsd' in text or 'asd' in text or 'pda' in text or 'patent ductus' in text:
            if 'cyanotic' in text or 'tetralogy' in text or 'tof' in text or 'fallot' in text or 'transposition' in text or 'tga' in text or 'truncus' in text or 'single ventricle' in text or 'hypoplastic' in text or 'ebstein' in text:
                return "19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"
            else:
                return "19. Cardiovascular System", "143. Acyanotic Congenital Heart Disease"
        elif 'heart failure' in text or 'cardiac failure' in text or 'congestive' in text:
            return "19. Cardiovascular System", "145. Heart Failure"
        elif 'rheumatic fever' in text:
            return "19. Cardiovascular System", "146. Rheumatic Fever"
        elif 'cardiomyopathy' in text:
            return "19. Cardiovascular System", "147. Cardiomyopathies"
        elif 'pericarditis' in text or 'myocarditis' in text:
            return "19. Cardiovascular System", "148. Pericarditis"
        elif 'endocarditis' in text and 'infective' in text:
            return "16. Infectious Diseases", "111. Infective Endocarditis"
        elif 'hypertension' in text or 'bp' in text or 'blood pressure' in text:
            return "22. Nephrology and Urology", "166. Hypertension"
        elif 'murmur' in text or 'cardiac' in text or 'heart' in text:
            return "19. Cardiovascular System", "139. Cardiovascular System Assessment"
        elif 'cardiovascular' in text:
            return "19. Cardiovascular System", "139. Cardiovascular System Assessment"
    
    # SECTION 20: Hematology
    if any(word in text for word in ['hematology', 'anemia', 'hemolytic', 'hemoglobin', 'hematocrit', 'rbc', 'red blood cell', 'wbc', 'white blood cell', 'platelet', 'thrombocytopenia', 'thrombocytosis', 'coagulation', 'bleeding', 'hemophilia', 'von willebrand', 'disseminated intravascular', 'dic', 'thrombosis', 'transfusion', 'blood component', 'iron deficiency', 'megaloblastic', 'b12', 'folate', 'thalassemia', 'sickle cell', 'g6pd', 'hereditary spherocytosis', 'aplastic', 'bone marrow', 'leukemia', 'lymphoma']):
        if 'anemia' in text or 'iron deficiency' in text or 'megaloblastic' in text or 'b12' in text or 'folate' in text or 'thalassemia' in text or 'sickle' in text or 'g6pd' in text or 'hereditary spherocytosis' in text or 'aplastic' in text or 'hemolytic' in text:
            if 'microcytic' in text or 'hypochromic' in text or 'iron deficiency' in text:
                return "20. Hematology", "150. Anemia"
            elif 'hemolytic' in text and 'uremic' not in text:
                return "20. Hematology", "150. Anemia"
            elif 'thalassemia' in text:
                return "20. Hematology", "150. Anemia"
            elif 'peripheral smear' in text and 'iron' in text:
                return "20. Hematology", "150. Anemia"
            else:
                return "20. Hematology", "150. Anemia"
        elif 'bleeding' in text or 'coagulation' in text or 'hemophilia' in text or 'von willebrand' in text or 'dic' in text or 'thrombocytopenia' in text or 'thrombosis' in text:
            return "20. Hematology", "151. Hemostatic Disorders"
        elif 'transfusion' in text or 'blood component' in text:
            return "20. Hematology", "152. Blood Component Therapy"
        elif 'leukemia' in text or 'lymphoma' in text:
            return "21. Oncology", "155. Leukemia"
        elif 'hematology' in text:
            return "20. Hematology", "149. Hematology Assessment"
    
    # SECTION 21: Oncology
    if any(word in text for word in ['oncology', 'cancer', 'tumor', 'tumour', 'neoplasm', 'malignancy', 'leukemia', 'lymphoma', 'hodgkin', 'non-hodgkin', 'brain tumor', 'cns tumor', 'neuroblastoma', 'nephroblastoma', 'wilms', 'sarcoma', 'osteosarcoma', 'ewing', 'rhabdomyosarcoma', 'retinoblastoma', 'hepatoblastoma', 'germ cell', 'lymphadenopathy']):
        if 'leukemia' in text:
            return "21. Oncology", "155. Leukemia"
        elif 'lymphoma' in text or 'hodgkin' in text:
            return "21. Oncology", "156. Lymphoma"
        elif 'brain' in text or 'cns' in text or 'central nervous system' in text:
            return "21. Oncology", "157. Central Nervous System Tumors"
        elif 'neuroblastoma' in text:
            return "21. Oncology", "158. Neuroblastoma"
        elif 'wilms' in text or 'nephroblastoma' in text:
            return "21. Oncology", "159. Wilms Tumor"
        elif 'sarcoma' in text or 'osteosarcoma' in text or 'ewing' in text or 'rhabdomyosarcoma' in text:
            return "21. Oncology", "160. Sarcomas"
        elif 'oncology' in text or 'cancer' in text or 'tumor' in text or 'neoplasm' in text:
            if 'assessment' in text or 'principles' in text:
                return "21. Oncology", "153. Oncology Assessment"
            else:
                return "21. Oncology", "153. Oncology Assessment"
    
    # SECTION 22: Nephrology and Urology
    if any(word in text for word in ['nephrology', 'urology', 'kidney', 'renal', 'nephrotic', 'nephritis', 'glomerulonephritis', 'hematuria', 'proteinuria', 'hemolytic uremic', 'hus', 'acute renal', 'chronic renal', 'dialysis', 'transplant', 'hypertension', 'vesicoureteral', 'vur', 'urinary tract', 'uti', 'bladder', 'ureter', 'urethra', 'hydronephrosis', 'polycystic', 'multicystic', 'renal dysplasia', 'renal agenesis', 'horseshoe', 'wilms', 'nephroblastoma', 'cryptorchidism', 'undescended', 'hydrocele', 'inguinal hernia', 'hypospadias', 'epispadias', 'ambiguous genitalia', 'testicular', 'ovarian', 'vulvovaginitis', 'enuresis', 'urinary', 'voiding', 'circumcision', 'phimosis', 'paraphimosis']):
        if 'nephrotic' in text or 'proteinuria' in text:
            return "22. Nephrology and Urology", "162. Nephrotic Syndrome and Proteinuria"
        elif 'glomerulonephritis' in text or 'hematuria' in text:
            return "22. Nephrology and Urology", "163. Glomerulonephritis and Hematuria"
        elif 'hemolytic uremic' in text or 'hus' in text:
            return "22. Nephrology and Urology", "164. Hemolytic Uremic Syndrome"
        elif 'acute renal' in text or 'chronic renal' in text or 'dialysis' in text or 'transplant' in text:
            return "22. Nephrology and Urology", "165. Acute and Chronic Renal Failure"
        elif 'hypertension' in text:
            return "22. Nephrology and Urology", "166. Hypertension"
        elif 'vesicoureteral' in text or 'vur' in text:
            return "22. Nephrology and Urology", "167. Vesicoureteral Reflux"
        elif 'congenital' in text and ('urinary' in text or 'kidney' in text or 'renal' in text or 'ureter' in text or 'bladder' in text or 'urethra' in text):
            return "22. Nephrology and Urology", "168. Congenital and Developmental Abnormalities of the Urinary Tract"
        elif 'urinary tract' in text or 'uti' in text or 'pyelonephritis' in text or 'cystitis' in text:
            return "16. Infectious Diseases", "114. Urinary Tract Infection"
        elif 'cryptorchidism' in text or 'undescended' in text or 'hydrocele' in text or 'inguinal' in text or 'hypospadias' in text or 'epispadias' in text or 'ambiguous' in text or 'testicular' in text or 'ovarian' in text or 'vulvovaginitis' in text or 'enuresis' in text or 'voiding' in text or 'circumcision' in text or 'phimosis' in text or 'paraphimosis' in text:
            return "22. Nephrology and Urology", "169. Other Urinary Tract and Genital Disorders"
        elif 'nephrology' in text or 'urology' in text or 'kidney' in text or 'renal' in text:
            return "22. Nephrology and Urology", "161. Nephrology and Urology Assessment"
    
    # SECTION 23: Endocrinology
    if any(word in text for word in ['endocrinology', 'diabetes', 'hypoglycemia', 'short stature', 'puberty', 'thyroid', 'parathyroid', 'bone mineral', 'sexual development', 'adrenal', 'cushing', 'addison', 'congenital adrenal', 'cah', 'precocious', 'delayed', 'growth hormone', 'gh', 'insulin', 'glucose', 'diabetic ketoacidosis', 'dkd', 'hyperthyroidism', 'hypothyroidism', 'goiter', 'hyperparathyroidism', 'hypoparathyroidism', 'rickets', 'osteoporosis', 'vitamin d', 'calcium', 'phosphate', 'turner', 'klinefelter', 'ambiguous genitalia', 'disorders of sex', 'dsd', 'polycystic ovary', 'pcos', 'hirsutism', 'virilization', 'pheochromocytoma', 'neuroblastoma']):
        if 'diabetes' in text or 'insulin' in text or 'glucose' in text or 'dkd' in text or 'diabetic ketoacidosis' in text:
            return "23. Endocrinology", "171. Diabetes Mellitus"
        elif 'hypoglycemia' in text:
            return "23. Endocrinology", "172. Hypoglycemia"
        elif 'short stature' in text or 'growth hormone' in text or 'gh' in text:
            return "23. Endocrinology", "173. Short Stature"
        elif 'puberty' in text or 'precocious' in text or 'delayed' in text:
            return "23. Endocrinology", "174. Disorders of Puberty"
        elif 'thyroid' in text or 'hyperthyroidism' in text or 'hypothyroidism' in text or 'goiter' in text:
            return "23. Endocrinology", "175. Thyroid Disease"
        elif 'parathyroid' in text or 'hyperparathyroidism' in text or 'hypoparathyroidism' in text or 'bone mineral' in text or 'vitamin d' in text or 'calcium' in text or 'phosphate' in text:
            if 'rickets' in text:
                return "23. Endocrinology", "176. Disorders of Parathyroid Bone and Mineral Endocrinology"
            else:
                return "23. Endocrinology", "176. Disorders of Parathyroid Bone and Mineral Endocrinology"
        elif 'sexual development' in text or 'ambiguous' in text or 'dsd' in text or 'disorders of sex' in text:
            return "23. Endocrinology", "177. Disorders of Sexual Development"
        elif 'adrenal' in text or 'cushing' in text or 'addison' in text or 'cah' in text or 'congenital adrenal' in text or 'pheochromocytoma' in text:
            return "23. Endocrinology", "178. Adrenal Gland Dysfunction"
        elif 'endocrinology' in text:
            return "23. Endocrinology", "170. Endocrinology Assessment"
    
    # SECTION 24: Neurology
    if any(word in text for word in ['neurology', 'headache', 'migraine', 'seizure', 'convulsion', 'febrile seizure', 'epilepsy', 'status epilepticus', 'weakness', 'hypotonia', 'ataxia', 'movement disorder', 'altered mental status', 'consciousness', 'coma', 'neurodegenerative', 'neurocutaneous', 'congenital malformation', 'cns', 'brain', 'spinal cord', 'meningitis', 'encephalitis', 'cerebral palsy', 'hydrocephalus', 'microcephaly', 'macrocephaly', 'neural tube', 'spina bifida', 'anencephaly', 'encephalocele', 'arnold-chiari', 'craniosynostosis', 'dandy-walker', 'holoprosencephaly', 'lissencephaly', 'polymicrogyria', 'agenesis', 'corpus callosum', 'tethered', 'syringomyelia', 'neurofibromatosis', 'tuberous sclerosis', 'sturge-weber', 'ataxia telangiectasia', 'von hippel-lindau', 'neurodegenerative', 'leukodystrophy', 'lysosomal', 'peroxisomal', 'mitochondrial', 'alpers', 'rett', 'angelman', 'prader-willi', 'smith-magenis', 'williams', 'down', 'fragile x']):
        if 'headache' in text or 'migraine' in text:
            return "24. Neurology", "180. Headache and Migraine"
        elif 'seizure' in text or 'convulsion' in text or 'epilepsy' in text or 'status epilepticus' in text:
            if 'febrile' in text:
                return "24. Neurology", "181. Seizures"
            else:
                return "24. Neurology", "181. Seizures"
        elif 'weakness' in text or 'hypotonia' in text:
            return "24. Neurology", "182. Weakness and Hypotonia"
        elif 'ataxia' in text or 'movement disorder' in text or 'chorea' in text or 'dystonia' in text or 'tremor' in text:
            return "24. Neurology", "183. Ataxia and Movement Disorders"
        elif 'altered mental status' in text or 'consciousness' in text or 'coma' in text or 'encephalopathy' in text:
            if 'hepatic' in text or 'metabolic' in text:
                return "24. Neurology", "184. Altered Mental Status"
            else:
                return "24. Neurology", "184. Altered Mental Status"
        elif 'neurodegenerative' in text or 'leukodystrophy' in text or 'alpers' in text or 'rett' in text:
            return "24. Neurology", "185. Neurodegenerative Disorders"
        elif 'neurocutaneous' in text or 'neurofibromatosis' in text or 'tuberous sclerosis' in text or 'sturge-weber' in text or 'ataxia telangiectasia' in text or 'von hippel-lindau' in text:
            return "24. Neurology", "186. Neurocutaneous Disorders"
        elif 'congenital malformation' in text or 'hydrocephalus' in text or 'microcephaly' in text or 'macrocephaly' in text or 'neural tube' in text or 'spina bifida' in text or 'anencephaly' in text or 'encephalocele' in text or 'arnold-chiari' in text or 'craniosynostosis' in text or 'dandy-walker' in text or 'holoprosencephaly' in text or 'lissencephaly' in text or 'polymicrogyria' in text or 'agenesis' in text or 'corpus callosum' in text or 'tethered' in text or 'syringomyelia' in text:
            return "24. Neurology", "187. Congenital Malformations of the Central Nervous System"
        elif 'meningitis' in text and 'tubercular' not in text:
            return "16. Infectious Diseases", "100. Meningitis"
        elif 'encephalitis' in text:
            return "16. Infectious Diseases", "101. Encephalitis"
        elif 'cerebral palsy' in text:
            return "24. Neurology", "182. Weakness and Hypotonia"
        elif 'neurology' in text:
            return "24. Neurology", "179. Neurology Assessment"
        elif 'csf' in text or 'spinal cord' in text or 'circle of willis' in text or 'visual pathway' in text or 'cranial nerve' in text:
            return "24. Neurology", "179. Neurology Assessment"
    
    # SECTION 25: Dermatology
    if any(word in text for word in ['dermatology', 'skin', 'acne', 'atopic dermatitis', 'eczema', 'contact dermatitis', 'seborrheic', 'pigmented', 'vascular anomaly', 'hemangioma', 'port wine', 'salmon patch', 'lymphangioma', 'arteriovenous', 'malformation', 'erythema multiforme', 'stevens-johnson', 'toxic epidermal', 'cutaneous infestation', 'scabies', 'lice', 'pediculosis', 'molluscum', 'wart', 'verruca', 'impetigo', 'cellulitis', 'abscess', 'furuncle', 'carbuncle', 'staphylococcal', 'streptococcal', 'tinea', 'candidiasis', 'diaper dermatitis', 'intertrigo', 'psoriasis', 'ichthyosis', 'epidermolysis', 'bullosa', 'urticaria', 'angioedema', 'anaphylaxis']):
        if 'acne' in text:
            return "25. Dermatology", "189. Acne"
        elif 'atopic dermatitis' in text or 'eczema' in text:
            return "25. Dermatology", "190. Atopic Dermatitis"
        elif 'contact dermatitis' in text:
            return "25. Dermatology", "191. Contact Dermatitis"
        elif 'seborrheic' in text:
            return "25. Dermatology", "192. Seborrheic Dermatitis"
        elif 'pigmented' in text or 'nevus' in text or 'mole' in text or 'cafe au lait' in text or 'mongolian' in text:
            return "25. Dermatology", "193. Pigmented Lesions"
        elif 'vascular' in text or 'hemangioma' in text or 'port wine' in text or 'salmon patch' in text or 'lymphangioma' in text or 'arteriovenous' in text or 'malformation' in text:
            return "25. Dermatology", "194. Vascular Anomalies"
        elif 'erythema multiforme' in text or 'stevens-johnson' in text or 'toxic epidermal' in text:
            return "25. Dermatology", "195. Erythema Multiforme, Stevens-Johnson Syndrome, and Toxic Epidermal Necrolysis"
        elif 'cutaneous infestation' in text or 'scabies' in text or 'lice' in text or 'pediculosis' in text:
            return "25. Dermatology", "196. Cutaneous Infestations"
        elif 'skin' in text or 'dermatology' in text or 'rash' in text or 'lesion' in text:
            return "25. Dermatology", "188. Dermatology Assessment"
    
    # SECTION 26: Orthopedics
    if any(word in text for word in ['orthopedics', 'fracture', 'hip', 'lower extremity', 'knee', 'foot', 'spine', 'upper extremity', 'bone tumor', 'cystic lesion', 'clubfoot', 'talipes', 'developmental dysplasia', 'ddh', 'congenital hip', 'scoliosis', 'kyphosis', 'lordosis', 'spondylolysis', 'spondylolisthesis', 'torticollis', 'plagiocephaly', 'brachial plexus', 'erb', 'klumpke', 'limb deficiency', 'amputation', 'osteomyelitis', 'septic arthritis', 'rheumatoid', 'jra', 'jia', 'slipped capital', 'scfe', 'legg-calve', 'perthes', 'osgood', 'scheuermann', 'blount', 'rickets', 'scurvy', 'osteogenesis', 'achondroplasia', 'mucopolysaccharidosis', 'marfan', 'ehlers-danlos', 'osteoporosis', 'osteopenia', 'rickets', 'scurvy', ' slipped']):
        if 'fracture' in text:
            return "26. Orthopedics", "198. Fractures"
        elif 'hip' in text or 'ddh' in text or 'congenital hip' in text or 'developmental dysplasia' in text:
            return "26. Orthopedics", "199. Hip"
        elif 'lower extremity' in text or 'knee' in text or 'leg' in text or 'foot' in text or 'clubfoot' in text or 'talipes' in text:
            return "26. Orthopedics", "200. Lower Extremity and Knee"
        elif 'spine' in text or 'scoliosis' in text or 'kyphosis' in text or 'lordosis' in text or 'spondylolysis' in text or 'spondylolisthesis' in text:
            return "26. Orthopedics", "202. Spine"
        elif 'upper extremity' in text or 'arm' in text or 'hand' in text or 'brachial plexus' in text or 'erb' in text:
            return "26. Orthopedics", "203. Upper Extremity"
        elif 'bone tumor' in text or 'cystic lesion' in text or 'unicameral' in text or 'aneurysmal' in text or 'eosinophilic' in text or 'osteoid' in text or 'enchondroma' in text:
            return "26. Orthopedics", "204. Benign Bone Tumors and Cystic Lesions"
        elif 'orthopedics' in text or 'musculoskeletal' in text or 'bone' in text or 'joint' in text or 'limb' in text:
            return "26. Orthopedics", "197. Orthopedics Assessment"
    
    # Default fallback
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
for section, count in sorted(summary.items()):
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

for chapter, count in sorted(chapter_summary.items()):
    print(f"  {chapter}: {count}")
