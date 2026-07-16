import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";

// Load environment variables
dotenv.config();

// Lazy initialization of the Gemini AI client to prevent crash if key is missing on startup
let aiInstance: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please set it in your environment/secrets.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Robust helper to perform automatic retries and model fallbacks for 503 or demand errors
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: any,
  primaryModel: string = "gemini-3.5-flash",
  fallbackModels: string[] = ["gemini-3.1-flash-lite", "gemini-flash-latest"]
) {
  const modelsToTry = [primaryModel, ...fallbackModels];
  let lastError: any = null;
  
  for (const model of modelsToTry) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[AI-Server] Trying model: ${model} (Attempt ${attempt}/${maxAttempts})`);
        // Copy params and enforce model name
        const queryParams = {
          ...params,
          model
        };
        const response = await ai.models.generateContent(queryParams);
        console.log(`[AI-Server] Successfully generated content using model: ${model} on attempt ${attempt}`);
        return response;
      } catch (err: any) {
        console.error(`[AI-Server] Error with model ${model} (Attempt ${attempt}/${maxAttempts}):`, err);
        lastError = err;
        
        const errorMessage = String(err.message || err.status || err.code || "").toLowerCase();
        const isUnavailable = 
          errorMessage.includes("unavailable") || 
          errorMessage.includes("503") || 
          errorMessage.includes("demand") || 
          errorMessage.includes("resource_exhausted") || 
          errorMessage.includes("429") || 
          errorMessage.includes("exhausted") ||
          errorMessage.includes("limit") ||
          err.status === "UNAVAILABLE" ||
          err.code === 503;
          
        if (isUnavailable && attempt < maxAttempts) {
          const delay = attempt * 1500; // progressive backoff: 1500ms, 3000ms
          console.warn(`[AI-Server] Model ${model} is experiencing transient constraints (503/429). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // If not retriable, or we've exhausted attempts for this model, break the retry loop and try the next fallback model
          break;
        }
      }
    }
  }
  
  throw lastError || new Error("Failed to generate content with all available Gemini models.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: "15mb" }));

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Medical Learning Platform API is online" });
  });

  // Secure Gemini AI QCM File Parser
  app.post("/api/admin/parse-questions", async (req, res) => {
    try {
      const { 
        textContent, 
        overrideAcademicYear, 
        overrideExamYear, 
        overrideSessionType, 
        overrideModule, 
        overrideCourse,
        knownCourses
      } = req.body;

      if (!textContent || typeof textContent !== "string") {
        return res.status(400).json({ error: "textContent is required as a string in the body" });
      }

      const ai = getAIClient();

      let systemInstruction = `You are a specialized full-stack medical data parsing agent. Your sole purpose is to classify, tokenize, and map medical MCQs (QCMs) into a normalized PostgreSQL database structured strictly around the official Algerian Medical Curriculum. 

You must evaluate incoming clinical vignettes, question stems, and answer keys, and output a validated JSON payload mapping the item to its precise educational taxonomy without altering, combining, or inventing structural modules or units.

---

# STRICT ARCHITECTURE ENFORCEMENT RULES (CRITICAL)
1. **No Synthetic Units/Modules:** You are strictly forbidden from creating generic or blended modules (e.g., merging respiratory semiology and cardiac semiology into a single tracking entity unless explicitly stated by the curriculum layout). 
2. **Absolute Year Separation:** Each year (Y3, Y4, Y5, Y6) contains its own specific, isolated modules and units. Never cross-contaminate topics. For example, Sémiologie Cardiaque belongs exclusively to its designated module context and must never be lumped with unrelated semiologies on the dashboard tracking layer.
3. **Database Integrity:** Dashboard rendering depends on exact string and code matches. A single hallucinated module name or incorrect grouping code will corrupt user metrics and progress dashboards. Follow the matrix below with 100% literal compliance.

---

# DATABASE SCHEMA & SYSTEM ARCHITECTURE
Every question must be assigned to exactly one target location within the following relational taxonomy:

## 1. Cycle (Level 0)
*   'ID: PC' | Clinical Cycle (Cycle Clinique)

## 2. Year / Année (Level 1)
*   'ID: Y3' | 3rd Year (Troisième Année)
*   'ID: Y4' | 4th Year (Quatrième Année)
*   'ID: Y5' | 5th Year (Cinquième Année)
*   'ID: Y6' | 6th Year (Sixième Année)

## 3. Modules & Units (Levels 2 & 3)
Questions must map to a specific Module, and where specified, to a distinct structural Sub-Module or Unit (e.g., Module I vs. Module II in 6th year, or Anatomie Pathologique vs. Pathologie Clinique in Gynécologie).

---

# MASTER CURRICULUM TAXONOMY MATRIX

### THIRD YEAR (Y3)
*   **MODULE: CHIRURGIE GENERALE (CHIR_GEN)**
    *   *Topics:* Fundamental surgical principles, asepsis, basic surgical pathologies.
*   **MODULE: SEMIOLOGIE MEDICALE & CHIRURGICALE (SEM_MED_CHIR)**
    *   *Topics:* Strict clinical semiology divided precisely by distinct systems (Cardiovascular, Respiratory, Digestive, etc.). Do not group distinct system semiologies under synthetic parent blocks.
*   **MODULE: ANATOMIE PATHOLOGIQUE (ANAPATH_G3)**
    *   *Topics:* General histopathology, cellular lesions, inflammation, tumors.
*   **MODULE: IMMUNOLOGIE FONDAMENTALE (IMMU_FOND)**
    *   *Topics:* Immune system components, innate and adaptive immunity, hypersensitivity.
*   **MODULE: MICROBIOLOGIE & VIROLOGIE (MICRO_VIR)**
    *   *Topics:* Bacteriology fundamentals, viral classification, replication, diagnostic methods.
*   **MODULE: PARASITOLOGIE & MYCOLOGIE (PARA_MYCO)**
    *   *Topics:* Parasitic cycles, protozoa, helminths, medical mycology.
*   **MODULE: PHARMACOLOGIE CLINIQUE (PHARMA_CLIN)**
    *   *Topics:* Pharmacokinetics, pharmacodynamics, major therapeutic classes.
*   **MODULE: PHYSIOPATHOLOGIE GENERALE (PHYSIOPATH_GEN)**
    *   *Topics:* Functional systemic disruptions, homeostatic imbalances.

### FOURTH YEAR (Y4)
*   **MODULE: CARDIOLOGIE (CARD)**
    *   *Topics:* Sémiologie cardiaque, Insuffisance cardiaque, Rétrécissement mitral, Insuffisance mitrale, Rétrécissement aortique, Insuffisance aortique, Cardiopathies congénitales, Endocardite infectieuse, Rhumatisme articulaire aigu (RAA), Péricardites aiguës, Angine de poitrine, Infarctus du myocarde (IDM), Troubles du rythme, Troubles de la conduction, Hypertension artérielle (HTA), Cœur pulmonaire chronique (CPC), Artériopathies oblitérantes des membres inférieurs (AOMI), Phlébites et embolie pulmonaire, Arrêt cardio-circulatoire, Myocardiopathies, Médicaments en cardiologie.
*   **MODULE: PNEUMOLOGIE (PNEU)**
    *   *Topics:* Sémiologie respiratoire, Imagerie thoracique, Insuffisance respiratoire chronique, Exploration fonctionnelle respiratoire (EFR), Asthme, Broncho-pneumopathie chronique obstructive (BPCO), Dilatation des bronches (DDB), Pneumopathies aiguës bactériennes, Pneumopathies virales et atypiques, Abcès du poumon, Tuberculose pulmonaire (commune, primo-infection, miliaire), Épanchements pleuraux liquides (pleurésies), Épanchements pleuraux gazeux (pneumothorax), Cancer broncho-pulmonaire, Tumeurs du médiastin, Suppurations pleurales, Pathologies professionnelles respiratoires.
*   **MODULE: GASTRO-ENTEROLOGIE (GASTRO)**
    *   *Topics:* Sémiologie digestive, Pathologie de l'œsophage, RGO, Ulcère gastro-duodénal (UGD), Gastrites, Tumeurs gastriques, Diarrhées chroniques, Malabsorption, Maladies inflammatoires chroniques de l'intestin (MICI - Crohn, RCH), Tumeurs du côlon et du rectum, Appendicite aiguë, Péritonites aiguës, Occlusions intestinales, Pathologie rectale et anale, Hépatites aiguës et chroniques, Cirrhoses et complications, Tumeurs du foie, Lithiase biliaire, Cholécystite, Angiocholite, Pancréatites aiguës et chroniques, Tumeurs du pancréas.
*   **MODULE: NEUROLOGIE (NEURO)**
    *   *Topics:* Sémiologie neurologique, Céphalées et migraines, Épilepsies de l'adulte, Accidents vasculaires cérébraux (AVC), Méningites et encéphalites, Sclérose en plaques (SEP), Maladie de Parkinson, Syndromes parkinsoniens, Compression médullaire non traumatique, Pathologie du système nerveux périphérique, Myopathies et myasthénie, Tumeurs cérébrales, Traumatismes crâniens, Démences.
*   **MODULE: INFECTIEUX (INF)**
    *   *Topics:* Sémiologie des maladies infectieuses, Physiopathologie de la fièvre, Antibiothérapie générale, Septicémies, Fièvre typhoïde, Brucellose, Choléra, Dysenterie bacillaire, Amibiase, Paludisme, Rage, Tétanos, Grippe, Éruptions cutanées fébriles (Rougeole, Rubéole, Varicelle), Hépatites virales, Toxi-infections alimentaires, SIDA et infection par le VIH, Méningites purulentes et à liquide clair.
*   **MODULE: HEMATOLOGIE (HEM)**
    *   *Topics:* Hématopoïèse, Hémostase et coagulation, Anémies carrentielles (martiale, mégaloblastique), Anémies hémolytiques constitutionnelles et acquises, Insuffisance médullaire (Aplasie), Leucémies aiguës, Syndromes myéloprolifératifs (LMC, Vaquez), Syndromes lymphoprolifératifs (LLC, Myélome), Lymphome de Hodgkin, Lymphomes non-hodgkiniens, Purpuras et thrombopénies, Hémophilie, Transfusion sanguine et immuno-hématologie.
*   **MODULE: INFECTIEUX-CHIRURGIE-ORTHOPEDIE (ICO)**
    *   *Topics:* Hydatidose (Kyste hydatique du foie/poumon), Généralités sur les fractures et luxations, Fracture de l'extrémité supérieure du fémur, Fracture de l'extrémité inférieure du fémur, Ostéomyélites, Pied bot, Traumatisme de la cheville, Tumeurs osseuses, Lésions nerveuses périphériques, Cal osseux, Fractures de la jambe, Fracture des os de l'avant-bras, Traumatismes des os de la main.

### FIFTH YEAR (Y5)
*   **MODULE: RHUMATOLOGIE (RHUMA)**
    *   *Topics:* Généralités sur les arthrites rhumatoïdes, Algodystrophie, Rhumatisme aseptique, Rhumatisme septique, Goutte, Arthrose, Mal de pott, Épaule douloureuse, Ostéoporose, Ostéomalacie, Polyarthrite rhumatoïde (PR), Spondylarthrite ankylosante (SPA), Bilan articulaire et applications.
*   **MODULE: UROLOGIE-NEPHROLOGIE (URONEPH)**
    *   *Topics:* Exploration de l'appareil urinaire, Contusion rénale, Hématurie, Glomérulo-néphrites, Néphropathie glomérulaire I et II, Néphropathie interstitielle I et II, Néphropathie héritée et congénitale, Complication urinaire des fractures du bassin, Tumeur des testicules, Troubles de la miction, Cancer du rein, Insuffisance rénale aiguë (IRA), Insuffisance rénale chronique (IRC), Tumeur de la vessie, La grosse bourse, Tumeur prostatique, Protéinurie, Diagnostic des gros reins, Rein et hypertension artérielle, Rein et médicaments, Lithiase urinaire, Malformation congénitale de l'appareil urinaire, Conduite à tenir devant une cystite, Conduite à tenir devant une pyurie, Conduite à tenir devant une rétention vésicale aiguë, Conduite à tenir devant une crise de colique néphrétique, Tuberculose urinaire.
*   **MODULE: ENDOCRINOLOGIE (ENDO)**
    *   *Topics:* Contrôle du système endocrinien, Formes cliniques du diabète sucré, Complications du diabète sucré, Traitement du diabète sucré, Hypoglycémies, Diabète insipide, Thyroïde (sécrétion, régulation, exploration, hypothyroïdies, hyperthyroïdies et goitres simples, cancers de la thyroïde, thyroïdites), Parathyroïde (sécrétion, régulation, exploration, hyperparathyroïdie, hypoparathyroïdie), Antéhypophyse, Posthypophyse, Tumeurs hypophysaires, Nutrition et régimes, Pathologies testiculaires, Obésité, Dyslipidémies, Glande surrénale (sécrétion, régulation, exploration, hypercorticisme métabolique, insuffisance surrénale, hypercorticisme androgénique), Métabolisme phosphocalcique, Métabolisme intermédiaire, Adénomatoses polyendocriniennes, Anatomie pathologique endocrinienne (I et II).
*   **MODULE: PEDIATRIE (PED)**
    *   *Topics:* Nouveau-né normal, Développement psychomoteur, Croissance, Asthme, Allergie respiratoire, Tuberculose, Détresse respiratoire, Pneumopathie bactérienne, Rhumatisme articulaire aigu (RAA), Cardiopathie congénitale, Insuffisance cardiaque, Ictère du nouveau-né, Infection du nouveau-né, Tumeurs abdominales, Urgences chirurgicales pédiatriques, Diarrhées chroniques, Vomissement, Diarrhée aiguë et déshydratation, Gastro-entérites infantiles, Hépato-splénomégalies, Diététique (I, II, III), Malnutrition, Rachitisme, Syndromes néphrotiques, Glomérulo-néphrite aiguë, Infections urinaires, Adénopathies, Syndrome hémorragique, Anémie carentielle, Anémie hémolytique, Diabète, Hypothyroïdie, Méningite, Convulsion et épilepsie, Kala-Azar, Rhumatisme chronique, Dermatoses pédiatriques, Vaccination, Les médicaments en pédiatrie, L'orthopédie en pathologie pédiatrique, Tumeurs malignes, Formation médico-sociale.
*   **MODULE: GYNECOLOGIE-OBSTETRIQUE (GYNECO)**
    *   *Sub-Unit: GYNECO_ANAPATH* (Anatomie Pathologique)
        *   *Topics:* Endométriose, Tumeurs du col, Tumeurs du corps, Tumeurs de l'ovaire, Maladie trophoblastique, Tumeurs du sein.
    *   *Sub-Unit: GYNECO_CLINIQUE* (Pathologies Cliniques)
        *   *Topics:* Le cycle menstruel et ovarien, Diagnostic de grossesse, Surveillance post-partum, Les avortements, Les hémorragies du 3ème trimestre, Mécanisme général de l'accouchement, Délivrance normale et pathologique, Pathologie des suites de couches, La grossesse gémellaire, Présentation du front, Présentation de face, Présentation du sommet, Présentation du siège, Présentation transversale, Grossesse extra-utérine (GEU), Hémorragie de la délivrance, Menace d'accouchement prématuré (MAP), Souffrance fœtale aiguë et chronique, Grossesse molaire, Le placenta (I et II), Mort in-utéro, Aménorrhée (I et II), Dépassement de terme, Maladies infectieuses au cours de la grossesse, Salpingite aiguë, L'éclampsie, Grossesse et HTA, Grossesse et diabète, Cardiopathie et grossesse, Tuberculose génitale, Immunisation sanguine fœto-maternelle, Contraception, Stérilité du couple, Ménopause, Malformations utérines, Fibrome utérin, Endométriose, Cancer de l'endomètre, Cancer de l'ovaire, Cancer du col de l'utérus, Tumeur du sein.
*   **MODULE: PSYCHIATRIE (PSY)**
    *   *Topics:* Généralités sur la psychiatrie, L'examen clinique en psychiatrie, Les urgences en psychiatrie, Psychoses, Les névroses, États dépressifs, Les états démentiels, Confusion mentale, Psychiatrie de l'enfant et de l'adolescent, Le délire chronique, Les psychotropes, Thérapeutique en psychiatrie, Troubles mentaux révélateurs d'affections organiques, Troubles du sommeil, Relation médecin-malade, La vie sexuelle et ses perturbations, Psychiatrie médico-légale et législation.

### SIXIETH YEAR (Y6)
*   **MODULE: ORL (ORL)**
    *   *Topics:* Pathologie de l'oreille externe, Otite muqueuse, Otites moyennes aiguës et chroniques, Mastoïdites aiguës, Complication des oto-mastoïdites, Surdités de transmission, Surdités de perception, Vertiges et syndromes labyrinthiques, Cancer amygdalien et cancer de la langue, Cancer du cavum, Cancer bucco-laryngé, Angines et complications, Amygdalite chronique, Rhinopharyngite aiguë et chronique, Sinusites aiguë et chronique, Épistaxis, Syndrome d'obstruction nasale, Paralysies laryngées, Cancer du larynx, Dyspnée laryngée, Pathologie des glandes salivaires, Adénopathies et tumeurs cervicales, Traumatisme de l'étage moyen de la face.
*   **MODULE: OPHTALMOLOGIE (OPHTA)**
    *   *Topics:* Anatomie de l'œil, Examen du malade, Causes de cécité, Le trachome, L'œil rouge, Les glaucomes, Vices de réfractions, Manifestations oculaires des maladies générales, Troubles de la mobilité oculaire, Maladies des paupières et des voies lacrymales, Traumatisme oculaire, Thérapeutiques oculaires.
*   **MODULE: DERMATOLOGIE (DERMATO)**
    *   *Topics:* Psoriasis, Lichen plan, Pyodermites, impétigo, acné, Urticaire, prurit et prurigo, Zona, Herpes, Aphtes, Eczéma et traitement de l'eczéma, Épithéliomas cutanés, Parasitoses cutanées, Teignes, épidermomycoses, Dyschromies, Alopécie, Blennorragies, Ulcère de jambes, varices.
*   **MODULE: MODULE I - THERAPEUTIQUE ET URGENCES (MOD_URG)**
    *   *Sub-Unit: MOD_URG_THER* (Thérapeutique)
        *   *Topics:* Évolution du concept de thérapeutique, Interactions médicamenteuses, Notion de méthodologie des essais thérapeutiques, Médicaments de l'appareil digestif, Bases du traitement de la douleur, Règles de prescription en chimiothérapie anti-infectieuse, Règles de prescription en corticothérapie, Règles de prescription des antidiabétiques, Médication cardio-vasculaire, Anti-inflammatoires non stéroïdiens (AINS), Médication broncho-pulmonaire, Règles de prescription des neuroleptiques et tranquillisants, Ateliers-Ordonnance, Principes thérapeutiques au cours de l'insuffisance rénale, Principes thérapeutiques au cours de l'insuffisance hépatique, Principes thérapeutiques au cours de la grossesse et de l'allaitement, Principes thérapeutiques chez le sujet âgé, Vaccinations, Introduction aux méthodes thérapeutiques non médicamenteuses.
    *   *Sub-Unit: MOD_URG_CLIN* (Urgences)
        *   *Topics:* Organisation des activités de médecine d'urgence, la trousse d'urgence, SAMU/Urgences, transport médicalisé, Réanimation cardio-respiratoire (RCR), Comas et pertes de connaissance, Hémorragies aiguës, anémies aiguës, Polytraumatisés et polyfracturés, États de choc, Hyperthermies, hypothermies, états septiques, Douleurs abdomino-pelviennes aiguës, Douleurs thoraciques aiguës, Douleurs aiguës des membres (ischémie aiguë, TVP, gangrène), Dyspnées aiguës, Œdème aigu du poumon (OAP), Intoxications aiguës, Convulsions, mouvements anormaux, États d'agitation, Céphalées aux urgences, Brûlures étendues, Insuffisance rénale aux urgences, Urgences hypertensives, Anuries, rétention aiguë des urines, Urgences néonatales, Morsures et envenimations, Déshydratation aiguë.
*   **MODULE: MODULE II - SANTE PUBLIQUE ET ETHIQUE (MOD_SANTE)**
    *   *Sub-Unit: MOD_SANTE_DROIT* (Droit médical, déontologie et Éthique Médicale)
        *   *Topics:* La réquisition, La responsabilité professionnelle du médecin/étudiant/interne, Les actes à caractère médico-légal, Rapports avec les institutions nationales/internationales, Code de la santé publique, Code de déontologie médicale, La grève de la faim, Prélèvement et transplantation d'organes, Rédaction des documents médicaux, Règles de prescription, Assistance médicale à la procréation (AMP), Euthanasie, Secret médical, Déclaration des droits de l'homme, Convention des droits de l'enfant, Loi sanitaire environnement, L'acte médical, Les règles de l'éthique.
    *   *Sub-Unit: MOD_SANTE_ECON* (Économie de la santé et Organisation du Système de santé)
        *   *Topics:* Introduction à l'économie de la santé, Facteurs de la consommation médicale, Lutte contre la croissance des dépenses de santé, Financement des dépenses de soins, Systèmes de santé dans le monde, Organisation du système de santé en Algérie, Analyse des besoins de la santé, Évaluation de la quantité de soins, La sécurité sociale, Planification de santé et approche par programme.
    *   *Sub-Unit: MOD_SANTE_PSYCHO* (Psychologie Médicale)
        *   *Topics:* Objet et méthodes de la psychologie, Développement de la personnalité, Grandes étapes de la vie, Fonctionnement mental, Sens et fonction de la maladie, Maladies iatrogènes et effet placebo, Principes de psychosomatique, Réactions psychologiques à la maladie aiguë/chronique, Psychologie médicale en Pédiatrie / Gériatrie, Réactions psychologiques aux stress / techniques médicales / cancer / hospitalisation, Psychologie de la douleur, Accompagnement du mourant, Relation médecin-malade, Introduction au groupe BALINT, Fonction et rôles socioculturels du médecin.
*   **MODULE: MEDECINE DE TRAVAIL (MED_TRAV)**
    *   *Topics:* Introduction à la médecine du travail, Les maladies professionnelles, Les accidents du travail, Le benzolisme, L'hydrargyrisme, La visite d'embauche, Pathologie hospitalière, Le saturnisme, Les mines, Les pneumoconioses, La sécurité sociale, Les dermatoses professionnelles.
*   **MODULE: MEDECINE LEGALE (MED_LEG)**
    *   *Topics:* Introduction à la médecine légale, La mort (diagnostic, datation, législation), Phénomènes cadavériques, Signalement et identification, Blessure par arme à feu, Blessure par arme blanche, Blessures (classification, étiologies, datation), Asphyxies mécaniques, Crimes et violences sexuelles, Maltraitance à enfant et infanticide, Mort subite, mort suspecte, Toxicologie médico-légale, Accidents de la circulation, Avortement criminel, Certificats médicaux, Psychiatrie médico-légale, Autopsies.
*   **MODULE: EPIDEMIOLOGIE (EPID)**
    *   *Topics:* Mesure de l'état de santé, Démographie, Organisation du programme de santé, Introduction aux statistiques, Les essais thérapeutiques chez l'homme, Méthodes en épidémiologie, Les enquêtes épidémiologiques, Épidémiologie générale des maladies transmissibles, Surveillance épidémiologique, Prévention des infections nosocomiales, Épidémiologie des maladies non transmissibles, Épidémiologie analytique et d'évaluation, Lutte contre le paludisme / Leishmaniose / Maladies entériques, Hygiène alimentaire, Eau potable et eaux usées, Poliomyélite, rougeole, Hydatidose, rage, Bilharziose, Pollutions, Lutte anti-vectorielle, Nutrition, Hygiène scolaire, Calendrier nutritionnel, Cancer et maladies cardio-vasculaires, Diabète.

---

# PROCESSING & INTERPRETATION INSTRUCTIONS

1.  **Strict Semantic Matching:** Read the clinical context or direct question. Evaluate the pathognomonic markers, physical findings, or therapeutic agents. Match them to the exact domain in the taxonomy matrix above.
2.  **Cross-Module Overlaps Resolution:**
    *   If a question focuses on a pathology in a child (e.g., pediatric asthma, congenital heart defect, pediatric meningitis), map it strictly to **PÉDIATRIE (PED)**, not to adult Cardiologie, Pneumologie, or Neurologie.
    *   If a question focuses on a pregnant woman or obstetric pathology (e.g., HTA and pregnancy, diabetes and pregnancy, gestational infections), map it strictly to **GYNÉCOLOGIE-OBSTÉTRIQUE (GYNECO)**.
    *   If a question focuses on an acute emergency scenario or a pharmacology rule within the 6th-year modular scope (e.g., rules of prescription, general management of shock or coma), map it to **MODULE I (MOD_URG)**.
3.  **Strict High-Level Professional Demeanor:** Maintain technical, academic medical accuracy matching a clinical-stage medical database engine. Do not simplify medical terminology.

---

# SPECIAL PARSING RULES FOR ANSWER KEYS
- The input document may contain an Answer Key or Answer Grid (for example, 'Tableau des réponses', 'Answers', 'Corrige' or similar) at the bottom.
- This answer key may list answers compactly using mappings like 'Q1A, B', 'Q2B, E', 'Q3C', 'Q1: A, B' or in column-like rows.
- You MUST locate, parse, and correctly map these answers to their corresponding questions.
- A question may be a QCM (with multiple correct answers e.g. 'A, B' or 'A, C, D') or a QCS (with a single correct answer). You MUST parse all correct options and put them into correctAnswers.

---

# ALGERIAN RESIDENCY (RESIDANAT) CROSS-YEAR LINKING RULES
- If a question comes from a Residency/Residanat exam, set academicYear strictly to 'Residanat'.
- You must establish a bidirectional link to make it retrievable under BOTH the Residanat section and the corresponding undergraduate module section:
  1. Set 'is_residanat_origin' to true.
  2. Determine the earliest undergraduate year where this module/course is taught (e.g., Cardiology is taught in Year 4, Pediatrics in Year 5, ORL in Year 6).
  3. Assign 'target_undergrad_year' to that year, e.g. 'Year 4' or 'Year 5' or 'Year 6' accordingly.`;

      // If known courses references are provided, let's inject them as an absolute source of truth for the AI
      if (knownCourses && Array.isArray(knownCourses) && knownCourses.length > 0) {
        systemInstruction += `\n\nOFFICIAL CURRICULUM REFERENCE GUIDELINES:
You MUST map the extracted questions to the following official curriculum names if they match conceptually or relate closely. Use the exact academicYear, module, and course names listed below whenever appropriate:
${knownCourses.map((c: any) => `- [${c.academicYear}] Module: "${c.module}" | Course/Topic: "${c.course}"`).join("\n")}`;
      }

      const prompt = `Please extract, classify, and format all medical QCM questions from the following text document. Be thorough and parse all questions in the text:

${textContent}`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of parsed and classified questions.",
            items: {
              type: Type.OBJECT,
              properties: {
                academicYear: {
                  type: Type.STRING,
                  description: "Must be exactly one of: 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Residanat'."
                },
                unit: {
                  type: Type.STRING,
                  description: "Optional curricular unit. Can be empty."
                },
                module: {
                  type: Type.STRING,
                  description: "Organ system or medical specialty module (e.g. 'Cardiology')."
                },
                course: {
                  type: Type.STRING,
                  description: "Specific lecture, disease or topic (e.g. 'Heart Failure')."
                },
                text: {
                  type: Type.STRING,
                  description: "Complete clinical question body or clinical vignette."
                },
                choices: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Must contain exactly 5 choices (representing options A to E)."
                },
                correctAnswers: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                  description: "Array of 0-indexed indices of all correct choices."
                },
                correctAnswer: {
                  type: Type.INTEGER,
                  description: "Index (0 to 4) of the first correct choice in correctAnswers array (for legacy compatibility)."
                },
                explanation: {
                  type: Type.STRING,
                  description: "Detailed medical rationale for the correct choices and distractors."
                },
                examYear: {
                  type: Type.STRING,
                  description: "Calendar year (e.g., '2024')."
                },
                sessionType: {
                  type: Type.STRING,
                  description: "Must be either 'Normal' or 'Rattrapage'."
                },
                is_residanat_origin: {
                  type: Type.BOOLEAN,
                  description: "True if the question is from a Residency/Residanat exam, false otherwise."
                },
                target_undergrad_year: {
                  type: Type.STRING,
                  description: "The early undergraduate year (e.g. 'Year 3', 'Year 4') where this specific module or topic is earliest taught in the medical curriculum."
                },
                classification: {
                  type: Type.OBJECT,
                  description: "Curriculum taxonomy classification.",
                  properties: {
                    cycle_code: {
                      type: Type.STRING,
                      description: "Must be exactly 'PC'."
                    },
                    year_code: {
                      type: Type.STRING,
                      description: "Must be exactly 'Y3', 'Y4', 'Y5', or 'Y6' corresponding to the curriculum level."
                    },
                    module_code: {
                      type: Type.STRING,
                      description: "The uppercase code of the module, e.g., CHIR_GEN, SEM_MED_CHIR, ANAPATH_G3, IMMU_FOND, MICRO_VIR, PARA_MYCO, PHARMA_CLIN, PHYSIOPATH_GEN, CARD, PNEU, GASTRO, NEURO, INF, HEM, ICO, RHUMA, URONEPH, ENDO, PED, GYNECO, PSY, ORL, OPHTA, DERMATO, MOD_URG, MOD_SANTE, MED_TRAV, MED_LEG, EPID."
                    },
                    sub_unit_code: {
                      type: Type.STRING,
                      description: "The uppercase sub-unit code if applicable (e.g. GYNECO_ANAPATH, GYNECO_CLINIQUE, MOD_URG_THER, MOD_URG_CLIN, MOD_SANTE_DROIT, MOD_SANTE_ECON, MOD_SANTE_PSYCHO), otherwise null."
                    },
                    primary_topic: {
                      type: Type.STRING,
                      description: "Exact topic string from the Master Curriculum Matrix."
                    },
                    confidence_score: {
                      type: Type.NUMBER,
                      description: "The AI's confidence level in this classification (float from 0.0 to 1.0)."
                    }
                  },
                  required: ["cycle_code", "year_code", "module_code", "primary_topic", "confidence_score"]
                },
                metadata: {
                  type: Type.OBJECT,
                  description: "Question medical content metadata.",
                  properties: {
                    is_pediatric: { type: Type.BOOLEAN },
                    is_emergency: { type: Type.BOOLEAN },
                    is_obstetric_gynaeco: { type: Type.BOOLEAN }
                  },
                  required: ["is_pediatric", "is_emergency", "is_obstetric_gynaeco"]
                }
              },
              required: ["academicYear", "module", "course", "text", "choices", "correctAnswers", "correctAnswer", "explanation", "examYear", "sessionType"]
            }
          }
        }
      }, "gemini-3.5-flash");

      const jsonText = response.text?.trim() || "[]";
      let parsed = JSON.parse(jsonText);

      // Apply server-side overrides to guarantee accuracy
      if (Array.isArray(parsed)) {
        parsed = parsed.map((q: any) => {
          const updated = { ...q };
          if (overrideAcademicYear) updated.academicYear = overrideAcademicYear;
          if (overrideExamYear) updated.examYear = overrideExamYear;
          if (overrideSessionType) updated.sessionType = overrideSessionType;
          if (overrideModule) updated.module = overrideModule;
          if (overrideCourse) updated.course = overrideCourse;
          return updated;
        });
      }

      res.json({ questions: parsed });

    } catch (err: any) {
      console.error("QCM Text Parser Error:", err);
      res.status(500).json({ error: err.message || "An error occurred while parsing the text with Gemini AI." });
    }
  });

  // Secure Gemini AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, chatHistory, documentText, questionContext, image, file } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAIClient();

      // Build a robust instruction prompt that guides Gemini to act as an elite clinical tutor
      let systemInstruction = `You are "SocratesMD", an elite clinical professor and incredibly patient medical study mentor. 
Your goal is to help medical students understand complex clinical concepts, pathophysiology, diagnostic reasoning, and QCM (Multiple Choice) questions.
Guidelines:
1. Always maintain a professional, supportive, and clinical tone.
2. Break down complex pathophysiological mechanisms step-by-step so a student can grasp the "why" rather than just memorizing facts.
3. If document context is provided, prioritize answering based on that document while supplementing with standard medical guidelines (e.g., USMLE, WHO, UpToDate) when helpful, but clearly distinguish custom document details from standard protocols.
4. Avoid medical jargon overload; explain difficult terms immediately.
5. If explaining a multiple-choice question, explain why the correct option is right and briefly why each of the other options is less appropriate in the given clinical scenario.`;

      // Build context strings
      let fullPrompt = "";
      if (documentText) {
        fullPrompt += `--- START OF UPLOADED STUDY DOCUMENT ---\n${documentText}\n--- END OF UPLOADED STUDY DOCUMENT ---\n\n`;
        fullPrompt += `Refer strictly to the study document above to answer the following student question:\n`;
      }

      if (questionContext) {
        fullPrompt += `--- CLINICAL QUESTION CONTEXT ---\n`;
        fullPrompt += `Question: ${questionContext.text}\n`;
        fullPrompt += `Choices: \n`;
        (questionContext.choices || []).forEach((c: string, idx: number) => {
          fullPrompt += `${String.fromCharCode(65 + idx)}) ${c}\n`;
        });
        if (questionContext.correctAnswers && Array.isArray(questionContext.correctAnswers)) {
          const ansString = questionContext.correctAnswers.map((idx: number) => String.fromCharCode(65 + idx)).join(", ");
          fullPrompt += `Correct Answer(s): Choice(s) ${ansString}\n`;
        } else if (questionContext.correctAnswer !== undefined) {
          fullPrompt += `Correct Answer: Choice ${String.fromCharCode(65 + questionContext.correctAnswer)}\n`;
        }
        if (questionContext.explanation) {
          fullPrompt += `Official Explanation: ${questionContext.explanation}\n`;
        }
        fullPrompt += `--- END OF CLINICAL QUESTION CONTEXT ---\n\n`;
        fullPrompt += `The student is asking about this clinical question. Help them understand:\n`;
      }

      fullPrompt += prompt;

      // Prepare conversation history
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contents.push({
            role: turn.role === "user" ? "user" as const : "model" as const,
            parts: [{ text: turn.text }]
          });
        }
      }

      // Add the final active prompt parts
      const userParts: any[] = [{ text: fullPrompt }];
      
      const attachedFile = file || image;
      if (attachedFile && attachedFile.data && attachedFile.mimeType) {
        userParts.push({
          inlineData: {
            mimeType: attachedFile.mimeType,
            data: attachedFile.data
          }
        });
      }

      contents.push({
        role: "user" as const,
        parts: userParts
      });

      // Call Gemini API using models/gemini-2.5-flash as the fast, standard model
      const response = await generateContentWithFallback(ai, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      }, "gemini-3.5-flash", ["gemini-3.1-flash-lite", "gemini-flash-latest"]);

      const responseText = response.text || "I was unable to generate an explanation. Please try rephrasing your question.";
      res.json({ text: responseText });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: "AI Study Companion is currently sleeping. Ensure GEMINI_API_KEY is correctly set in AI Studio Secrets.",
        details: error.message 
      });
    }
  });

  // Secure Gemini AI Detailed QCM Proof & Explanation Endpoint
  app.post("/api/explain-qcm", async (req, res) => {
    try {
      const { questionText, choices, correctAnswers } = req.body;

      if (!questionText || !choices || !Array.isArray(choices)) {
        return res.status(400).json({ error: "questionText and choices are required" });
      }

      const ai = getAIClient();

      const letterMap = ["A", "B", "C", "D", "E"];
      const correctIndices = Array.isArray(correctAnswers) ? correctAnswers : [];
      const correctLetters = correctIndices.map(idx => letterMap[idx] || String(idx)).join(", ");

      const systemInstruction = `You are an elite, world-class medical school professor, USMLE tutor, and pathophysiology specialist.
Your task is to provide an incredibly detailed, comprehensive clinical explanation and scientific proof for a medical QCM (multiple-choice or single-choice question).

For the given clinical question, you must generate a structured medical response covering:
1. **Clinical Summary & Diagnostic Lead**: A brief clinical synthesis of the case/vignette.
2. **Correct Options Proof (Why they are CORRECT)**: A rigorous, itemized scientific proof and pathophysiological justification for each correct option (e.g. why A, D, E are correct). Be highly detailed.
3. **Incorrect Options/Distractors Breakdown (Why they are INCORRECT)**: A rigorous, itemized clinical refutation explaining why each remaining incorrect option/distractor is incorrect, less appropriate, or flat-out wrong (e.g. why B, C are wrong).
4. **Take-Away Clinical Pearl**: A high-yield educational lesson for medical board exams.

You must reply with structured markdown, using bold titles, professional formatting, and clear logical flow. Speak as an authority in medicine, referencing standard guidelines if applicable. Do not skip any options; analyze all A, B, C, D, E choices explicitly.`;

      const prompt = `--- QUESTION VIGNETTE ---
${questionText}

--- CHOICES ---
${choices.map((choice, idx) => `${letterMap[idx]}) ${choice}`).join("\n")}

--- CORRECT ANSWER(S) ---
Choices: ${correctLetters} (Indices: ${correctIndices.join(", ")})

Please generate the detailed clinical proof, explaining exactly why the correct choices are correct, and why each incorrect option is wrong.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      }, "gemini-3.5-flash", ["gemini-3.1-flash-lite", "gemini-flash-latest"]);

      const responseText = response.text || "Unable to generate explanation. Please try again.";
      res.json({ explanation: responseText });

    } catch (error: any) {
      console.error("Gemini QCM Explanation Error:", error);
      res.status(500).json({
        error: "Failed to generate detailed clinical proof. Please verify that your GEMINI_API_KEY is configured correctly.",
        details: error.message
      });
    }
  });

  // Secure File Parsing Endpoint (PDF, DOCX, Images, Text)
  app.post("/api/parse-file", async (req, res) => {
    try {
      const { fileData, fileName, mimeType } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "fileData is required as a base64 string" });
      }

      const buffer = Buffer.from(fileData, "base64");
      let extractedText = "";

      const lowerName = (fileName || "").toLowerCase();
      const lowerMime = (mimeType || "").toLowerCase();

      if (lowerName.endsWith(".pdf") || lowerMime === "application/pdf") {
        try {
          console.log("[FileParser] Attempting high-fidelity Gemini multimodal parsing for PDF...");
          const ai = getAIClient();
          const response = await generateContentWithFallback(ai, {
            contents: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: fileData
                }
              },
              {
                text: "You are an elite clinical study professor and medical scribe. Please read this medical study PDF document in full detail. Extensively extract all of its key clinical concepts, study guidelines, lectures, questions, and reference facts. Format the output beautifully in clean, structured Markdown so it serves as perfect study notes for medical students. Keep all content extremely comprehensive and do not omit details."
              }
            ]
          }, "gemini-3.5-flash");
          extractedText = response.text || "";
          console.log("[FileParser] Gemini multimodal PDF parsing succeeded!");
        } catch (geminiErr: any) {
          console.error("[FileParser] Gemini multimodal PDF parsing failed:", geminiErr);
          throw new Error(`Gemini multimodal parsing failed for PDF. Please ensure your GEMINI_API_KEY is correct. Details: ${geminiErr.message}`);
        }
      } else if (lowerName.endsWith(".docx") || lowerMime.includes("word") || lowerMime.includes("officedocument")) {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value || "";
      } else if (
        lowerMime.startsWith("image/") || 
        lowerName.endsWith(".png") || 
        lowerName.endsWith(".jpg") || 
        lowerName.endsWith(".jpeg") || 
        lowerName.endsWith(".webp") ||
        lowerName.endsWith(".gif")
      ) {
        // Visual OCR / Extraction using Gemini Multimodal capability
        const ai = getAIClient();
        const response = await generateContentWithFallback(ai, {
          contents: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: fileData
              }
            },
            {
              text: "You are an elite clinical scribe. Please read this medical image, slide, past paper, or clinical diagram and transcribe/extract all of its visible text and content in full detail, verbatim. Preserve any multiple-choice questions or structured text exactly."
            }
          ]
        }, "gemini-3.5-flash");
        extractedText = response.text || "";
      } else {
        // Read as plain UTF-8 text
        extractedText = buffer.toString("utf-8");
      }

      res.json({ text: extractedText });
    } catch (err: any) {
      console.error("[FileParser] Error extracting file:", err);
      res.status(500).json({ error: `File extraction failed: ${err.message || err}` });
    }
  });

  // Dynamic AI theme generator route
  app.post("/api/generate-theme", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Please provide a valid prompt or ambiance description." });
      }

      console.log(`[ThemeGenerator] Generating custom theme for prompt: "${prompt}"`);
      const ai = getAIClient();
      
      const response = await generateContentWithFallback(ai, {
        contents: [
          {
            text: `You are an elite UX/UI color designer for high-end medical education apps (similar to Notion, Linear, Arc Browser).
Your task is to generate a beautiful, highly polished, accessible, and serious custom CSS theme based on this prompt or ambiance: "${prompt}".

Guidelines:
1. Ensure a high contrast ratio of at least 4.5:1 between the text/muted text and the background/surface colors to meet accessibility standards (WCAG AA).
2. The colors should be professional, soothing, and elegant for clinical settings (no harsh eye-straining neons as primary background colors).
3. Choose cohesive, beautiful, medical or modern color palettes.
4. Output a clean name for this theme (e.g., "Sétif Emerald", "Meningitis Blue", "Surgical Teal", "Cardio Rose").
5. Return the response in strict JSON format.

Required values:
- bgColor: Main page background (e.g., light soft off-white, deep serious dark, slate grey)
- surfaceColor: Card background, sidebars, header (e.g., white, or solid slightly lighter/darker than bg)
- surfaceHoverColor: Hovered states of buttons/cards
- borderColor: Border lines, dividers, subtle frames
- textColor: Main body text (high contrast against bg and surface)
- textMutedColor: Secondary/subtle text (must still be legible, high contrast)
- accentColor: Dominant brand accent (a beautiful sage olive, teal, surgical blue, warm gold, etc.)
- accentHoverColor: Hover state of the brand accent color
- name: Human-friendly creative medical-oriented name`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bgColor: { type: Type.STRING, description: "hex code of page background" },
              surfaceColor: { type: Type.STRING, description: "hex code of card surface" },
              surfaceHoverColor: { type: Type.STRING, description: "hex code of hovered card surface" },
              borderColor: { type: Type.STRING, description: "hex code of border and dividers" },
              textColor: { type: Type.STRING, description: "hex code of primary text" },
              textMutedColor: { type: Type.STRING, description: "hex code of muted secondary text" },
              accentColor: { type: Type.STRING, description: "hex code of brand accent color" },
              accentHoverColor: { type: Type.STRING, description: "hex code of brand accent hover state" },
              name: { type: Type.STRING, description: "creative name of the theme" }
            },
            required: [
              "bgColor", "surfaceColor", "surfaceHoverColor", "borderColor", 
              "textColor", "textMutedColor", "accentColor", "accentHoverColor", "name"
            ]
          }
        }
      }, "gemini-3.5-flash");

      const themeData = JSON.parse(response.text || "{}");
      res.json(themeData);
    } catch (err: any) {
      console.error("[ThemeGenerator] Error generating theme:", err);
      res.status(500).json({ error: `Theme generation failed: ${err.message || err}` });
    }
  });

  // Vite middleware for dev or Static delivery for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server Failed to Start:", err);
});
