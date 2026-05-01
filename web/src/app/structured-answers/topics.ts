export interface TopicSection {
  title: string;
  text?: string;
  list?: string[];
  table?: { headers: string[]; rows: string[][] };
  flowchart?: {
    nodes: { id: string; label: string; type?: 'default' | 'decision' | 'start' | 'end' }[];
    edges: { from: string; to: string; label?: string }[];
  };
  mnemonic?: { title: string; text: string };
}

export interface HistoricalFrequency {
  appearances: number;
  papersAnalyzed: number;
  lastAppeared: string;
}

export interface Topic {
  id: string;
  shortTitle: string;
  patternStrength: 'Strong' | 'Moderate' | 'Emerging';
  historicalFrequency: HistoricalFrequency;
  confidenceNote: string;
  subject: string;
  examType: string;
  question: string;
  marksBreakdown: string;
  sections: TopicSection[];
  checklist?: string[];
  references?: string[];
}

export const topics: Topic[] = [
  {
    id: 'agn',
    shortTitle: 'AGN / PSGN',
    patternStrength: 'Strong',
    historicalFrequency: { appearances: 38, papersAnalyzed: 24, lastAppeared: '2024' },
    confidenceNote: 'Appeared in 38 of 411 questions (9.2%). A core syllabus topic with consistent historical presence, but examiners vary sub-part emphasis.',
    subject: 'Nephrology',
    examType: 'Essay / Short Note',
    question: 'A 3-year-old child is brought with puffiness of face and tea-colored urine 10 days after a sore throat. Discuss the diagnosis, investigations, and management. (2+4+4=10)',
    marksBreakdown: 'Definition & Etiology → 2M | Clinical Features → 2M | Investigations → 2M | Management → 2M | Complications & Prognosis → 2M',
    sections: [
      {
        title: '1. Definition & Etiology',
        text: '<strong>Acute Post-Streptococcal Glomerulonephritis (APSGN)</strong> is the most common form of acute GN in children — an immune complex-mediated disease following infection with <strong>nephritogenic strains</strong> of Group A β-hemolytic Streptococcus.',
        list: [
          '<strong>Agent:</strong> Nephritogenic strains of Group A β-hemolytic Streptococcus',
          '<strong>Trigger:</strong> Pharyngitis (5-21 days, average 10 days) or skin infection/impetigo (3-6 weeks)',
          '<strong>Age:</strong> Peak 2-12 years; more common in boys; rare &lt;2 years',
          '<strong>Pathophysiology:</strong> Streptococcal antigens → immune complex deposition (IgG + C3) in <strong>subepithelial locations</strong> forming <strong>"humps"</strong> on EM → complement activation → neutrophil influx → decreased GFR'
        ],
        flowchart: {
          nodes: [
            { id: 'a', label: 'Strep throat or Skin infection', type: 'start' },
            { id: 'b', label: 'Streptococcal antigen release' },
            { id: 'c', label: 'Immune complex formation (IgG + C3)' },
            { id: 'd', label: 'Subepithelial deposits (lumpy-bumpy GBM)' },
            { id: 'e', label: 'Complement activation (C3 consumption)' },
            { id: 'f', label: 'Glomerular inflammation + neutrophil influx' },
            { id: 'g', label: 'Decreased GFR = Na+ and H2O retention' },
            { id: 'h', label: 'Edema + Hypertension + Oliguria', type: 'end' },
          ],
          edges: [
            { from: 'a', to: 'b' },
            { from: 'b', to: 'c' },
            { from: 'c', to: 'd' },
            { from: 'd', to: 'e' },
            { from: 'e', to: 'f' },
            { from: 'f', to: 'g' },
            { from: 'g', to: 'h' },
          ],
        },
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Classic Triad (Nephritic Syndrome):</strong> Hematuria (smoky/tea-colored, RBC casts pathognomonic), Edema (periorbital, pitting, sudden), Hypertension (salt-water retention)',
          '<strong>Associated:</strong> Oliguria, mild proteinuria (&lt;1 g/day), azotemia (fatigue, nausea, anorexia), fever, flank pain, hypertensive encephalopathy (headache, seizures, papilledema), <strong>CCF/heart failure</strong> (severe HTN + fluid overload)',
        ],
      },
      {
        title: '2A. AGN vs Nephrotic Syndrome — Key Differentiator',
        text: 'The examiner repeatedly tests the ability to distinguish AGN from NS. This comparison table is <strong>high-yield</strong>.',
        table: {
          headers: ['Feature', 'AGN / PSGN', 'Nephrotic Syndrome'],
          rows: [
            ['Hematuria', '<strong>Gross</strong> (smoky/tea-colored)', 'Absent in MCD; microscopic only'],
            ['Proteinuria', 'Mild (&lt;1 g/day)', '<strong>Massive</strong> (&gt;50 mg/kg/day)'],
            ['Edema', 'Mild-moderate, periorbital', '<strong>Severe</strong>, generalized, ascites'],
            ['Hypertension', '<strong>Present</strong>', 'Absent in MCD'],
            ['RBC Casts', '<strong>Present</strong> (pathognomonic)', 'Absent'],
            ['Serum Albumin', 'Normal', '<strong>Low</strong> (&lt;2.5 g/dL)'],
            ['C3 Complement', '<strong>Low</strong>', 'Normal'],
            ['Onset', 'Acute (days after infection)', 'Insidious'],
            ['Age Peak', '5-12 years', '2-6 years'],
          ],
        },
      },
      {
        title: '3. Investigations',
        table: {
          headers: ['Investigation', 'Finding', 'Scoring Value'],
          rows: [
            ['Urine R/E', 'RBCs, RBC casts, mild proteinuria, leukocytes', 'Pathognomonic casts = 1M'],
            ['Blood Urea & Creatinine', 'Elevated (azotemia)', ''],
            ['Serum Electrolytes', 'Hyperkalemia, hyponatremia, metabolic acidosis', ''],
            ['C3 Complement', 'Low (returns to normal in 6-8 weeks)', 'Key differentiator = 1M'],
            ['C4 Complement', 'Normal (vs MPGN where both low)', ''],
            ['ASO Titer', 'Elevated in 70-80% (post-pharyngitis)', ''],
            ['Anti-DNase B', 'Elevated (post-skin infection)', ''],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>General:</strong> Bed rest, salt and fluid restriction (to insensible + urine output). Daily monitoring: BP, weight, strict I/O chart.',
          '<strong>Hypertension:</strong> <strong>First-line: Nifedipine</strong> (calcium channel blocker) oral. <strong>Emergency:</strong> IV Labetalol or Nitroprusside.',
          '<strong>Hyperkalemia:</strong> Calcium gluconate → insulin + glucose → sodium bicarbonate. Dialysis if refractory.',
          '<strong>Fluid overload:</strong> Furosemide 1-2 mg/kg IV.',
          '<strong>Azotemia/AKI:</strong> Dialysis if refractory fluid overload, severe hyperkalemia, or uremic symptoms.',
          '<strong>Strep eradication:</strong> Benzathine Penicillin G <strong>600,000 U IM</strong> (&lt;27 kg) or <strong>1.2 million U IM</strong> (&gt;27 kg) single dose. Alternative: Penicillin V 250 mg PO BD-TDS x 10 days (older children). If allergic: Erythromycin or Azithromycin.',
          '<strong>Negative points:</strong> <strong>NO corticosteroids/immunosuppressants</strong> in APSGN. <strong>ACE inhibitors are NOT first-line</strong> for acute HTN (can worsen hyperkalemia + AKI). <strong>Diuretics are NOT first-line</strong> for HTN (used only for fluid overload).',
        ],
        flowchart: {
          nodes: [
            { id: 'a', label: 'Child with AGN', type: 'start' },
            { id: 'b', label: 'Severity?', type: 'decision' },
            { id: 'c', label: 'Bed rest, salt and fluid restriction, monitoring' },
            { id: 'd', label: 'Hospital admission' },
            { id: 'e', label: 'Penicillin for Strep eradication' },
            { id: 'f', label: 'Diuretics: Furosemide' },
            { id: 'g', label: 'Antihypertensives' },
            { id: 'h', label: 'BP control?', type: 'decision' },
            { id: 'i', label: 'IV Labetalol or Nitroprusside + Seizure management' },
            { id: 'j', label: 'Continue oral therapy' },
            { id: 'k', label: 'Complications?', type: 'decision' },
            { id: 'l', label: 'Calcium gluconate + Insulin-Glucose + Kayexalate' },
            { id: 'm', label: 'Furosemide IV +/- Dialysis' },
            { id: 'n', label: 'Hemodialysis or Peritoneal dialysis' },
            { id: 'o', label: 'Recovery in 1-2 weeks', type: 'end' },
          ],
          edges: [
            { from: 'a', to: 'b' },
            { from: 'b', to: 'c', label: 'Mild' },
            { from: 'b', to: 'd', label: 'Severe' },
            { from: 'd', to: 'e' },
            { from: 'd', to: 'f' },
            { from: 'd', to: 'g' },
            { from: 'g', to: 'h' },
            { from: 'h', to: 'i', label: 'No or Emergency' },
            { from: 'h', to: 'j', label: 'Yes' },
            { from: 'd', to: 'k' },
            { from: 'k', to: 'l', label: 'Hyperkalemia' },
            { from: 'k', to: 'm', label: 'Fluid overload' },
            { from: 'k', to: 'n', label: 'Azotemia' },
            { from: 'c', to: 'o' },
            { from: 'j', to: 'o' },
            { from: 'l', to: 'o' },
            { from: 'm', to: 'o' },
            { from: 'n', to: 'o' },
          ],
        },
      },
      {
        title: '5. Complications & Prognosis',
        list: [
          '<strong>AKI</strong> — reversible; dialysis rarely needed',
          '<strong>Hypertensive encephalopathy</strong> — seizures, papilledema',
          '<strong>CCF / Heart failure</strong> — due to severe HTN + fluid overload',
          '<strong>Acute pulmonary edema</strong> — fluid overload',
          '<strong>CKD</strong> — rare (&lt;1%); consider if crescents on biopsy',
          '<strong>Prognosis:</strong> Excellent; &gt;95% complete recovery. Gross hematuria resolves in 5-10 days. Microscopic hematuria may persist months-years. C3 normalizes by 6-8 weeks. <strong>If C3 remains low &gt;8-12 weeks, suspect MPGN.</strong>',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Confusing AGN with NS — remember: AGN has <strong>hematuria + HTN + low C3</strong>; NS has <strong>massive proteinuria + hypoalbuminemia + no HTN</strong>',
          '<strong>Trap 2:</strong> Using ACE inhibitors as first-line for AGN HTN — <strong>NO</strong>; first-line is <strong>Nifedipine</strong> (CCB). ACEi can worsen hyperkalemia and AKI.',
          '<strong>Trap 3:</strong> Using diuretics for HTN — <strong>NO</strong>; diuretics are only for fluid overload, not HTN control.',
          '<strong>Trap 4:</strong> Prescribing steroids for PSGN — <strong>NO</strong>; therapy is supportive only.',
          '<strong>Trap 5:</strong> Forgetting pediatric penicillin dosing — weight-based: <strong>600K U (&lt;27 kg) or 1.2M U (&gt;27 kg)</strong> IM.',
          '<strong>Trap 6:</strong> Normal C3 + normal C4 + hematuria → think <strong>IgA nephropathy</strong> (not PSGN).',
          '<strong>High-yield:</strong> PSGN can develop <strong>even after antibiotic treatment</strong> of strep infection.',
        ],
      },
    ],
    checklist: [
      'Definition: APSGN — immune complex-mediated, post-streptococcal - <strong>0.5M</strong>',
      'Etiology: Nephritogenic Group A β-hemolytic strep, latent period (pharyngitis 5-21d, skin 3-6w) - <strong>0.5M</strong>',
      'Pathophysiology: Subepithelial immune complex deposits (humps), complement activation, decreased GFR - <strong>1M</strong>',
      'Clinical triad: Hematuria (RBC casts) + Edema + Hypertension; azotemia, CCF risk - <strong>1M</strong>',
      'AGN vs NS comparison table: Hematuria, proteinuria, HTN, C3, albumin - <strong>1M</strong>',
      'Investigations: Urine RBC casts, low C3 (normal C4), high ASO/Anti-DNase B - <strong>0.5M</strong>',
      'General management: Bed rest, salt/fluid restriction, daily monitoring - <strong>0.5M</strong>',
      'HTN management: First-line <strong>Nifedipine</strong>; emergency IV Labetalol/Nitroprusside - <strong>0.5M</strong>',
      'Negative points: NO steroids, NO ACEi as first-line, NO diuretics for HTN - <strong>0.5M</strong>',
      'Complication management: Hyperkalemia, fluid overload, dialysis - <strong>0.5M</strong>',
      'Prognosis: Excellent; C3 normalizes 6-8 weeks; if persistent &gt;8-12 weeks suspect MPGN - <strong>0.5M</strong>',
      'Examiner traps: Distinguish from NS, correct first-line drugs, pediatric dosing - <strong>1M</strong>',
      'Neatness & Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 167: Glomerulonephritis.',
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 168: Nephrotic Syndrome.',
    ],
  },
  {
    id: 'nephrotic',
    shortTitle: 'Nephrotic Syndrome',
    patternStrength: 'Strong',
    historicalFrequency: { appearances: 31, papersAnalyzed: 24, lastAppeared: '2024' },
    confidenceNote: 'Appeared in 31 of 411 questions (7.5%). A syllabus staple frequently tested in essay and short-note formats.',
    subject: 'Nephrology',
    examType: 'Essay / Short Note',
    question: 'A 4-year-old boy presents with periorbital puffiness and frothy urine. On examination, there is pitting edema of the legs and ascites. Discuss the diagnosis, investigations, and management. (2+4+4=10)',
    marksBreakdown: 'Definition & Types → 2M | Clinical Features → 2M | Investigations → 2M | Management → 3M | Complications → 1M',
    sections: [
      {
        title: '1. Definition & Classification',
        text: '<strong>Nephrotic Syndrome (NS)</strong> is defined by nephrotic-range proteinuria (&gt;50 mg/kg/day or urine protein/creatinine ratio <strong>&gt;2.0 mg/mg</strong>), hypoalbuminemia (&lt;2.5 g/dL), hyperlipidemia, and edema.',
        table: {
          headers: ['Type', 'Age', 'Pathology', 'Key Feature'],
          rows: [
            ['Minimal Change Disease (MCD)', '2-6 years (80%)', 'Normal LM; foot process fusion on EM', 'Steroid sensitive; &gt;90% respond within 4 weeks'],
            ['FSGS', 'Any age', 'Segmental sclerosis', 'Steroid resistant; ~35% respond to steroids'],
            ['Membranoproliferative GN (MPGN)', 'Older children', 'Tram-track BM on LM', 'Low C3 + low C4; persistent, high progression risk'],
            ['Membranous Nephropathy', 'Rare in children', 'Subepithelial deposits', 'Secondary (HBV, SLE, drugs)'],
            ['Congenital NS', 'Infants (&lt;3 months)', 'Finnish type (NPHS1), diffuse mesangial sclerosis', 'Steroid resistant; requires early nephrectomy, dialysis, transplant'],
          ],
        },
      },
      {
        title: '2. Clinical Features',
        list: [
          'Edema - periorbital (worse in morning), dependent (legs by evening), ascites, pleural effusion, scrotal edema',
          'Frothy urine - due to massive proteinuria',
          'Weight gain - fluid retention',
          'Anorexia, lethargy, diarrhea - gut edema',
          'Hypovolemia signs - cold peripheries, tachycardia, hypotension (despite edema!)',
          'Infections - loss of IgG and complement factors in urine',
          'Thrombosis - loss of antithrombin III; renal vein thrombosis most common',
        ],
        mnemonic: { title: 'P-E-A-S', text: 'Periorbital (morning) → Extremities (evening) → Ascites → Severe (anasarca, pleural effusion)' },
      },
      {
        title: '3. Investigations',
        table: {
          headers: ['Investigation', 'Expected Finding'],
          rows: [
            ['Urine R/E', 'Massive proteinuria (3-4+); few RBCs; hyaline/fatty casts; oval fat bodies'],
            ['Urine P/C ratio', '<strong>&gt;2.0 mg/mg</strong> = nephrotic-range proteinuria'],
            ['24h Urine Protein', '&gt;50 mg/kg/day'],
            ['Serum Albumin', '&lt;2.5 g/dL (hypoalbuminemia)'],
            ['Serum Cholesterol/TG', 'Elevated (hyperlipidemia)'],
            ['Serum Creatinine', 'Baseline renal function'],
            ['Complements (C3, C4)', 'Normal in MCD; low C3 implies lesion other than MCD — biopsy before steroids'],
            ['Renal Biopsy', '<strong>Indications:</strong> &gt;8 years, SRNS, frequent relapses, atypical onset (&lt;1 or &gt;10 years), persistent hypocomplementemia'],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>General:</strong> Bed rest during edema phase. Normal protein intake (do NOT restrict). <strong>Salt restriction</strong> during edema. Daily weight, BP, urine protein dipstick, I/O chart.',
          '<strong>Edema:</strong> <strong>Loop diuretics</strong> (Furosemide) for severe edema; monitor for hypovolemia.',
          '<strong>Steroid Regimen (First Episode — ISKD Protocol):</strong> Prednisolone <strong>2 mg/kg/day (max 60 mg/day)</strong> x 6 weeks → 1.5 mg/kg alternate days x 6 weeks → taper. <strong>Total 12 weeks for responders</strong> (best long-term results).',
          '<strong>Hypovolemia/Shock:</strong> <strong>25% albumin 0.5-1.0 g/kg</strong> IV over 1-2 hours + IV loop diuretic.',
          '<strong>Infection (SBP/cellulitis):</strong> Ceftriaxone. Vaccinate with Pneumococcal + Varicella. <strong>Organisms:</strong> S. pneumoniae, E. coli, Klebsiella.',
          '<strong>Thrombosis:</strong> LMWH, then warfarin.',
          '<strong>Adjunctive:</strong> <strong>ACE inhibitors</strong> (Enalapril) for persistent HTN/proteinuria. <strong>Spironolactone</strong> (K+-sparing diuretic) may be used cautiously.',
          '<strong>Steroid-Sparing Agents:</strong> Cyclophosphamide 2 mg/kg/day PO x 8-12 weeks (cumulative 168 mg/kg). Cyclosporine 3-5 mg/kg/day. Tacrolimus 0.1 mg/kg/day. MMF 600-1200 mg/m²/day. Rituximab for severe cases.',
        ],
        flowchart: {
          nodes: [
            { id: 'a', label: 'Child with Nephrotic Syndrome', type: 'start' },
            { id: 'b', label: 'First Episode?', type: 'decision' },
            { id: 'c', label: 'Steroid Trial: Prednisolone 2 mg/kg/day x 6 weeks' },
            { id: 'd', label: 'Response?', type: 'decision' },
            { id: 'e', label: 'Steroid Sensitive NS (80% children - MCD)', type: 'end' },
            { id: 'f', label: 'Steroid Resistant NS' },
            { id: 'g', label: 'Renal Biopsy' },
            { id: 'h', label: 'Histology?', type: 'decision' },
            { id: 'i', label: 'Reclassify or Re-trial' },
            { id: 'j', label: 'Calcineurin inhibitors + ACEi' },
            { id: 'k', label: 'Immunosuppression + Treat cause' },
          ],
          edges: [
            { from: 'a', to: 'b' },
            { from: 'b', to: 'c' },
            { from: 'c', to: 'd' },
            { from: 'd', to: 'e', label: 'Remission under 4 weeks' },
            { from: 'd', to: 'f', label: 'No remission' },
            { from: 'f', to: 'g' },
            { from: 'g', to: 'h' },
            { from: 'h', to: 'i', label: 'MCD' },
            { from: 'h', to: 'j', label: 'FSGS' },
            { from: 'h', to: 'k', label: 'MPGN' },
          ],
        },
      },
      {
        title: '5. Complications & Prognosis',
        list: [
          '<strong>Infections:</strong> Spontaneous bacterial peritonitis (S. pneumoniae, E. coli, Klebsiella), cellulitis, sepsis. Loss of IgG, Factor B, properdin.',
          '<strong>Thromboembolism:</strong> Renal vein thrombosis (most common). Loss of antithrombin III, proteins C & S.',
          '<strong>Hypovolemia/AKI:</strong> Acute pre-renal failure. Hypotension, cold peripheries.',
          '<strong>Other:</strong> Growth retardation (chronic steroids), cataracts, osteoporosis, <strong>hypothyroidism</strong> (loss of TBG), <strong>hypocalcemia/tetany</strong> (loss of vitamin D-binding protein).',
          '<strong>Prognosis:</strong> MCD: Excellent; 80% achieve remission with steroids; relapses decrease with age. FSGS: ~35% respond to steroids; 50% progress to ESRD within 10 years.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Confusing NS with AGN — NS has <strong>NO hematuria, NO HTN, normal C3</strong>; AGN has all three.',
          '<strong>Trap 2:</strong> Wrong steroid dose — must specify <strong>2 mg/kg/day (MAX 60 mg/day)</strong>; not 1 mg/kg.',
          '<strong>Trap 3:</strong> Wrong steroid duration — total <strong>12 weeks for responders</strong>, not 6 weeks only.',
          '<strong>Trap 4:</strong> Using ACE inhibitors for <strong>acute</strong> HTN in NS — use CCBs (Amlodipine) first; ACEi is for <strong>persistent</strong> HTN/proteinuria.',
          '<strong>Trap 5:</strong> Forgetting <strong>salt restriction</strong> — as important as steroids for edema control.',
          '<strong>Trap 6:</strong> Protein restriction — <strong>NO</strong>; maintain normal protein intake.',
          '<strong>High-yield:</strong> S. pneumoniae is the #1 organism for SBP in NS — vaccinate!',
          '<strong>High-yield:</strong> Biopsy BEFORE steroids if <strong>low C3, >8 years, or atypical features</strong>.',
        ],
      },
    ],
    checklist: [
      'Definition: Nephrotic-range proteinuria (UPr/Cr &gt;2.0 or &gt;50 mg/kg/day) + hypoalbuminemia + hyperlipidemia + edema - <strong>1M</strong>',
      'Classification: MCD (2-6y, 80%), FSGS, MPGN, Membranous, Congenital NS - <strong>0.5M</strong>',
      'AGN vs NS distinction: No hematuria/HTN/low C3 in typical MCNS - <strong>0.5M</strong>',
      'Clinical: Periorbital edema, frothy urine, ascites, hypovolemia signs - <strong>0.5M</strong>',
      'Investigations: Urine P/C ratio &gt;2.0, low albumin &lt;2.5, high cholesterol, normal C3/C4, renal biopsy indications - <strong>1M</strong>',
      'General management: Bed rest, normal protein (NO restriction), salt restriction, daily monitoring - <strong>0.5M</strong>',
      'Steroid protocol: 2 mg/kg/day (max 60 mg) x 6w → 1.5 mg/kg alt days x 6w; total <strong>12 weeks for responders</strong> - <strong>1M</strong>',
      'Complication Rx: Hypovolemia (25% albumin 0.5-1.0 g/kg + furosemide), infection (ceftriaxone), thrombosis (LMWH) - <strong>1M</strong>',
      'Adjunctive: ACE inhibitors for persistent HTN/proteinuria; loop diuretics for edema; Spironolactone (K+-sparing) - <strong>0.5M</strong>',
      'Prognosis: MCD excellent (80% remission); FSGS ~35% steroid response, 50% ESRD at 10 years - <strong>0.5M</strong>',
      'Examiner traps: Distinguish from AGN, correct steroid dose/duration, no protein restriction - <strong>1M</strong>',
      'Neatness & Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 168: Nephrotic Syndrome.',
    ],
  },
  {
    id: 'rickets',
    shortTitle: 'Rickets',
    patternStrength: 'Strong',
    historicalFrequency: { appearances: 27, papersAnalyzed: 24, lastAppeared: '2024' },
    confidenceNote: 'Appeared in 27 of 411 questions (6.6%). Frequently rephrased but conceptually stable across exam cycles.',
    subject: 'Endocrinology',
    examType: 'Short Note / Essay',
    question: 'A 9-month-old infant is brought with delayed teething, wrist swelling, and bowing of legs. Discuss the biochemical changes, clinical features, radiological findings, and management. (2+3+2+3=10)',
    marksBreakdown: 'Definition & Types → 1M | Biochemical Changes → 2M | Clinical Features → 2M | Radiology → 2M | Management → 2M | Complications → 1M',
    sections: [
      {
        title: '1. Definition',
        text: '<strong>Rickets</strong> is defined as <strong>decreased or defective bone mineralization</strong> in growing children; osteomalacia is the adult equivalent.',
        table: {
          headers: ['Type', 'Mechanism', 'Key Lab'],
          rows: [
            ['Nutritional (Vit D deficient)', 'Inadequate intake / sunlight', '25(OH)D <strong>&lt;8 ng/mL</strong>; low Ca, low PO4, high PTH, high ALP'],
            ['Vit D dependent Type I', 'Renal 1α-hydroxylase deficiency (AR)', '<strong>Normal 25(OH)D</strong>, low 1,25(OH)2D; Rx: Calcitriol'],
            ['Vit D dependent Type II', 'End-organ resistance to Vit D (AR)', 'High 1,25(OH)2D; alopecia common'],
            ['Familial hypophosphatemic (XLH)', 'Renal phosphate wasting (X-linked)', 'Low PO4, normal Ca, normal 25(OH)D'],
            ['Renal Rickets', 'Chronic kidney disease', 'Low Ca, high PO4, high PTH, metabolic acidosis'],
          ],
        },
      },
      {
        title: '2. Biochemical Changes',
        text: 'Low dietary Vit D / Sunlight → Low 25-OH Vit D (<strong>&lt;8 ng/mL</strong> suggests deficiency) → Low intestinal Ca absorption → Hypocalcemia → High PTH secretion (secondary hyperparathyroidism) → Renal phosphate wasting + Bone resorption → Hypophosphatemia → Low Ca x PO4 product (&lt;30 mg²/dL²) → Defective mineralization of osteoid → Rickets',
        table: {
          headers: ['Parameter', 'Change', 'Mechanism'],
          rows: [
            ['Serum Calcium', 'Low / Low-normal', 'Low intestinal absorption; PTH maintains initially'],
            ['Serum Phosphate', 'Low', 'Renal phosphate wasting (PTH effect)'],
            ['Serum ALP', 'Markedly elevated', 'Osteoblast hyperactivity'],
            ['Serum PTH', 'Elevated (rises FIRST)', 'Secondary hyperparathyroidism'],
            ['25-OH Vitamin D', 'Low (<strong>&lt;8 ng/mL</strong>)', 'Best indicator of body stores'],
            ['1,25(OH)2D', 'Low', 'Reduced 1α-hydroxylation'],
          ],
        },
      },
      {
        title: '3. Clinical Features',
        list: [
          '<strong>Head & Chest:</strong> Craniotabes (ping-pong ball sensation, 3-6 months), delayed fontanelle closure (&gt;18 months), rachitic rosary (costochondral beading, ribs 5-8), Harrison\'s sulcus, pectus carinatum/excavatum',
          '<strong>Extremities & Spine:</strong> Wrist widening, ankle widening, bow legs (genu varum, &lt;3 years), knock knees (genu valgum, &gt;3 years), delayed teething (&gt;12 months), kyphosis/scoliosis, bone pain/tenderness',
          '<strong>Systemic:</strong> Delayed motor milestones (sitting, walking), proximal muscle weakness/myopathy, failure to thrive',
          '<strong>Emergency:</strong> <strong>Hypocalcemic seizures/tetany</strong> (severe rickets) — treat with IV calcium gluconate 1-2 mL/kg of 10% solution slowly over 10 minutes with cardiac monitoring',
        ],
        mnemonic: { title: 'C-R-W-L', text: 'Craniotabes | Rosary (rachitic) | Wrist widening | Legs bowed or knock-kneed' },
      },
      {
        title: '4. Radiological Findings (X-ray Wrist - AP View)',
        list: [
          '<strong>Cupping</strong> - concavity of metaphysis (saucerization)',
          '<strong>Fraying</strong> - irregular, brush-like appearance of metaphyseal margins',
          '<strong>Splaying</strong> - widening of growth plate (&gt;2 mm)',
          '<strong>Reduced bone density</strong> - coarsened trabecular pattern',
          '<strong>Greenstick fractures</strong>',
        ],
      },
      {
        title: '5. Management',
        table: {
          headers: ['Regimen', 'Dose', 'Duration'],
          rows: [
            ['Daily Therapy (Preferred)', 'Vit D3 2000-4000 IU/day', '6-12 weeks (or 3 months), then 400 IU maintenance'],
            ['Stoss Therapy', 'Vit D3 150,000-300,000 IU orally', 'Single dose; repeat at 3 months if needed'],
            ['Calcium', 'Elemental calcium 50-100 mg/kg/day', 'Alongside Vit D'],
          ],
        },
        list: [
          '<strong>Emergency (hypocalcemic seizures/tetany):</strong> IV calcium gluconate <strong>1-2 mL/kg of 10% solution</strong> given slowly over 10 minutes with ECG monitoring for bradycardia.',
          '<strong>Monitoring:</strong> Clinical improvement in 2-4 weeks; radiological healing in 3-6 months. Monitor serum Ca, PO4, ALP at 4, 8, 12 weeks.',
          '<strong>Surgical:</strong> Corrective osteotomy for severe deformities (after healing of rickets).',
          '<strong>Prevention:</strong> Breastfed infants: 400 IU/day Vit D3 from first few days. Formula-fed: supplement if &lt;1 L/day. Pregnant/lactating mothers: 600-1000 IU/day. Sun exposure: 15-30 min/day. High-risk: dark skin, limited sun, malabsorption.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Confusing rickets with <strong>scurvy</strong> — scurvy has <strong>white line of Fraenkel</strong> on X-ray and bleeding gums; rickets has cupping/fraying/splaying.',
          '<strong>Trap 2:</strong> Normal calcium in early rickets — <strong>PTH rises FIRST</strong> to maintain calcium; do not expect hypocalcemia initially.',
          '<strong>Trap 3:</strong> Vit D dependent Type I — <strong>normal 25(OH)D</strong> but <strong>low 1,25(OH)2D</strong>; differs from nutritional deficiency.',
          '<strong>Trap 4:</strong> XLH — <strong>normal calcium, normal 25(OH)D</strong>, low phosphate only; treat with phosphate + calcitriol (NOT calcium).',
          '<strong>Trap 5:</strong> Forgetting <strong>elemental calcium</strong> supplementation alongside vitamin D.',
          '<strong>High-yield:</strong> Rachitic rosary is most prominent at <strong>ribs 5-8</strong>.',
          '<strong>High-yield:</strong> 25(OH)D &lt;8 ng/mL suggests nutritional deficiency (not &lt;20).',
          '<strong>High-yield:</strong> Radiological healing takes <strong>3-6 months</strong> — slower than clinical improvement.',
        ],
      },
    ],
    checklist: [
      'Definition: Decreased or defective bone mineralization in growing children - <strong>0.5M</strong>',
      'Types: Nutritional (Vit D &lt;8 ng/mL), Vit D dependent I (normal 25-OH, low 1,25), Vit D dependent II, XLH, Renal - <strong>0.5M</strong>',
      'Biochemistry: Low Ca, low PO4, high ALP, high PTH (rises first), low 25(OH)D (&lt;8 ng/mL) — draw pathway - <strong>2M</strong>',
      'Clinical features: Craniotabes, rachitic rosary (ribs 5-8), wrist widening, bow legs, delayed motor milestones, myopathy, hypocalcemic seizures/tetany - <strong>2M</strong>',
      'X-ray: Cupping + Fraying + Splaying of metaphysis; distinguish from scurvy (white line of Fraenkel) - <strong>1.5M</strong>',
      'Management: Vit D 2000-4000 IU/day x 6-12w or Stoss 150,000-300,000 IU; calcium; IV calcium gluconate for tetany - <strong>2M</strong>',
      'Prevention: 400 IU/day in infants, maternal supplementation, sun exposure - <strong>0.5M</strong>',
      'Examiner traps: PTH rises first (Ca normal early), XLH = normal Ca + normal 25-OH, distinguish from scurvy - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 176: Rickets and Vitamin D Disorders.',
    ],
  },
  {
    id: 'hypothyroid',
    shortTitle: 'Hypothyroidism',
    patternStrength: 'Moderate',
    historicalFrequency: { appearances: 14, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 14 of 411 questions (3.4%). Moderate historical presence; often appears as short note or brief answer.',
    subject: 'Endocrinology',
    examType: 'Short Note',
    question: 'Describe the clinical features, screening, and management of congenital hypothyroidism. (2+2+1=5)',
    marksBreakdown: 'Definition & Etiology → 1M | Clinical Features → 2M | Screening → 1M | Management → 1M',
    sections: [
      {
        title: '1. Definition & Etiology',
        text: '<strong>Congenital Hypothyroidism (CH)</strong> is thyroid hormone deficiency present at birth. Most common preventable cause of intellectual disability. Incidence: 1:2500-1:4000 live births.',
        table: {
          headers: ['Type', 'Cause', '%'],
          rows: [
            ['Primary (Thyroid dysgenesis)', 'Agenesis, hypoplasia, ectopic thyroid (lingual/submandibular)', '80-85%'],
            ['Primary (Dyshormonogenesis)', 'Defects in thyroid hormone synthesis (TSH receptor, thyroglobulin, peroxidase, pendrin, deiodinase)', '10-15%'],
            ['Central (Hypothalamic-Pituitary)', 'Defective TRH/TSH secretion; midline defects (holoprosencephaly, septo-optic dysplasia)', '1-5%'],
          ],
        },
      },
      {
        title: '2. Clinical Features',
        text: '<strong>CRITICAL:</strong> The examiner tests <strong>neonatal features</strong>, NOT childhood features. Do NOT mention short stature or intellectual disability — those develop if untreated.',
        list: [
          '<strong>Neonatal Period (First 2-4 Weeks) — THESE ARE THE EXAM ANSWERS:</strong> Prolonged physiological jaundice (&gt;7 days) — <strong>unconjugated</strong>, hypotonia, lethargy, poor feeding, constipation, hypothermia (cold, mottled skin), large anterior + posterior fontanelle, bradycardia, respiratory distress (myxedema of vocal cords), edema (periorbital, peripheral), <strong>hoarse cry</strong>, <strong>macroglossia</strong>, <strong>umbilical hernia</strong>',
          '<strong>Infantile Period (2-3 Months Onwards):</strong> Coarse facies (flat nasal bridge, puffy eyes, macroglossia), umbilical hernia, goiter (in dyshormonogenesis), developmental delay, hoarse cry, dry skin, sparse hair, short stature, anemia (macrocytic)',
        ],
        mnemonic: { title: 'C-O-L-D C-H-I-L-D', text: 'Constipation | Obstructive jaundice (prolonged) | Large fontanelle | Developmental delay | Coarse facies | Hoarse cry | Intellectual disability (if untreated) | Lethargy | Dry skin' },
      },
      {
        title: '3. Newborn Screening',
        list: [
          'All newborns screened at day 3-5 of life (before discharge, optimally 48-72h after birth to avoid physiological TSH surge)',
          '<strong>Primary screening:</strong> TSH (most common) or T4',
          '<strong>Abnormal:</strong> TSH &gt;20-40 mIU/L; T4 &lt;10 microg/dL',
          '<strong>Confirmatory:</strong> Serum TSH, free T4, total T4',
          'If TSH high + T4 low: Primary hypothyroidism',
          'If TSH low/normal + T4 low: Central hypothyroidism - do MRI pituitary',
        ],
      },
      {
        title: '3A. Neonatal vs Childhood Features — Examiner Trap',
        table: {
          headers: ['Neonatal Features (First 4 weeks)', 'Childhood Features (If Untreated)'],
          rows: [
            ['Prolonged jaundice (>7 days)', 'Short stature'],
            ['Hypotonia, lethargy', 'Developmental delay / Intellectual disability'],
            ['Poor feeding, constipation', 'Coarse facies (already present)'],
            ['Cold skin, hypothermia', 'Delayed bone age'],
            ['Large fontanelle', 'Goiter (dyshormonogenesis)'],
            ['Bradycardia, respiratory distress', 'Precocious puberty (rare)'],
            ['Hoarse cry, macroglossia', ''],
            ['Umbilical hernia', ''],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>Levothyroxine (L-thyroxine):</strong> 10-15 microg/kg/day PO started immediately after confirmation',
          'Start treatment within <strong>2 weeks of life</strong> for normal neurodevelopmental outcome',
          'Crush tablet, mix with breast milk/formula. Do NOT give with soy/iron/calcium (reduces absorption)',
          '<strong>Monitoring:</strong> TSH and free T4 every 1-2 months in first 6 months; then every 3 months until age 3; then every 6-12 months',
          '<strong>Target:</strong> TSH 0.5-2.0 mIU/L; free T4 in upper normal range',
          '<strong>Prognosis:</strong> Excellent if treatment starts within 2 weeks; IQ normal',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Listing childhood features (short stature, intellectual disability) instead of <strong>neonatal features</strong> — examiner wants neonatal features specifically.',
          '<strong>Trap 2:</strong> Forgetting <strong>unconjugated</strong> hyperbilirubinemia — not conjugated.',
          '<strong>Trap 3:</strong> Wrong screening timing — <strong>day 3-5</strong>, not immediately at birth (physiological TSH surge).',
          '<strong>Trap 4:</strong> Missing <strong>central hypothyroidism</strong> — low/normal TSH + low T4 = MRI pituitary.',
          '<strong>Trap 5:</strong> Giving levothyroxine with soy/iron/calcium — <strong>reduces absorption</strong>.',
          '<strong>High-yield:</strong> Most common preventable cause of intellectual disability — <strong>start before 2 weeks</strong>.',
          '<strong>High-yield:</strong> TSH screening cutoff: <strong>>20-40 mIU/L</strong>.',
        ],
      },
    ],
    checklist: [
      'Definition: Thyroid hormone deficiency at birth; most common preventable cause of intellectual disability - <strong>0.5M</strong>',
      'Etiology: Thyroid dysgenesis (85%), dyshormonogenesis (15%), central (1-5%) - <strong>0.5M</strong>',
      'Clinical: <strong>Neonatal</strong> features — prolonged jaundice, hypotonia, constipation, cold skin, large fontanelle, macroglossia, umbilical hernia, hoarse cry - <strong>1.5M</strong>',
      'Neonatal vs childhood table — do NOT list short stature/ID as neonatal features - <strong>0.5M</strong>',
      'Screening: TSH at day 3-5; confirm with TSH + free T4; start Rx before 2 weeks - <strong>1M</strong>',
      'Management: Levothyroxine 10-15 microg/kg/day; monitor TSH/T4 every 1-2 months; avoid soy/iron - <strong>1M</strong>',
      'Prognosis: Excellent if early treatment; normal IQ - <strong>0.5M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 174: Thyroid Disorders.',
    ],
  },
  {
    id: 'torsion',
    shortTitle: 'Testicular Torsion',
    patternStrength: 'Moderate',
    historicalFrequency: { appearances: 8, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 8 of 411 questions (1.9%). Low absolute frequency but high mark value when tested as emergency management topic.',
    subject: 'Nephrology / Surgery',
    examType: 'Short Note',
    question: 'A 12-year-old boy presents with sudden severe pain in the right scrotum and vomiting. Discuss the differential diagnosis, investigations, and emergency management. (1+1+1=3)',
    marksBreakdown: 'DDx of Acute Scrotum → 1M | Clinical Features → 0.5M | Investigations → 0.5M | Emergency Management → 1M',
    sections: [
      {
        title: '1. Differential Diagnosis of Acute Scrotum',
        table: {
          headers: ['Condition', 'Age', 'Key Feature'],
          rows: [
            ['Testicular Torsion', 'Neonatal / Peripubertal (12-18y)', 'Sudden pain, high-riding testis, absent cremasteric'],
            ['Torsion of Testicular Appendage', 'Prepubertal', 'Blue dot sign, localized tenderness at upper pole'],
            ['Epididymo-orchitis', 'Any age', 'Fever, pyuria, gradual onset, UTIs'],
            ['Idiopathic Scrotal Edema', '3-8 years', 'Painless erythematous scrotal edema'],
            ['Trauma / HSP', 'Any age', 'History of trauma / purpura rash'],
            ['Inguinal Hernia (Incarcerated)', 'Infants', 'Visible bulge, irritability, vomiting'],
          ],
        },
      },
      {
        title: '2. Clinical Features of Testicular Torsion',
        list: [
          'Sudden severe unilateral scrotal pain (often wakes child from sleep)',
          'Nausea and vomiting (due to severe pain)',
          'High-riding testis (horizontal lie - "bell-clapper deformity")',
          'Absent cremasteric reflex (most sensitive sign)',
          'Scrotal swelling, erythema, tenderness',
          'No relief with elevation (vs epididymitis where elevation helps - Prehn\'s sign)',
        ],
      },
      {
        title: '3. Investigations',
        list: [
          '<strong>Color Doppler USG</strong> - test of choice; shows absent or decreased blood flow to testis (sensitivity 90-100%)',
          'Radionuclide scan - rarely used now; "cold spot" in torsion',
          'Urine analysis - normal (vs pyuria in infection)',
          'Do NOT delay surgery for imaging if clinical suspicion is high',
        ],
      },
      {
        title: '4. Emergency Management',
        list: [
          '<strong>Immediate surgical exploration</strong> - do not wait for imaging if strongly suspected',
          'Manual detorsion may be attempted as a temporizing measure ("open the book" - rotate testis laterally 180 degrees x 2)',
          'Scrotal exploration: Detorsion, assess viability (warm packs), bilateral orchidopexy (fix both testes to prevent future torsion)',
          '<strong>Salvage rate:</strong> &gt;90% if surgery within 6 hours; &lt;10% if &gt;24 hours',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Confusing torsion with epididymo-orchitis — torsion has <strong>sudden onset + absent cremasteric + normal urine</strong>; epididymitis has <strong>gradual onset + fever + pyuria</strong>.',
          '<strong>Trap 2:</strong> Forgetting <strong>bilateral orchidopexy</strong> — always fix both testes to prevent future torsion on the contralateral side.',
          '<strong>Trap 3:</strong> Delaying surgery for imaging — <strong>do NOT wait for Doppler</strong> if clinical suspicion is high.',
          '<strong>Trap 4:</strong> Age trap — torsion occurs in <strong>neonates AND adolescents</strong> (two peaks), not just teenagers.',
          '<strong>Trap 5:</strong> Blue dot sign = torsion of appendix testis, NOT testicular torsion — different management (conservative).',
          '<strong>High-yield:</strong> <strong>Absent cremasteric reflex</strong> is the most sensitive clinical sign.',
          '<strong>High-yield:</strong> <strong>&lt;6 hours = &gt;90% salvage</strong>; &gt;24 hours = &lt;10% salvage.',
        ],
      },
    ],
    checklist: [
      'DDx: Torsion of appendage, epididymo-orchitis, HSP, trauma, incarcerated hernia, idiopathic edema - <strong>0.5M</strong>',
      'Clinical: Sudden pain, vomiting, high-riding testis, absent cremasteric reflex - <strong>0.5M</strong>',
      'Investigations: Color Doppler USG - absent blood flow; urine normal - <strong>0.5M</strong>',
      'Management: Emergency surgery within 6h; detorsion + bilateral orchidopexy; orchidectomy if non-viable - <strong>1M</strong>',
      'Examiner traps: Distinguish from epididymitis, bilateral fixation, do not delay surgery - <strong>0.5M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 135: Urologic Disorders.',
    ],
  },
  {
    id: 'hematuria',
    shortTitle: 'Hematuria DDx',
    patternStrength: 'Moderate',
    historicalFrequency: { appearances: 11, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 11 of 411 questions (2.7%). Moderate pattern; often tested as differential diagnosis or investigation-based question.',
    subject: 'Nephrology',
    examType: 'Short Note',
    question: 'A 7-year-old child presents with painless hematuria. Discuss the approach to diagnosis and differential diagnosis. (1.5+1.5=3)',
    marksBreakdown: 'Classification → 0.5M | Glomerular Causes → 1M | Non-Glomerular Causes → 1M | Investigations → 0.5M',
    sections: [
      {
        title: '1. Classification of Hematuria',
        list: [
          '<strong>Glomerular Hematuria:</strong> Color: Cola/tea/smoky (brown). RBCs: Dysmorphic, fragmented (acanthocytes). Casts: RBC casts pathognomonic. Proteinuria: Present (often &gt;+++). Clots: Absent. Associated: Edema, hypertension, decreased GFR.',
          '<strong>Non-Glomerular Hematuria:</strong> Color: Fresh red/pink. RBCs: Isomorphic (normal shape). Casts: Absent. Proteinuria: Minimal or absent. Clots: May be present. Associated: Dysuria, flank pain, trauma history.',
        ],
      },
      {
        title: '2. Differential Diagnosis',
        list: [
          '<strong>Glomerular causes:</strong> AGN/PSGN, IgA Nephropathy (Synpharyngitic hematuria), HSP/IgA vasculitis, Alport Syndrome (X-linked, hearing loss), MPGN, Thin Basement Membrane Disease',
          '<strong>Non-glomerular causes:</strong> UTI, Urolithiasis, Trauma, Hypercalciuria (#1 cause of isolated hematuria), Coagulopathy, Sickle Cell Trait/Disease, Wilms Tumor, PUV/UPJ obstruction',
        ],
      },
      {
        title: '3. Key Investigations',
        table: {
          headers: ['Test', 'Purpose'],
          rows: [
            ['Urine microscopy', 'Dysmorphic vs isomorphic RBCs; RBC casts; crystals'],
            ['Urine culture', 'Rule out UTI'],
            ['Urine calcium/creatinine', 'Hypercalciuria (&gt;0.21 mg/mg)'],
            ['C3, C4', 'Low in PSGN, MPGN; normal in IgA, HSP'],
            ['ASO, Anti-DNase B', 'PSGN'],
            ['IgA levels', 'Elevated in IgA nephropathy, HSP'],
            ['USG KUB', 'Stones, masses, hydronephrosis'],
            ['CT KUB', 'Non-contrast for stones'],
            ['Renal biopsy', 'If glomerular + persistent hematuria + proteinuria'],
          ],
        },
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> RBC casts = <strong>pathognomonic for glomerular hematuria</strong>. If you see RBC casts, it is glomerular until proven otherwise.',
          '<strong>Trap 2:</strong> Clots in urine = <strong>non-glomerular</strong>. Glomerular hematuria does NOT form clots.',
          '<strong>Trap 3:</strong> IgA nephropathy = <strong>normal C3</strong>. Low C3 points to PSGN or MPGN.',
          '<strong>Trap 4:</strong> Hypercalciuria is the <strong>#1 cause of isolated non-glomerular hematuria</strong> in children.',
          '<strong>Trap 5:</strong> Alport syndrome = X-linked, <strong>hearing loss</strong>, family history of hematuria + deafness.',
          '<strong>High-yield:</strong> <strong>Brown/smoky urine</strong> = glomerular; <strong>fresh red/pink</strong> = non-glomerular.',
          '<strong>High-yield:</strong> <strong>Dysmorphic RBCs</strong> = glomerular; <strong>isomorphic RBCs</strong> = non-glomerular.',
        ],
      },
    ],
    checklist: [
      'Classification: Glomerular (dysmorphic RBCs, RBC casts, brown urine) vs Non-glomerular (isomorphic RBCs, red urine, clots) - <strong>0.5M</strong>',
      'Glomerular causes: AGN, IgA nephropathy, HSP, Alport, MPGN, TBM disease - <strong>1M</strong>',
      'Non-glomerular causes: UTI, stones, trauma, hypercalciuria, coagulopathy, sickle cell, Wilms, PUV - <strong>0.5M</strong>',
      'Investigations: Urine microscopy, culture, calcium/creatinine, C3, USG, biopsy - <strong>0.5M</strong>',
      'Examiner traps: RBC casts = glomerular, clots = non-glomerular, normal C3 = IgA - <strong>0.5M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 165: Hematuria.',
    ],
  },
  {
    id: 'hypoglycemia',
    shortTitle: 'Hypoglycemia',
    patternStrength: 'Moderate',
    historicalFrequency: { appearances: 5, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 5 of 411 questions (1.2%). Low sample size; may appear in emergency medicine or neonatology contexts.',
    subject: 'Neonatology',
    examType: 'Short Note',
    question: 'Define neonatal hypoglycemia. List the risk factors, clinical features, and management. (1+1+1=3)',
    marksBreakdown: 'Definition → 1M | Risk Factors → 0.5M | Clinical Features → 0.5M | Management → 1M',
    sections: [
      {
        title: '1. Definition',
        list: [
          'Operational threshold: Plasma glucose &lt;40 mg/dL in the first 24 hours; &lt;45 mg/dL after 24 hours',
          'Neuroglycopenic threshold: &lt;30 mg/dL - risk of permanent brain injury',
        ],
      },
      {
        title: '2. Risk Factors',
        list: [
          '<strong>Increased Utilization / Decreased Stores:</strong> Preterm/SGA/IUGR (decreased glycogen stores), perinatal asphyxia, hypothermia, sepsis, polycythemia',
          '<strong>Hyperinsulinism / Endocrine:</strong> Infant of Diabetic Mother (IDM), LGA, Beckwith-Wiedemann syndrome, transfusion/exchange, pituitary/adrenal insufficiency, inborn errors of metabolism',
        ],
      },
      {
        title: '3. Clinical Features',
        table: {
          headers: ['System', 'Signs'],
          rows: [
            ['CNS', 'Jitteriness, tremors, irritability, lethargy, hypotonia, seizures, apnea, coma'],
            ['Autonomic', 'Sweating, tachycardia, pallor, cyanosis'],
            ['Respiratory', 'Apnea, tachypnea, respiratory distress'],
            ['GI', 'Poor feeding, weak suck'],
            ['Other', 'Temperature instability, high-pitched cry'],
          ],
        },
        text: 'Asymptomatic hypoglycemia is common - detected only on screening',
      },
      {
        title: '4. Management',
        list: [
          '<strong>Screening:</strong> All at-risk neonates at 2, 6, 12, 24, 36, 48 hours',
          '<strong>Asymptomatic (glucose 25-40):</strong> Feed immediately; recheck in 30 min',
          '<strong>Symptomatic or &lt;25 mg/dL:</strong> IV D10 2 mL/kg bolus then D10 maintenance 80-100 mL/kg/day',
          '<strong>Goal:</strong> Maintain glucose &gt;45-50 mg/dL',
          '<strong>If persistent:</strong> Increase GIR to 8-12 mg/kg/min; add glucagon 0.03 mg/kg IV or hydrocortisone 5 mg/kg/day',
          '<strong>Refractory:</strong> Evaluate for hyperinsulinism then Diazoxide / Octreotide / Surgery',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Definition confusion — <strong>old:</strong> &lt;40 mg/dL (first 24h); <strong>new AAP:</strong> &lt;47 mg/dL (operational threshold); <strong>treatment threshold:</strong> &lt;54 mg/dL.',
          '<strong>Trap 2:</strong> Asymptomatic hypoglycemia is common — <strong>do NOT overtreat</strong>; feed and recheck.',
          '<strong>Trap 3:</strong> SGA causes hypoglycemia via <strong>glycogen depletion</strong>; IDM causes it via <strong>hyperinsulinism</strong> — different mechanisms.',
          '<strong>Trap 4:</strong> Giving dextrose bolus to asymptomatic baby — <strong>feed first</strong>; IV dextrose only if symptomatic or &lt;25 mg/dL.',
          '<strong>Trap 5:</strong> Forgetting <strong>Beckwith-Wiedemann syndrome</strong> as a cause of refractory hypoglycemia (hyperinsulinism + macrosomia + macroglossia + omphalocele).',
          '<strong>High-yield:</strong> <strong>Hypoglycemia + macrosomia + macroglossia</strong> = Beckwith-Wiedemann.',
          '<strong>High-yield:</strong> <strong>Refractory hypoglycemia</strong> → think hyperinsulinism → Diazoxide first-line.',
        ],
      },
    ],
    checklist: [
      'Definition: &lt;40 mg/dL first 24h; &lt;45 mg/dL after (old); &lt;47 mg/dL operational; &lt;54 mg/dL treatment threshold - <strong>0.5M</strong>',
      'Risk factors: IDM, preterm, SGA, LGA, asphyxia, sepsis, Beckwith-Wiedemann - <strong>0.5M</strong>',
      'Clinical: Jitteriness, seizures, apnea, lethargy, poor feeding, sweating - <strong>0.5M</strong>',
      'Management: Feed if asymptomatic; IV D10 bolus + maintenance if symptomatic; increase GIR; glucagon/hydrocortisone if refractory - <strong>1M</strong>',
      'Examiner traps: Definition precision, feed first (asymptomatic), Beckwith-Wiedemann triad - <strong>0.5M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 87: Hypoglycemia.',
    ],
  },
  {
    id: 'intussusception',
    shortTitle: 'Intussusception',
    patternStrength: 'Emerging',
    historicalFrequency: { appearances: 6, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 6 of 411 questions (1.5%). Low frequency but clinically critical; may appear as acute abdomen differential.',
    subject: 'GI Surgery',
    examType: 'Short Note / Essay',
    question: 'A 9-month-old infant is brought with episodes of severe crying, vomiting, and passing currant jelly stool. Discuss the diagnosis, investigations, and management. (2+1+2=5)',
    marksBreakdown: 'Definition and Pathophysiology → 1M | Clinical Features → 1.5M | Investigations → 1M | Management → 1.5M',
    sections: [
      {
        title: '1. Definition',
        text: '<strong>Intussusception</strong> is the telescoping (invagination) of a proximal segment of bowel (intussusceptum) into the distal segment (intussuscipiens). It is the most common cause of intestinal obstruction in children aged 6-36 months.',
        list: [
          '<strong>Idiopathic (90%):</strong> Lymphoid hyperplasia of Peyer patches (post-viral)',
          '<strong>Lead point (10%):</strong> Meckel diverticulum, polyp, lymphoma, duplication cyst, HSP',
        ],
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Classic Triad:</strong> Severe episodic crying (colicky pain), vomiting (bilious if advanced), currant jelly stool (blood + mucus)',
          '<strong>Other:</strong> Drawing up of legs toward abdomen during episodes, lethargy between episodes, sausage-shaped abdominal mass (right upper quadrant), empty right lower quadrant (Dance sign)',
        ],
      },
      {
        title: '3. Investigations',
        list: [
          '<strong>USG Abdomen</strong> - test of choice; shows "target sign" or "doughnut sign" (concentric rings)',
          '<strong>Abdominal X-ray</strong> - signs of obstruction (air-fluid levels), paucity of gas in RLQ, soft tissue mass',
          '<strong>Contrast Enema</strong> - diagnostic and therapeutic; shows "coiled spring sign" or "meniscus sign"',
          '<strong>Air Enema</strong> - preferred for reduction under fluoroscopy',
          'Do NOT perform contrast enema if signs of perforation or peritonitis',
        ],
      },
      {
        title: '4. Management',
        list: [
          '<strong>Non-operative (First Line):</strong> Air/contrast enema reduction under fluoroscopy. Success rate: 80-90%. Contraindications: Peritonitis, perforation, shock, failed enema reduction.',
          '<strong>Operative:</strong> Manual reduction via laparotomy or laparoscopy. Resection if gangrenous bowel or lead point.',
          '<strong>Pre-operative:</strong> IV fluids, NG tube decompression, antibiotics, correct electrolytes.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Forgetting the <strong>two peaks</strong> — idiopathic intussusception is most common at <strong>6-36 months</strong>; older children with intussusception likely have a <strong>lead point</strong> (Meckel, lymphoma, HSP).',
          '<strong>Trap 2:</strong> Contrast enema is <strong>contraindicated</strong> if there are signs of <strong>peritonitis or perforation</strong> — surgery first in these cases.',
          '<strong>Trap 3:</strong> Missing <strong>Dance sign</strong> (empty RLQ) — a subtle but important clinical sign.',
          '<strong>Trap 4:</strong> Confusing with <strong>gastroenteritis</strong> — gastroenteritis has continuous diarrhea and no mass; intussusception has episodic colic, vomiting, and a sausage-shaped mass.',
          '<strong>Trap 5:</strong> Delaying reduction — <strong>time is bowel</strong>; risk of gangrene increases after 24 hours.',
          '<strong>High-yield:</strong> <strong>Currant jelly stool</strong> = late sign (sloughed mucosa + blood); do not wait for it.',
          '<strong>High-yield:</strong> <strong>Ileocolic</strong> is the most common type (90%).',
        ],
      },
    ],
    checklist: [
      'Definition: Telescoping of bowel; most common cause of intestinal obstruction in 6-36 months - <strong>0.5M</strong>',
      'Etiology: Idiopathic (90% - lymphoid hyperplasia), Lead point (10% - Meckel, polyp, lymphoma) - <strong>0.5M</strong>',
      'Clinical: Severe episodic crying, vomiting, currant jelly stool, sausage-shaped mass, Dance sign - <strong>1M</strong>',
      'Investigations: USG target sign, X-ray obstruction, contrast enema coiled spring sign - <strong>0.5M</strong>',
      'Management: Air/contrast enema reduction (first line), surgery if peritonitis/perforation - <strong>1M</strong>',
      'Examiner traps: Two age peaks, contraindications for enema, Dance sign, distinguish from gastroenteritis - <strong>0.5M</strong>',
      'Diagram/Flowchart - <strong>0.5M</strong>',
      'Neatness/Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 138: Intussusception.',
    ],
  },
  {
    id: 'portal',
    shortTitle: 'Portal Hypertension',
    patternStrength: 'Emerging',
    historicalFrequency: { appearances: 4, papersAnalyzed: 24, lastAppeared: '2022' },
    confidenceNote: 'Appeared in 4 of 411 questions (1.0%). Low sample size; study for GI/hepatology completeness.',
    subject: 'GI',
    examType: 'Short Note / Essay',
    question: 'A 10-year-old child with chronic liver disease presents with hematemesis and abdominal distension. Discuss the diagnosis and management of portal hypertension. (2+3+3+2=10)',
    marksBreakdown: 'Definition & Pathophysiology → 2M | Clinical Features → 2M | Investigations → 2M | Management → 3M | Complications → 1M',
    sections: [
      {
        title: '1. Definition & Pathophysiology',
        text: '<strong>Portal Hypertension</strong> is a pathological increase in portal venous pressure (&gt;10 mmHg or gradient &gt;5 mmHg). It results from increased resistance to portal blood flow and/or increased portal blood flow.',
        list: [
          '<strong>Pre-hepatic:</strong> Portal vein thrombosis, congenital atresia/stenosis, compression by tumor/cyst',
          '<strong>Hepatic (most common):</strong> Cirrhosis, congenital hepatic fibrosis, schistosomiasis',
          '<strong>Post-hepatic:</strong> Budd-Chiari syndrome, constrictive pericarditis, veno-occlusive disease',
        ],
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Splenomegaly</strong> - most common sign; hypersplenism (pancytopenia)',
          '<strong>Ascites</strong> - fluid accumulation in peritoneal cavity',
          '<strong>Caput medusae</strong> - dilated periumbilical veins',
          '<strong>Hematemesis/Melena</strong> - from esophageal/gastric variceal bleeding (life-threatening)',
          '<strong>Hepatic encephalopathy</strong> - confusion, asterixis, altered consciousness',
          '<strong>Pruritus, jaundice, palmar erythema, spider angiomas</strong> - signs of chronic liver disease',
        ],
      },
      {
        title: '3. Investigations',
        table: {
          headers: ['Investigation', 'Finding'],
          rows: [
            ['USG Doppler Abdomen', 'Portal vein diameter &gt;13 mm, hepatofugal flow, ascites, splenomegaly, collaterals'],
            ['Upper GI Endoscopy', 'Esophageal and gastric varices (grade I-IV) - gold standard for diagnosis'],
            ['CT/MRI Abdomen', 'Portal vein thrombosis, cavernous transformation, collateral vessels'],
            ['Liver Function Tests', 'Low albumin, elevated bilirubin, prolonged PT/INR'],
            ['CBC', 'Pancytopenia (hypersplenism)'],
            ['Endoscopic Ultrasound', 'Detailed evaluation of varices and portal venous system'],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>Acute Variceal Bleeding:</strong> IV fluids, blood transfusion (Hb target 7-8 g/dL), antibiotics (Ceftriaxone - prevent SBP), vasoactive drugs (Octreotide/Terlipressin), endoscopic band ligation (EBL) or sclerotherapy. Balloon tamponade (Sengstaken-Blakemore) if refractory. TIPS if endoscopy fails.',
          '<strong>Prevention of Rebleeding:</strong> Non-selective beta-blockers (Propranolol), repeated EBL until varices obliterated.',
          '<strong>Primary Prophylaxis:</strong> Non-selective beta-blockers or EBL if high-risk varices.',
          '<strong>Portosystemic Shunt Surgery:</strong> Devascularization procedures (Sugiura), shunt procedures (MESO-Rex bypass for portal vein thrombosis), liver transplantation (definitive for end-stage liver disease).',
          '<strong>General:</strong> Low sodium diet, diuretics (Spironolactone + Furosemide) for ascites, lactulose/rifaximin for encephalopathy, nutritional support.',
        ],
      },
      {
        title: '5. Complications',
        list: [
          'Variceal bleeding (life-threatening)',
          'Hepatic encephalopathy',
          'Ascites and spontaneous bacterial peritonitis (SBP)',
          'Hepatorenal syndrome',
          'Hepatopulmonary syndrome / portopulmonary hypertension',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Using <strong>selective beta-blockers</strong> (metoprolol) — must use <strong>non-selective</strong> (propranolol, nadolol) to reduce both cardiac output AND splanchnic vasodilation.',
          '<strong>Trap 2:</strong> Giving <strong>NSAIDs</strong> for pain — contraindicated; they worsen bleeding risk and renal function.',
          '<strong>Trap 3:</strong> Over-transfusion — target <strong>Hb 7-8 g/dL</strong> (not 10-12); over-transfusion increases portal pressure and rebleeding risk.',
          '<strong>Trap 4:</strong> Forgetting <strong>antibiotic prophylaxis</strong> (Ceftriaxone) in acute variceal bleed — prevents SBP and reduces mortality.',
          '<strong>Trap 5:</strong> Confusing <strong>hepatorenal syndrome</strong> with pre-renal azotemia — HRS does NOT improve with fluid challenge; pre-renal does.',
          '<strong>High-yield:</strong> <strong>Endoscopy</strong> is the gold standard for diagnosing varices, NOT USG.',
          '<strong>High-yield:</strong> <strong>Caput medusae</strong> = dilated periumbilical veins; recanalized paraumbilical vein.',
          '<strong>High-yield:</strong> In children, <strong>portal vein thrombosis</strong> is the most common cause of pre-hepatic portal HTN.',
        ],
      },
    ],
    checklist: [
      'Definition: Portal venous pressure >10 mmHg or gradient >5 mmHg - <strong>0.5M</strong>',
      'Pathophysiology: Increased resistance (pre-hepatic, hepatic, post-hepatic) + increased flow - <strong>1M</strong>',
      'Clinical: Splenomegaly, ascites, caput medusae, hematemesis/melena, encephalopathy - <strong>1M</strong>',
      'Investigations: USG Doppler, endoscopy (gold standard), CT/MRI, LFT, CBC - <strong>1M</strong>',
      'Acute bleed management: Fluids, blood, antibiotics, octreotide, endoscopic band ligation - <strong>1.5M</strong>',
      'Prevention: Beta-blockers, EBL, portosystemic shunt, liver transplant - <strong>1M</strong>',
      'Complications: Encephalopathy, SBP, hepatorenal syndrome - <strong>0.5M</strong>',
      'Examiner traps: Non-selective beta-blockers, transfusion target Hb 7-8, antibiotic prophylaxis - <strong>0.5M</strong>',
      'Diagram/Flowchart - <strong>0.5M</strong>',
      'Neatness/Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 140: Portal Hypertension.',
    ],
  },
  {
    id: 'hus',
    shortTitle: 'HUS',
    patternStrength: 'Emerging',
    historicalFrequency: { appearances: 3, papersAnalyzed: 24, lastAppeared: '2024' },
    confidenceNote: 'Appeared in 3 of 411 questions (0.7%). Recent emergence may indicate syllabus inclusion, but sample is too small for reliable pattern.',
    subject: 'Nephrology',
    examType: 'Essay',
    question: 'A 3-year-old child presents with bloody diarrhea followed by pallor, petechiae, and decreased urine output. Discuss the diagnosis, investigations, and management of Hemolytic Uremic Syndrome. (2+3+3+2=10)',
    marksBreakdown: 'Definition & Pathophysiology → 2M | Clinical Features → 2M | Investigations → 2M | Management → 3M | Prognosis → 1M',
    sections: [
      {
        title: '1. Definition & Pathophysiology',
        text: '<strong>Hemolytic Uremic Syndrome (HUS)</strong> is a thrombotic microangiopathy characterized by the classic triad: <strong>hemolytic anemia, thrombocytopenia, and acute kidney injury (AKI)</strong>. It is the most common cause of AKI in children.',
        list: [
          '<strong>Typical HUS (90%):</strong> Caused by Shiga toxin-producing E. coli (STEC) - O157:H7, O104:H4. Toxin binds to globotriaosylceramide (Gb3) receptors on glomerular endothelial cells → endothelial damage → platelet activation → microthrombi formation → microangiopathic hemolytic anemia + thrombocytopenia + AKI.',
          '<strong>Atypical HUS (10%):</strong> Due to complement dysregulation (mutations in CFH, CFI, MCP, C3, CFHR, THBD) or secondary causes (pneumococcal infection, drugs, malignancy, autoimmune).',
        ],
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Prodrome:</strong> Bloody diarrhea (hemorrhagic colitis) 5-10 days before HUS onset. Severe abdominal pain, vomiting.',
          '<strong>Hematologic:</strong> Pallor, fatigue, petechiae, ecchymoses, mucosal bleeding (epistaxis, gingival).',
          '<strong>Renal:</strong> Oliguria/anuria, edema, hypertension, hematuria, proteinuria.',
          '<strong>Other:</strong> Fever, irritability, seizures (hypertensive encephalopathy), pancreatitis, cardiomyopathy, CNS involvement.',
        ],
      },
      {
        title: '3. Investigations',
        table: {
          headers: ['Investigation', 'Finding'],
          rows: [
            ['CBC', 'Anemia (Hb 5-9 g/dL), thrombocytopenia (&lt;150,000), schistocytes/fragmented RBCs'],
            ['Peripheral Smear', 'Schistocytes, helmet cells, burr cells - microangiopathic hemolysis'],
            ['LDH, Haptoglobin', 'High LDH, low haptoglobin'],
            ['Reticulocyte Count', 'Elevated'],
            ['Coombs Test', 'Negative (non-immune hemolysis)'],
            ['Blood Urea, Creatinine', 'Elevated (AKI)'],
            ['Electrolytes', 'Hyperkalemia, hyponatremia, metabolic acidosis, hyperphosphatemia, hypocalcemia'],
            ['Stool Culture/PCR', 'STEC O157:H7 or other Shiga toxin-producing E. coli'],
            ['Complement Levels (C3, C4)', 'Normal in typical HUS; low in aHUS'],
            ['ADAMTS13 Activity', 'Normal (to rule out TTP)'],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>Supportive Care (Mainstay):</strong> Strict fluid and electrolyte management. Treat hyperkalemia, acidosis, hypertension. Blood transfusion for symptomatic anemia (Hb &lt;6 g/dL or hemodynamic compromise). Platelet transfusion only for active bleeding or invasive procedures.',
          '<strong>Nutrition:</strong> Early enteral nutrition. Parenteral nutrition if contraindicated.',
          '<strong>Dialysis:</strong> Indicated for refractory fluid overload, severe hyperkalemia, severe metabolic acidosis, uremic symptoms, oliguria &gt;24h. Peritoneal dialysis preferred in children.',
          '<strong>Antibiotics:</strong> Generally AVOIDED in typical STEC-HUS (may increase Shiga toxin release). Use only for documented sepsis or pneumococcal HUS.',
          '<strong>Eculizumab:</strong> Humanized anti-C5 monoclonal antibody. Indicated for atypical HUS. Extremely expensive. Vaccinate against meningococcus before starting.',
          '<strong>Plasma Exchange:</strong> For severe aHUS or TTP-like presentation.',
          '<strong>Other:</strong> No role for heparin, aspirin, or antiplatelet agents in typical HUS.',
        ],
      },
      {
        title: '5. Prognosis',
        list: [
          'Typical HUS: Mortality 3-5%. Most children recover fully. 30% may have long-term sequelae (proteinuria, hypertension, CKD).',
          'Atypical HUS: Poor prognosis without treatment. 50% mortality/ESRD in first year. Eculizumab has dramatically improved outcomes.',
          'Poor prognostic factors: Atypical HUS, CNS involvement, prolonged anuria (>7 days), severe thrombocytopenia.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Giving <strong>antibiotics</strong> in typical STEC-HUS — <strong>AVOID</strong>; antibiotics increase Shiga toxin release and worsen outcomes.',
          '<strong>Trap 2:</strong> Giving <strong>platelet transfusion</strong> routinely — contraindicated unless active bleeding or invasive procedure; can worsen thrombosis.',
          '<strong>Trap 3:</strong> Confusing with <strong>TTP</strong> — TTP has <strong>severe neurological symptoms</strong> and <strong>low ADAMTS13</strong>; HUS has <strong>bloody diarrhea + normal ADAMTS13</strong>.',
          '<strong>Trap 4:</strong> Forgetting <strong>vaccinate against meningococcus</strong> before eculizumab — C5 inhibition increases meningococcal risk.',
          '<strong>Trap 5:</strong> Using <strong>heparin/antiplatelets</strong> in typical HUS — no role; may worsen bleeding.',
          '<strong>Trap 6:</strong> Missing <strong>pneumococcal HUS</strong> — occurs after pneumonia/meningitis; different management (antibiotics indicated, not contraindicated).',
          '<strong>High-yield:</strong> <strong>Negative Coombs test</strong> = non-immune hemolysis = HUS/TTP, not autoimmune hemolytic anemia.',
          '<strong>High-yield:</strong> <strong>Schistocytes</strong> on peripheral smear = microangiopathic hemolytic anemia = pathognomonic.',
        ],
      },
    ],
    checklist: [
      'Definition: Thrombotic microangiopathy - hemolytic anemia + thrombocytopenia + AKI - <strong>0.5M</strong>',
      'Pathophysiology: Shiga toxin (STEC) → endothelial damage → microthrombi → MHA + thrombocytopenia + AKI - <strong>1M</strong>',
      'Types: Typical (90% - STEC) vs Atypical (10% - complement dysregulation) - <strong>0.5M</strong>',
      'Clinical: Bloody diarrhea prodrome, pallor, petechiae, oliguria, edema, hypertension - <strong>1M</strong>',
      'Investigations: CBC with schistocytes, low haptoglobin, high LDH, negative Coombs, stool STEC PCR, normal ADAMTS13 - <strong>1M</strong>',
      'Management: Supportive care, fluids/electrolytes, dialysis if indicated, AVOID antibiotics in STEC-HUS, eculizumab for aHUS - <strong>1.5M</strong>',
      'Prognosis: Typical - good recovery; Atypical - poor without eculizumab - <strong>0.5M</strong>',
      'Examiner traps: No antibiotics in STEC-HUS, no platelet transfusion, distinguish from TTP, meningococcal vaccine before eculizumab - <strong>0.5M</strong>',
      'Diagram/Flowchart - <strong>0.5M</strong>',
      'Neatness/Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 169: Hemolytic Uremic Syndrome.',
    ],
  },
  {
    id: 'biliary',
    shortTitle: 'Biliary Atresia',
    patternStrength: 'Emerging',
    historicalFrequency: { appearances: 2, papersAnalyzed: 24, lastAppeared: '2023' },
    confidenceNote: 'Appeared in 2 of 411 questions (0.5%). Very low sample size. Study for neonatology completeness, not pattern confidence.',
    subject: 'GI Surgery / Hepatology',
    examType: 'Essay',
    question: 'A 3-week-old infant presents with progressive jaundice, pale stools, and dark urine. Discuss the diagnosis and management of biliary atresia. (2+3+3+2=10)',
    marksBreakdown: 'Definition & Classification → 2M | Clinical Features → 2M | Investigations → 2M | Management → 3M | Prognosis → 1M',
    sections: [
      {
        title: '1. Definition & Classification',
        text: '<strong>Biliary Atresia (BA)</strong> is a progressive, idiopathic, obliterative cholangiopathy involving the extrahepatic (and sometimes intrahepatic) bile ducts. It is the most common cause of neonatal cholestasis and the leading indication for liver transplantation in children.',
        list: [
          '<strong>Type I (10%):</strong> Obliteration of common bile duct only. Most favorable prognosis.',
          '<strong>Type II (2%):</strong> Obliteration of common hepatic duct.',
          '<strong>Type III (88%):</strong> Obliteration of entire extrahepatic biliary tree up to porta hepatis. Most common and most severe.',
          '<strong>Associated anomalies (10-20%):</strong> Biliary atresia splenic malformation (BASM) syndrome - polysplenia, situs inversus, malrotation, cardiac defects, preduodenal portal vein.',
        ],
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Jaundice:</strong> Progressive, conjugated hyperbilirubinemia. Persists beyond 14 days of life (physiological jaundice resolves by 2 weeks).',
          '<strong>Acholic (pale/white) stools:</strong> Due to absence of bile reaching intestine. Most specific sign.',
          '<strong>Dark urine:</strong> Conjugated bilirubin excreted in urine.',
          '<strong>Hepatomegaly:</strong> Firm, enlarged liver. Splenomegaly in advanced disease.',
          '<strong>Ascites, failure to thrive, bleeding tendency, pruritus</strong> - signs of end-stage liver disease.',
        ],
      },
      {
        title: '3. Investigations',
        table: {
          headers: ['Investigation', 'Finding/Purpose'],
          rows: [
            ['Serum Bilirubin', 'Conjugated hyperbilirubinemia (&gt;20% of total or &gt;1 mg/dL if total &lt;5 mg/dL)'],
            ['Liver Function Tests', 'Elevated AST, ALT, GGT (markedly elevated), low albumin, prolonged PT'],
            ['Coagulation Profile', 'Prolonged PT/INR (vitamin K responsive initially)'],
            ['USG Abdomen', 'Small/absent gallbladder, triangular cord sign (&gt;4 mm fibrous cone at porta hepatis), absent common bile duct'],
            ['HIDA Scan', 'No excretion of tracer into intestine (non-visualization of bowel at 24h) - high sensitivity'],
            ['Liver Biopsy', 'Bile duct proliferation, portal fibrosis, bile plugs, inflammatory infiltrate - gold standard if diagnosis unclear'],
            ['MRCP/ERCP', 'Anatomic delineation (rarely needed)'],
            ['Infectious Workup', 'Exclude TORCH, sepsis, hepatitis'],
          ],
        },
      },
      {
        title: '4. Management',
        list: [
          '<strong>Kasai Portoenterostomy (First Line):</strong> Excision of fibrotic biliary remnant + Roux-en-Y jejunal loop anastomosed to porta hepatis to restore bile drainage. <strong>Timing is critical:</strong> Best outcomes if performed &lt;60 days of age. Success rate drops dramatically after 90 days.',
          '<strong>Pre-operative:</strong> Vitamin K (correct coagulopathy), nutritional support (MCT-containing formula), choleretics (ursodeoxycholic acid), antibiotics.',
          '<strong>Post-operative:</strong> Prednisolone (improve bile flow), prophylactic antibiotics (prevent cholangitis), ursodeoxycholic acid, fat-soluble vitamins (A, D, E, K).',
          '<strong>Liver Transplantation:</strong> Definitive treatment for failed Kasai or end-stage liver disease. 80-90% survival at 5 years.',
          '<strong>Cholangitis:</strong> Most common complication post-Kasai. Fever, increased jaundice, acholic stools. Treat with broad-spectrum IV antibiotics.',
        ],
      },
      {
        title: '5. Prognosis',
        list: [
          'Kasai success (jaundice-free) in 50-60% if performed <60 days.',
          'Native liver survival: 50% at 5 years, 30% at 10 years.',
          'Overall survival with transplant: 80-90% at 5 years, 80% at 20 years.',
          'Poor prognostic factors: Age >90 days at Kasai, Type III, BASM syndrome, post-operative cholangitis, portal hypertension.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Calling it <strong>"physiological jaundice"</strong> beyond 14 days — ANY jaundice >14 days in a breastfed infant or >21 days in a formula-fed infant is <strong>pathological</strong> and needs workup.',
          '<strong>Trap 2:</strong> Missing <strong>conjugated vs unconjugated</strong> hyperbilirubinemia — dark urine and pale stools = <strong>conjugated</strong> = obstructive = biliary atresia or neonatal hepatitis.',
          '<strong>Trap 3:</strong> Delaying Kasai beyond <strong>60 days</strong> — success rate drops dramatically; timing is the single most important prognostic factor.',
          '<strong>Trap 4:</strong> Forgetting <strong>BASM syndrome</strong> associations — polysplenia, situs inversus, malrotation, cardiac defects, preduodenal portal vein.',
          '<strong>Trap 5:</strong> Confusing with <strong>neonatal hepatitis</strong> — both have conjugated hyperbilirubinemia; HIDA scan and liver biopsy help differentiate.',
          '<strong>Trap 6:</strong> Not giving <strong>vitamin K</strong> pre-operatively — coagulopathy from vitamin K deficiency must be corrected before surgery.',
          '<strong>High-yield:</strong> <strong>Acholic stools</strong> = most specific sign; stool color card screening programs use this.',
          '<strong>High-yield:</strong> <strong>Triangular cord sign</strong> (>4 mm fibrous cone at porta hepatis) on USG = highly specific for BA.',
        ],
      },
    ],
    checklist: [
      'Definition: Obliterative cholangiopathy of extrahepatic (and intrahepatic) bile ducts - <strong>0.5M</strong>',
      'Classification: Type I (common bile duct), Type II (common hepatic duct), Type III (entire extrahepatic tree) - <strong>0.5M</strong>',
      'BASM syndrome: Polysplenia, situs inversus, malrotation, cardiac defects - <strong>0.5M</strong>',
      'Clinical: Progressive jaundice, acholic stools (most specific), dark urine, hepatomegaly - <strong>1M</strong>',
      'Investigations: Conjugated hyperbilirubinemia, high GGT, USG (triangular cord sign), HIDA scan (non-visualization), liver biopsy - <strong>1M</strong>',
      'Management: Kasai portoenterostomy <60 days (critical), post-op steroids + antibiotics, liver transplant for failure - <strong>1.5M</strong>',
      'Prognosis: 50-60% jaundice-free if <60 days; 80-90% survival with transplant - <strong>0.5M</strong>',
      'Examiner traps: Jaundice >14 days = pathological, conjugated vs unconjugated, timing of Kasai, BASM syndrome - <strong>0.5M</strong>',
      'Diagram/Flowchart - <strong>0.5M</strong>',
      'Neatness/Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 139: Biliary Atresia.',
    ],
  },
  {
    id: 'dka',
    shortTitle: 'DKA Management',
    patternStrength: 'Emerging',
    historicalFrequency: { appearances: 4, papersAnalyzed: 24, lastAppeared: '2024' },
    confidenceNote: 'Appeared in 4 of 411 questions (1.0%). Recent increase may reflect clinical relevance, but too early to call a stable pattern.',
    subject: 'Endocrinology',
    examType: 'Essay',
    question: 'A 6-year-old child with Type 1 DM presents with polyuria, polydipsia, vomiting, abdominal pain, and Kussmaul breathing. Discuss the management of diabetic ketoacidosis. (2+3+3+2=10)',
    marksBreakdown: 'Definition & Pathophysiology → 2M | Clinical Features & Diagnosis → 2M | Management → 4M | Monitoring & Complications → 2M',
    sections: [
      {
        title: '1. Definition & Pathophysiology',
        text: '<strong>Diabetic Ketoacidosis (DKA)</strong> is a life-threatening complication of Type 1 DM characterized by hyperglycemia (BG &gt;200 mg/dL), metabolic acidosis (pH &lt;7.30), and ketonemia/ketonuria.',
        list: [
          '<strong>Insulin deficiency</strong> → decreased glucose utilization → hyperglycemia → osmotic diuresis → dehydration + electrolyte losses.',
          '<strong>Lipolysis</strong> → increased free fatty acids → hepatic ketogenesis (beta-hydroxybutyrate, acetoacetate) → metabolic acidosis.',
          '<strong>Counter-regulatory hormones</strong> (glucagon, cortisol, catecholamines, growth hormone) further worsen hyperglycemia and ketosis.',
        ],
      },
      {
        title: '2. Clinical Features',
        list: [
          '<strong>Hyperglycemia symptoms:</strong> Polyuria, polydipsia, weight loss, dehydration (dry mucous membranes, poor skin turgor, tachycardia, hypotension)',
          '<strong>Acidosis symptoms:</strong> Kussmaul breathing (deep, rapid, sighing respirations), acetone breath (fruity odor)',
          '<strong>GI symptoms:</strong> Nausea, vomiting, abdominal pain (may mimic acute abdomen)',
          '<strong>CNS symptoms:</strong> Altered consciousness, lethargy, confusion, coma (cerebral edema - most feared complication)',
        ],
      },
      {
        title: '3. Management',
        list: [
          '<strong>Fluid Resuscitation:</strong> 0.9% NS 10-20 mL/kg over 1-2 hours (initial). Then 0.45-0.9% NS + dextrose. Replace deficit over 48 hours. Avoid overly rapid correction.',
          '<strong>Insulin:</strong> Regular insulin 0.05-0.1 U/kg/hr IV infusion. Start AFTER 1-2 hours of fluid resuscitation. Do NOT bolus. Continue until acidosis resolves (pH &gt;7.30, bicarbonate &gt;18).',
          '<strong>Potassium:</strong> Add 20-40 mEq/L once urine output confirmed and K+ &lt;5.5 mEq/L. Hold insulin if K+ &lt;3.3 mEq/L (risk of arrhythmia).',
          '<strong>Bicarbonate:</strong> Generally AVOIDED. May consider if pH &lt;6.9 with hemodynamic instability.',
          '<strong>Phosphate:</strong> Replace if &lt;1 mg/dL or cardiac dysfunction/hemolysis present.',
          '<strong>Dextrose:</strong> Add D5 or D10 when BG drops to 200-250 mg/dL. Continue insulin to clear ketosis.',
        ],
      },
      {
        title: '4. Monitoring & Complications',
        list: [
          '<strong>Monitoring:</strong> Blood glucose hourly, electrolytes and VBG every 2-4 hours, neuro checks hourly, fluid balance hourly, ECG monitoring.',
          '<strong>Cerebral Edema (most feared):</strong> Headache, bradycardia, hypertension, altered consciousness, seizures, pupillary changes. Treat with mannitol 0.5-1 g/kg or 3% hypertonic saline 5-10 mL/kg. Reduce fluid rate, elevate head.',
          '<strong>Hypoglycemia:</strong> Add dextrose to IV fluids.',
          '<strong>Hypokalemia:</strong> Aggressive K+ replacement.',
          '<strong>Resolution criteria:</strong> BG <200 mg/dL, pH >7.30, HCO3 >18 mEq/L, closed anion gap, ability to tolerate oral intake.',
        ],
      },
      {
        title: '🎯 Examiner Traps & High-Yield Points',
        list: [
          '<strong>Trap 1:</strong> Giving <strong>insulin bolus</strong> — NEVER bolus insulin in DKA; use continuous infusion 0.05-0.1 U/kg/hr ONLY. Bolus causes rapid osmotic shifts and cerebral edema.',
          '<strong>Trap 2:</strong> Starting insulin <strong>before fluids</strong> — insulin drives K+ intracellularly; if dehydrated, this worsens hypovolemia and can cause shock. Give fluids FIRST for 1-2 hours.',
          '<strong>Trap 3:</strong> Giving <strong>bicarbonate routinely</strong> — AVOID unless pH <6.9 with hemodynamic instability; bicarbonate can worsen cerebral edema and cause paradoxical CNS acidosis.',
          '<strong>Trap 4:</strong> Stopping insulin when glucose normalizes — <strong>continue insulin</strong> until acidosis resolves (pH >7.30, HCO3 >18), adding dextrose to prevent hypoglycemia.',
          '<strong>Trap 5:</strong> Forgetting <strong>potassium</strong> — DKA patients are TOTAL BODY K+ depleted despite normal/high serum K+. Add K+ once urine output is confirmed and K+ <5.5.',
          '<strong>Trap 6:</strong> Overly rapid fluid resuscitation — increases risk of <strong>cerebral edema</strong>; replace deficit over 48 hours, not 24.',
          '<strong>High-yield:</strong> <strong>Kussmaul breathing</strong> = deep, rapid, sighing respirations = respiratory compensation for metabolic acidosis.',
          '<strong>High-yield:</strong> <strong>Cerebral edema</strong> = most feared complication; treat with mannitol or 3% saline.',
          '<strong>High-yield:</strong> <strong>Serum K+ may be normal or high initially</strong> despite total body depletion — acidosis shifts K+ extracellularly.',
        ],
      },
    ],
    checklist: [
      'Definition: Hyperglycemia (BG >200) + Metabolic acidosis (pH <7.30) + Ketonemia/ketonuria - <strong>0.5M</strong>',
      'Pathophysiology: Insulin deficiency → hyperglycemia → lipolysis → ketogenesis → osmotic diuresis → dehydration + acidosis - <strong>1M</strong>',
      'Clinical: Polyuria, polydipsia, Kussmaul breathing, acetone breath, vomiting, abdominal pain, altered consciousness - <strong>1M</strong>',
      'Fluid: 0.9% NS 10-20 mL/kg over 1-2h, then 0.45-0.9% NS + dextrose; replace deficit over 48h - <strong>1M</strong>',
      'Insulin: 0.05-0.1 U/kg/hr IV after 1-2h of fluids; continue until acidosis resolves - <strong>1M</strong>',
      'Potassium: Add 20-40 mEq/L once urine output confirmed and K+ <5.5; hold insulin if K+ <3.3 - <strong>0.5M</strong>',
      'Bicarbonate: Avoid; only if pH <6.9 with hemodynamic instability - <strong>0.5M</strong>',
      'Cerebral edema: Most feared complication; mannitol or 3% saline, reduce fluids, elevate head - <strong>0.5M</strong>',
      'Monitoring: Glucose hourly, electrolytes/VBG every 2-4h, neuro checks hourly - <strong>0.5M</strong>',
      'Resolution: BG <200, pH >7.30, HCO3 >18, closed anion gap, oral tolerance - <strong>0.5M</strong>',
      'Examiner traps: No insulin bolus, fluids before insulin, no routine bicarbonate, continue insulin until acidosis resolves, K+ management - <strong>0.5M</strong>',
      'Diagram/Flowchart - <strong>0.5M</strong>',
      'Neatness/Structure - <strong>1M</strong>',
    ],
    references: [
      'Marcdante KJ, Kliegman RM. Nelson Essentials of Pediatrics. 8th ed. Philadelphia: Elsevier; 2019. Chapter 175: Diabetes Mellitus.',
    ],
  },
];
