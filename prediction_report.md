# Pediatrics Exam Question Analysis & Prediction Report

**Generated:** 2026-04-30 16:56
**Papers Analyzed:** 24 (2015-2025)
**Total Questions:** 411

> Current codebase note: this is an archival report generated from the earlier 411-question extraction. The live Next.js app now consumes a cleaned 409-question PYQ dataset plus 250 MCQs, 46 structured-answer topics, and five arcade modules.

---

## Top 30 Most Frequently Asked Topics

| Rank | Topic | Times Asked | Total Marks | Years Appeared |
|------|-------|-------------|-------------|----------------|
| 1 | Acute Glomerulonephritis (AGN) | 38 | 258.0 | 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 |
| 2 | LBW / Preterm / Newborn | 22 | 45.0 | 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025 |
| 3 | Diarrhea / Dehydration | 21 | 39.0 | 2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025 |
| 4 | Immunization / Vaccines | 21 | 40.0 | 2015, 2016, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 |
| 5 | Pneumonia / ARI | 20 | 35.0 | 2015, 2016, 2017, 2019, 2020, 2021, 2023, 2025 |
| 6 | Leukemia | 18 | 90.0 | 2015, 2016, 2017, 2021, 2022, 2024, 2025 |
| 7 | ORS | 13 | 24.0 | 2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025 |
| 8 | Anemia | 11 | 30.0 | 2015, 2016, 2017, 2019, 2020, 2023, 2024, 2025 |
| 9 | Epilepsy / Seizures | 11 | 55.0 | 2015, 2016, 2018, 2020, 2021, 2022, 2024 |
| 10 | Measles | 8 | 14.0 | 2016, 2017, 2018, 2020, 2021, 2025 |
| 11 | UTI / VUR | 8 | 15.0 | 2019, 2020, 2022, 2024, 2025 |
| 12 | Rickets | 7 | 20.0 | 2015, 2016, 2019, 2021, 2023, 2024, 2025 |
| 13 | Polio | 7 | 10.0 | 2015, 2016, 2018, 2020, 2022, 2025 |
| 14 | CHD / Congenital Heart Disease | 7 | 15.0 | 2017, 2018, 2021, 2022, 2024, 2025 |
| 15 | Malnutrition | 7 | 48.0 | 2019, 2022, 2023, 2024, 2025 |
| 16 | Breast Feeding | 6 | 16.0 | 2016, 2017, 2019, 2021, 2024 |
| 17 | Meningitis | 6 | 20.0 | 2016, 2017, 2018, 2024, 2025 |
| 18 | Hyperbilirubinemia / Jaundice | 6 | 19.0 | 2018, 2020, 2021, 2023, 2024 |
| 19 | Acute Rheumatic Fever | 5 | 19.0 | 2015, 2018, 2023, 2024, 2025 |
| 20 | Iron Deficiency Anemia | 5 | 9.0 | 2015, 2019, 2020, 2024, 2025 |
| 21 | Dengue | 5 | 15.0 | 2015, 2018, 2019, 2023, 2025 |
| 22 | Thalassemia | 5 | 9.0 | 2016, 2021, 2022, 2024, 2025 |
| 23 | Tuberculosis | 5 | 14.0 | 2017, 2022, 2023, 2024, 2025 |
| 24 | Nephrotic Syndrome | 5 | 21.0 | 2017, 2018, 2019, 2023, 2025 |
| 25 | Asthma | 5 | 17.0 | 2018, 2021, 2022, 2023, 2025 |
| 26 | Poisoning | 5 | 9.0 | 2019, 2022, 2023, 2024 |
| 27 | Down Syndrome | 5 | 18.0 | 2021, 2022, 2024, 2025 |
| 28 | Short Stature | 5 | 19.0 | 2024, 2025 |
| 29 | Acute Flaccid Paralysis (AFP) | 4 | 18.0 | 2015, 2018, 2024, 2025 |
| 30 | Kangaroo Mother Care | 4 | 13.0 | 2017, 2021, 2022, 2025 |

## High-Yield Topics (Appeared in 2023-2025)

| Topic | Total Appearances | Total Marks | Recent Years |
|-------|-------------------|-------------|--------------|
| Acute Glomerulonephritis (AGN) | 38 | 258.0 | 2023, 2024, 2025 |
| LBW / Preterm / Newborn | 22 | 45.0 | 2023, 2024, 2025 |
| Diarrhea / Dehydration | 21 | 39.0 | 2023, 2024, 2025 |
| Immunization / Vaccines | 21 | 40.0 | 2023, 2024, 2025 |
| Pneumonia / ARI | 20 | 35.0 | 2023, 2025 |
| Leukemia | 18 | 90.0 | 2024, 2025 |
| ORS | 13 | 24.0 | 2023, 2024, 2025 |
| Anemia | 11 | 30.0 | 2023, 2024, 2025 |
| Epilepsy / Seizures | 11 | 55.0 | 2024 |
| Measles | 8 | 14.0 | 2025 |
| UTI / VUR | 8 | 15.0 | 2024, 2025 |
| Rickets | 7 | 20.0 | 2023, 2024, 2025 |
| Polio | 7 | 10.0 | 2025 |
| CHD / Congenital Heart Disease | 7 | 15.0 | 2024, 2025 |
| Malnutrition | 7 | 48.0 | 2023, 2024, 2025 |
| Breast Feeding | 6 | 16.0 | 2024 |
| Meningitis | 6 | 20.0 | 2024, 2025 |
| Hyperbilirubinemia / Jaundice | 6 | 19.0 | 2023, 2024 |
| Acute Rheumatic Fever | 5 | 19.0 | 2023, 2024, 2025 |
| Iron Deficiency Anemia | 5 | 9.0 | 2024, 2025 |
| Dengue | 5 | 15.0 | 2023, 2025 |
| Thalassemia | 5 | 9.0 | 2024, 2025 |
| Tuberculosis | 5 | 14.0 | 2023, 2024, 2025 |
| Nephrotic Syndrome | 5 | 21.0 | 2023, 2025 |
| Asthma | 5 | 17.0 | 2023, 2025 |
| Poisoning | 5 | 9.0 | 2023, 2024 |
| Down Syndrome | 5 | 18.0 | 2024, 2025 |
| Short Stature | 5 | 19.0 | 2024, 2025 |
| Acute Flaccid Paralysis (AFP) | 4 | 18.0 | 2024, 2025 |
| Kangaroo Mother Care | 4 | 13.0 | 2025 |

## Topics Not Asked Recently (Potential Comeback)

These topics were popular in older papers but haven't appeared in 2023-2025:

| Topic | Times Asked | Last Appeared |
|-------|-------------|---------------|
| Kwashiorkor | 3 | 2019 |
| Malaria | 3 | 2019 |
| HIV/AIDS | 2 | 2019 |
| Hospital Associated Infections | 2 | 2019 |
| IMNCI / IMCI | 2 | 2018 |
| Cleft Lip/Palate | 2 | 2018 |

## Section-wise Trends

### Essay
- Total Questions: 21
- Total Marks: 210
- Year Distribution: {2015: 2, 2016: 2, 2017: 2, 2018: 2, 2019: 2, 2020: 2, 2021: 2, 2022: 2, 2023: 2, 2024: 2, 2025: 1}

### Short Notes
- Total Questions: 84
- Total Marks: 252
- Year Distribution: {2015: 8, 2016: 8, 2017: 8, 2018: 8, 2019: 8, 2020: 8, 2021: 8, 2022: 8, 2023: 8, 2024: 8, 2025: 4}

### Answer Briefly
- Total Questions: 104
- Total Marks: 208
- Year Distribution: {2015: 9, 2016: 10, 2017: 10, 2018: 10, 2019: 10, 2020: 10, 2021: 10, 2022: 10, 2023: 10, 2024: 10, 2025: 5}

### Draw and Label
- Total Questions: 42
- Total Marks: 84
- Year Distribution: {2015: 4, 2016: 4, 2017: 4, 2018: 4, 2019: 4, 2020: 4, 2021: 4, 2022: 4, 2023: 4, 2024: 4, 2025: 2}

### One Word Answers
- Total Questions: 84
- Total Marks: 84
- Year Distribution: {2015: 8, 2016: 8, 2017: 8, 2018: 8, 2019: 8, 2020: 8, 2021: 8, 2022: 8, 2023: 8, 2024: 8, 2025: 4}

### Long Essays
- Total Questions: 5
- Total Marks: 50
- Year Distribution: {2024: 4, 2025: 1}

### Short Essays
- Total Questions: 16
- Total Marks: 116.0
- Year Distribution: {2024: 10, 2025: 6}

### Short Answers
- Total Questions: 16
- Total Marks: 64.0
- Year Distribution: {2024: 10, 2025: 6}

### Precise Answers
- Total Questions: 20
- Total Marks: 20.0
- Year Distribution: {2024: 20}

### MCQs
- Total Questions: 19
- Total Marks: 19.0
- Year Distribution: {2025: 19}

## Directly Repeated / Similar Questions

### Question (asked 2 times)
*Peripheral smear in iron deficiency anemia*

**Appeared in:**
- 2019 August (2 marks)
- 2025 April (2 marks)

### Question (asked 2 times)
*Congenital hypothyroidism*

**Appeared in:**
- 2020 February (3 marks)
- 2022 September (3 marks)


---

# Prediction for Next Exam

Based on frequency analysis and recent trends (2023-2025), the following topics have the **highest probability** of appearing:

1. **Acute Glomerulonephritis (AGN)** — Asked 38 times (258.0 total marks) | 🔥 HOT
2. **LBW / Preterm / Newborn** — Asked 22 times (45.0 total marks) | 🔥 HOT
3. **Diarrhea / Dehydration** — Asked 21 times (39.0 total marks) | 🔥 HOT
4. **Immunization / Vaccines** — Asked 21 times (40.0 total marks) | 🔥 HOT
5. **Pneumonia / ARI** — Asked 20 times (35.0 total marks) | 🔥 HOT
6. **Leukemia** — Asked 18 times (90.0 total marks) | 🔥 HOT
7. **ORS** — Asked 13 times (24.0 total marks) | 🔥 HOT
8. **Anemia** — Asked 11 times (30.0 total marks) | 🔥 HOT
9. **Epilepsy / Seizures** — Asked 11 times (55.0 total marks) | 🔥 HOT
10. **Measles** — Asked 8 times (14.0 total marks) | 🔥 HOT

## Must-Prepare Topics by Section

### Essay (10 marks)
- Acute Glomerulonephritis (AGN) (17 times)
- Epilepsy / Seizures (4 times)
- Leukemia (4 times)
- Malnutrition (4 times)
- Acute Flaccid Paralysis (AFP) (1 times)

### Long Essays (10-15 marks)
- Acute Glomerulonephritis (AGN) (4 times)
- Leukemia (2 times)
- Anemia (1 times)

### Short Notes / Short Essays / Short Answers
- Acute Glomerulonephritis (AGN) (8 times)
- Leukemia (6 times)
- LBW / Preterm / Newborn (6 times)
- Pneumonia / ARI (4 times)
- Kangaroo Mother Care (4 times)
- Diarrhea / Dehydration (4 times)
- Rickets (3 times)
- Dengue (3 times)
- Nephrotic Syndrome (3 times)
- Breast Feeding (3 times)

### Draw and Label
- Anemia (4 times)
- Iron Deficiency Anemia (3 times)
- Rickets (3 times)
- CHD / Congenital Heart Disease (2 times)
- Asthma (2 times)

### One Word / Precise Answers
- Pneumonia / ARI (8 times)
- Diarrhea / Dehydration (7 times)
- LBW / Preterm / Newborn (6 times)
- Immunization / Vaccines (6 times)
- ORS (4 times)

---

> **Disclaimer:** This analysis is based on pattern recognition from previous papers. KUHS may change the syllabus or question patterns. Always study the full syllabus.
