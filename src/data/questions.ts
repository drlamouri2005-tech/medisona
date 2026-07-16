import { Question } from "../types";

export const SAMPLE_QUESTIONS: Question[] = [
  // --- YEAR 1: BASIC SCIENCES ---
  {
    id: "q_y1_anatomy_1",
    academicYear: "Year 2",
    unit: "Anatomie Topographique et Viscérale",
    module: "Anatomie Topographique et Viscérale",
    course: "Anatomie Viscérale du Thorax : Paroi, muscles intercostaux, poumons (segments), plèvre, médiastin antérieur/moyen (cœur configuration, valves, coronaires, péricarde), médiastin postérieur (œsophage, aorte descendante, azygos, trachée, nerf vague, phrénique).",
    text: "During a routine anatomical dissection, a medical student identifies a vascular structure running in the posterior interventricular sulcus of the heart. This vascular channel is most commonly a direct branch of which of the following vessels?",
    choices: [
      "Left circumflex artery",
      "Left anterior descending artery",
      "Right coronary artery",
      "Left marginal artery",
      "Coronary sinus"
    ],
    correctAnswer: 2, // Right coronary artery (commonly, in 85% right-dominant hearts)
    explanation: "In approximately 85% of the population, the heart is right-dominant, meaning the posterior interventricular artery (posterior descending artery, PDA) arises from the Right Coronary Artery (RCA). In 15% of individuals, the PDA arises from the left flex artery (left dominant or co-dominant). The PDA runs along the posterior interventricular sulcus to supply the posterior third of the interventricular septum.",
    examYear: "2022",
    sessionType: "Normal"
  },
  {
    id: "q_y1_histology_1",
    academicYear: "Year 1",
    unit: "Histologie & Embryologie Générale",
    module: "Histologie & Embryologie Générale",
    course: "Épithéliums de Revêtement : Critères de classification (couches, formes des cellules, différenciations apicales), endothéliums et mésothéliums.",
    text: "Biopsy of a smoker's respiratory tract reveals a transformation where the normal respiratory epithelium is replaced by stratified squamous epithelium. Which of the following cells represents the normal, predominant surface-lining cells of the human trachea?",
    choices: [
      "Simple squamous cells",
      "Simple columnar cells",
      "Pseudostratified ciliated columnar cells",
      "Transitional epithelial cells",
      "Stratified squamous non-keratinized cells"
    ],
    correctAnswer: 2, // Pseudostratified ciliated columnar cells
    explanation: "The normal lining of the human trachea and large airways is pseudostratified ciliated columnar epithelium (respiratory epithelium) with goblet cells. In response to chronic irritation like cigarette smoke, these cells can undergo squamous metaplasia, transitioning into stratified squamous epithelium which is more resilient to irritation but loses ciliary clearance capability.",
    examYear: "2023",
    sessionType: "Rattrapage"
  },

  // --- YEAR 2: PHYSIOLOGY & STANDALONE MICROBIOLOGY/IMMUNOLOGY ---
  {
    id: "q_y2_physio_1",
    academicYear: "Year 2",
    unit: "Physiologie Humaine (Grandes Fonctions)",
    module: "Physiologie Humaine (Grandes Fonctions)",
    course: "Physiologie Rénale : Néphron, filtration glomérulaire (barrière, DFG, autorégulation), fonctions tubulaires (TCP réabsorption glucose, anse de Henle/NKCC2/contre-courant, TCD/Aldostérone/ADH, équilibre acido-basique/excrétion H+).",
    text: "A 24-year-old student is participating in a metabolic water-loading study. Under the maximum action of Antidiuretic Hormone (ADH) / Vasopressin, which anatomical segment of the nephron reabsorbs the greatest absolute volume of water?",
    choices: [
      "Proximal convoluted tubule",
      "Descending limb of the loop of Henle",
      "Ascending limb of the loop of Henle",
      "Distal convoluted tubule",
      "Medullary collecting duct"
    ],
    correctAnswer: 0, // Proximal convoluted tubule
    explanation: "Although ADH exerts its dynamic physiological control over water permeability in the collecting duct, the Proximal Convoluted Tubule (PCT) is always the segment where the greatest absolute volume of water is reabsorbed (roughly 65-70% of filtered water), occurring isotonically and regardless of the hydration state or ADH concentration.",
    examYear: "2022",
    sessionType: "Normal"
  },
  {
    id: "q_y2_micro_1",
    academicYear: "Year 3",
    unit: "Microbiologie",
    module: "Microbiologie",
    course: "Bactériologie Générale",
    text: "A 45-year-old construction worker presents with a deep, dirty puncture wound on his right foot. He experiences jaw stiffness and severe muscle spasms. The causative organism is a Gram-positive, anaerobic, spore-forming bacillus. What is the primary mechanism of action of the toxin responsible for his condition?",
    choices: [
      "ADP-ribosylation of Elongation Factor 2",
      "Cleavage of SNARE proteins inhibiting GABA and glycine release",
      "Activation of adenylate cyclase leading to high cAMP",
      "Inhibition of acetylcholinesterase at the neuromuscular junction",
      "Superantigen binding to MHC Class II and T-cell receptor"
    ],
    correctAnswer: 1, // Cleavage of SNARE proteins
    explanation: "The patient presents with tetanus caused by Clostridium tetani. The neurotoxin tetanospasmin is protease-cleaved and travels retrogradely up motor neurons to the spinal cord. It cleaves synaptobrevin (a SNARE protein) in inhibitory interneurons, preventing the release of GABA and glycine (inhibitory neurotransmitters), which results in continuous motor neuron firing, rigid paralysis, and lockjaw.",
    examYear: "2021",
    sessionType: "Normal"
  },
  {
    id: "q_y2_immuno_1",
    academicYear: "Year 3",
    unit: "Immunologie clinique",
    module: "Immunologie",
    course: "Pathologies du Système Immunitaire",
    text: "Within 15 minutes of receiving an intravenous dose of penicillin, a 30-year-old female develops diffuse urticaria, wheezing, and laryngeal edema. Which of the following immunological components is primarily responsible for triggering this acute reaction?",
    choices: [
      "IgG binding to basement membrane antigens",
      "IgE-mediated cross-linking on mast cells and basophils",
      "Immune-complex deposition in blood vessel walls",
      "CD8+ T-lymphocyte destruction of allergen-laden tissue",
      "Complement activation via the alternative pathway"
    ],
    correctAnswer: 1, // IgE-mediated cross-linking
    explanation: "This is a classic Type I (immediate) hypersensitivity reaction. Penicillin acts as a hapten, binding to self-proteins and prompting IgE production in sensitized individuals. Upon subsequent exposure, antigen cross-links specific IgE molecules bound to high-affinity Fc-epsilon receptors on mast cells and basophils, resulting in immediate degranulation and release of histamine, tryptase, and leukotrienes.",
    examYear: "2023",
    sessionType: "Normal"
  },

  // --- YEAR 3: CLINICAL PATHOLOGY ---
  {
    id: "q_y3_cardio_1",
    academicYear: "Year 3",
    unit: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
    module: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
    course: "Sémiologie & Physiopathologie Cardiovasculaire : Signes fonctionnels (dyspnée NYHA, douleur thoracique/angor/IDM/péricardite/dissection, palpitations, syncopes/lipothymies), examen physique (bruits B1/B2/B3/B4/galop, souffles, clics, roulements), examen périphérique (pouls, PA, HTA, hypotension, insuffisance artérielle, TVP/signe de Homans), physiopathologie (insuffisance cardiaque gauche/droite, états de choc), explorations (ECG pathologique/hypertrophies/ischémie/nécrose, radio thorax/index cardio-thoracique/surcharge/Kerley, écho Doppler).",
    text: "A 72-year-old man presents with progressive exertional dyspnea, angina, and a transient syncopal episode during a brisk walk. Physical examination reveals a harsh crescendodecrescendo systolic murmur at the right upper sternal border that radiates to the carotid arteries. Which of the following is the most likely diagnosis?",
    choices: [
      "Mitral valve prolapse",
      "Aortic regurgitation",
      "Mitral stenosis",
      "Aortic stenosis",
      "Tricuspid regurgitation"
    ],
    correctAnswer: 3, // Aortic stenosis
    explanation: "The classic triad of aortic stenosis is SAD (Syncope, Angina, Dyspnea) on exertion. The physical exam finding is a harsh crescendo-decrescendo systolic murmur at the right second intercostal space (right upper sternal border) with radiation to the carotids. Causes include age-related calcification or a congenital bicuspid valve.",
    examYear: "2022",
    sessionType: "Normal"
  },
  {
    id: "q_y3_pulm_1",
    academicYear: "Year 3",
    unit: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
    module: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
    course: "Sémiologie & Physiopathologie Respiratoire : Signes fonctionnels & physiques (dyspnée bradypnée, toux, expectoration/hémoptysie, douleur pleurale, V.V., percussion matité/tympanisme, râles crépitants/sibilants/ronchus, frottement pleural), syndromes cliniques (condensation, pleurésie/épanchement liquidien, pneumothorax/épanchement gazeux, cavitation), physiopathologie (insuffisance respiratoire/effet shunt/diffusion, asthme, SDRA), explorations (radio opacités/hyperclartés, EFR obstructive/restrictive/Tiffeneau).",
    text: "A 58-year-old female with a 40 pack-year smoking history presents with chronic productive cough for the past three years. Pulmonary function tests show an FEV1/FVC ratio of 0.55. Histological assessment of her bronchus would most likely show an increase in which of the following parameters?",
    choices: [
      "Alveolar wall destruction",
      "Reid Index (mucous gland thickness to total bronchial wall thickness)",
      "Eosinophilic infiltration of the subepithelium",
      "Intrabronchial blood vessel diameter",
      "Elastic tissue elasticity in the visceral pleura"
    ],
    correctAnswer: 1, // Reid Index
    explanation: "The patient's presentation of chronic productive cough for at least 3 months in 2 consecutive years is diagnostic of Chronic Bronchitis. The hallmark pathological finding is mucous gland hyperplasia in the trachea and bronchi, quantified by an increased Reid Index (mucous gland thickness / total wall thickness excluding cartilage; normal is < 0.4).",
    examYear: "2024",
    sessionType: "Normal"
  },

  // --- YEAR 4: SPECIALTIES I ---
  {
    id: "q_y4_neuro_1",
    academicYear: "Year 4",
    unit: "Systemic Pathology II",
    module: "Neurology",
    course: "Cerebrovascular Disease",
    text: "A 68-year-old male with untreated atrial fibrillation presents to the emergency room with sudden-onset weakness in his left leg and foot, along with urinary incontinence. Neurological examination reveals decreased sensation over the left lower extremity. Which artery is most likely occluded?",
    choices: [
      "Right middle cerebral artery",
      "Right anterior cerebral artery",
      "Right posterior cerebral artery",
      "Left middle cerebral artery",
      "Basilar artery"
    ],
    correctAnswer: 1, // Right anterior cerebral artery
    explanation: "The anterior cerebral artery (ACA) supplies the medial aspect of the cerebral hemisphere, which corresponds to the homunculus representation of the lower extremity and pelvic organs (bladder control). ACA occlusion leads to contralateral leg/foot motor and sensory deficits, frequently accompanied by urinary incontinence.",
    examYear: "2022",
    sessionType: "Rattrapage"
  },
  {
    id: "q_y4_peds_1",
    academicYear: "Year 4",
    unit: "Systemic Pathology II",
    module: "Pediatrics",
    course: "Neonatal Care",
    text: "A newborn is evaluated 1 minute after birth. She is crying vigorously with pink extremities and body. Her pulse is 115 beats/minute. When her nasal cavity is suctioned, she grimaces and coughs. Her arms and legs are flexed and resisting extension. What is this child's APGAR score at 1 minute?",
    choices: [
      "10",
      "9",
      "8",
      "7",
      "6"
    ],
    correctAnswer: 0, // APGAR score 10
    explanation: "The APGAR components are: Appearance (2 for all pink), Pulse (2 for >100 bpm), Grimace (2 for crying, grimace, cough on suction), Activity (2 for active motion/flexion), and Respiration (2 for strong cry). Since all 5 parameters scored maximum points, the total APGAR score is 10.",
    examYear: "2023",
    sessionType: "Normal"
  },

  // --- YEAR 5: SPECIALTIES II ---
  {
    id: "q_y5_obgyn_1",
    academicYear: "Year 5",
    unit: "Clinical Specialties",
    module: "Gynecology-Obstetrics",
    course: "Pregnancy Disorders",
    text: "A 28-year-old primigravida at 34 weeks of gestation presents with a headache and visual disturbances. Her blood pressure is 165/110 mmHg. Urinalysis reveals 4g of protein in a 24-hour collection. Which of the following is the most appropriate immediate medical agent to administer to prevent seizures?",
    choices: [
      "Diazepam",
      "Phenytoin",
      "Magnesium Sulfate",
      "Labetalol",
      "Nifedipine"
    ],
    correctAnswer: 2, // Magnesium Sulfate
    explanation: "The patient meets the criteria for preeclampsia with severe features (BP >160/110, severe headache, proteinuria, visual changes). The first-line agent used for seizure prophylaxis in preeclampsia is intravenous Magnesium Sulfate. Antihypertensives (such as Labetalol or Hydralazine) are used to manage blood pressure, but do not prevent seizures as effectively as magnesium sulfate.",
    examYear: "2021",
    sessionType: "Normal"
  },
  {
    id: "q_y5_psych_1",
    academicYear: "Year 5",
    unit: "Clinical Specialties",
    module: "Psychiatry",
    course: "Mood Disorders",
    text: "A 32-year-old male is diagnosed with Major Depressive Disorder and started on a selective serotonin reuptake inhibitor (SSRI). He must be counseled that clinical improvement is typically expected to begin after what minimum duration of continuous therapy?",
    choices: [
      "12 to 24 hours",
      "3 to 5 days",
      "4 to 6 weeks",
      "6 months",
      "1 year"
    ],
    correctAnswer: 2, // 4 to 6 weeks
    explanation: "While biochemical effects of SSRIs (inhibiting serotonin reuptake) occur immediately, full therapeutic clinical improvement in mood and interest typically requires 4 to 6 weeks of continuous daily compliance. This delay is believed to be due to downstream neuroplasticity, receptor downregulation (such as 5-HT1A auto-receptors), and brain-derived neurotrophic factor (BDNF) upregulation.",
    examYear: "2022",
    sessionType: "Normal"
  },

  // --- YEAR 6: CLINICAL PRACTICE ---
  {
    id: "q_y6_em_1",
    academicYear: "Year 6",
    unit: "Clinical Practice",
    module: "Emergency Medicine",
    course: "Anaphylaxis Management",
    text: "A 25-year-old medical student is rushed to the emergency bay after being stung by a bee during lunch. He is hypotensive (80/45 mmHg), tachycardic (120 bpm), has audible wheezing, and is covered in diffuse urticaria. What is the most appropriate first-line treatment, route, and anatomical site of administration?",
    choices: [
      "Epinephrine 1:1000, subcutaneous in the upper arm",
      "Epinephrine 1:1000, intramuscular in the anterolateral thigh",
      "Epinephrine 1:10000, intravenous bolus in the antecubital vein",
      "Diphenhydramine, intravenous slow push in any peripheral vein",
      "Methylprednisolone, intramuscular in the gluteus maximus"
    ],
    correctAnswer: 1, // Epinephrine 1:1000, IM anterolateral thigh
    explanation: "The immediate first-line intervention for anaphylaxis is Epinephrine (1:1000 dilution) administered intramuscularly (IM) in the anterolateral thigh (vastus lateralis muscle). This site has the fastest and most reliable absorption profile compared to subcutaneous injection or the deltoid muscle. Antihistamines and corticosteroids are adjunctive therapies and should never delay epinephrine.",
    examYear: "2024",
    sessionType: "Normal"
  },
  {
    id: "q_y6_gp_1",
    academicYear: "Year 6",
    unit: "Clinical Practice",
    module: "General Practice",
    course: "Chronic Hypertension",
    text: "A 55-year-old male with a history of Type 2 Diabetes Mellitus is found to have a blood pressure of 145/92 mmHg on three separate clinic visits. Urinalysis reveals microalbuminuria. Which of the following antihypertensive drug classes should be initiated as first-line therapy for this patient?",
    choices: [
      "Loop diuretics",
      "Beta-blockers",
      "Calcium channel blockers",
      "Angiotensin-converting enzyme (ACE) inhibitors",
      "Alpha-1 adrenergic antagonists"
    ],
    correctAnswer: 3, // ACE inhibitors
    explanation: "In diabetic patients with hypertension, particularly those with evidence of diabetic nephropathy (such as microalbuminuria), Angiotensin-Converting Enzyme (ACE) inhibitors (or Angiotensin II Receptor Blockers, ARBs) are preferred first-line agents. They offer a renal protective effect by dilating the efferent arteriole in the kidney glomerulus, which reduces intraglomerular pressure and slows the progression of diabetic nephropathy.",
    examYear: "2022",
    sessionType: "Normal"
  }
];
