import { AcademicYear } from "../types";

export interface ModuleConfig {
  name: string;
  frenchName: string;
  courses: string[];
}

export interface UnitConfig {
  name: string;
  frenchName: string;
  modules: ModuleConfig[];
}

export interface YearConfig {
  key: AcademicYear;
  label: string;
  frenchLabel: string;
  desc: string;
  units: UnitConfig[];
}

const BASE_ALGERIAN_CURRICULUM: YearConfig[] = [
  {
    key: "Year 1",
    label: "1ère Année",
    frenchLabel: "1ère Année",
    desc: "Cycle Pré-clinique I : Sciences Médicales Fondamentales I",
    units: [
      {
        name: "Anatomie Humaine (Générale et Membres)",
        frenchName: "Anatomie Humaine (Générale et Membres)",
        modules: [
          {
            name: "Anatomie Humaine (Générale et Membres)",
            frenchName: "Anatomie Humaine (Générale et Membres)",
            courses: [
              "Introduction & Terminologie anatomique (Nomina Anatomica)",
              "Plans de référence & Axes directionnels",
              "Nomenclature des mouvements (Flexion, Extension, Prono-supination...)",
              "Ostéologie Descriptive : Rachis & Vertèbres (Atlas, Axis, Sacrum)",
              "Ostéologie Descriptive : Thorax (Sternum, Côtes)",
              "Ostéologie Descriptive : Membre Supérieur (Clavicule, Scapula, Humérus, Radius, Ulna, Carpe, Métacorpe, Phalanges)",
              "Ostéologie Descriptive : Membre Inférieur (Os coxal, Fémur, Patella, Tibia, Fibula, Tarse, Métatarse, Phalanges)",
              "Arthrologie Spécifique : Généralités et articulations fibreuses, cartilagineuses, synoviales",
              "Arthrologie Spécifique : Étude mécanique et ligaments de l'épaule, du coude, et du poignet",
              "Arthrologie Spécifique : Étude mécanique et ligaments de la hanche, du genou (ménisques, croisés), et de la cheville",
              "Myologie Systématique : Membre supérieur (épaule/coiffe des rotateurs, bras, avant-bras, main)",
              "Myologie Systématique : Membre inférieur (hanche, cuisse/quadriceps/ischio-jambiers/adducteurs, jambe/triceps sural, pied)"
            ]
          }
        ]
      },
      {
        name: "Histologie & Embryologie Générale",
        frenchName: "Histologie & Embryologie Générale",
        modules: [
          {
            name: "Histologie & Embryologie Générale",
            frenchName: "Histologie & Embryologie Générale",
            courses: [
              "Épithéliums de Revêtement : Critères de classification (couches, formes des cellules, différenciations apicales), endothéliums et mésothéliums.",
              "Épithéliums Glandulaires : Mécanismes de sécrétion (mérocrine, apocrine, holocrine), glandes séreuses, muqueuses et mixtes.",
              "Tissu Conjonctif Banal : Matrice extracellulaire (substance fondamentale, fibres, cellules fixes et mobiles).",
              "Tissus Conjonctifs Spécialisés : Tissu Adipeux & Tissu Cartilagineux",
              "Tissus Conjonctifs Spécialisés : Tissu Osseux (ostéoblastes, ostéocytes, ostéoclastes, ostéone, ostéogénèse).",
              "Tissu Musculaire : Ultra-structure, couplage excitation-contraction, muscle lisse et cardiaque.",
              "Tissu Nerveux : Structure du péricaryon, flux axonal, synapses et gaine de myéline.",
              "Embryologie Générale : Gamétogénèse (spermiogénèse, cycle ovarien/utérin).",
              "Embryologie Générale : 1ère Semaine (fécondation, réaction acrosomique, segmentation, blastocyste).",
              "Embryologie Générale : 2ème Semaine (trophoblaste, cavité amniotique, cœlome).",
              "Embryologie Générale : 3ème Semaine (ligne primitive, gastrulation, ectoderme, mésoderme, endoderme).",
              "Embryologie Générale : 4ème Semaine (délimitation, tube neural, somites)."
            ]
          }
        ]
      },
      {
        name: "Cytologie / Biologie Cellulaire",
        frenchName: "Cytologie / Biologie Cellulaire",
        modules: [
          {
            name: "Cytologie / Biologie Cellulaire",
            frenchName: "Cytologie / Biologie Cellulaire",
            courses: [
              "Membrane Plasmique : Composition lipidique, asymétrie membranaire, protéines, glycocalyx.",
              "Membrane Plasmique : Transports (perméases, canaux, aquaporines) & Endocytose/exocytose.",
              "Système Endomembranaire : RER & REL (synthèse, N-glycosylation, lipides, détoxification, stockage Ca).",
              "Système Endomembranaire : Golgi & Lysosomes (O-glycosylation, sulfatation, tri).",
              "Cytosquelette : Microfilaments d'actine (polymérisation, myosine, motilité).",
              "Cytosquelette : Microtubules & Filaments intermédiaires (tubulines, dynéine, kinésine, cils/flagelles, kératines, vimentine, lamines).",
              "Mitochondrie : Membrane externe & interne, crêtes, cardiolipine, ATP synthase, matrice, théorie endosymbiotique, ADN mitochondrial.",
              "Noyau et Génome : Enveloppe nucléaire, pores, nucléole (ARNr 45S, ribosomales), chromatine (nucléosome, histones).",
              "Division et Mort : Cycle cellulaire (G0, G1, S, G2, M), checkpoints, cyclines-CDK, Mitose.",
              "Division et Mort : Apoptose (voies intrinsèque et extrinsèque, caspases)."
            ]
          }
        ]
      },
      {
        name: "Biochimie Structurale",
        frenchName: "Biochimie Structurale",
        modules: [
          {
            name: "Biochimie Structurale",
            frenchName: "Biochimie Structurale",
            courses: [
              "Glucides : Aldoses/cétoses, filiation, pyranose/furanose, oses-phosphates, liaisons osidiques, diolysides.",
              "Glucides : Polyosides (amidon, glycogène, cellulose, GAG).",
              "Lipides : Acides gras (saturés/insaturés), propriétés, triglycérides, phospholipides.",
              "Lipides : Terpènes et stéroïdes (cholestérol, acides biliaires).",
              "Acides Aminés et Protéines : Structure, pHi, liaison peptidique.",
              "Acides Aminés et Protéines : Structures secondaires, tertiaire, quaternaire et allostérie (effet Bohr).",
              "Enzymologie : Site actif, équation de Michaelis-Menten, Km, Vmax, double réciproque.",
              "Enzymologie : Inhibiteurs réversibles/irréversibles, régulation allostérique."
            ]
          }
        ]
      },
      {
        name: "Biophysique Générale",
        frenchName: "Biophysique Générale",
        modules: [
          {
            name: "Biophysique Générale",
            frenchName: "Biophysique Générale",
            courses: [
              "Biophysique des Solutions : Expressions des concentrations, lois de l'osmose, cryoscopie médicale.",
              "Biophysique des Transports : Diffusion (Fick), filtration (Starling), équilibre de Gibbs-Donnan.",
              "Électrophysiologie Cellulaire : Potentiel de repos (Nernst, Goldman-Hodgkin-Katz), propriétés passives.",
              "Électrophysiologie Cellulaire : Potentiel d'action (Na+/K+ voltage-dépendants), période réfractaire.",
              "Biophysique des Radiations : Non-ionisants (lasers), ionisants (désintégrations alpha, beta-, beta+, émission gamma, demi-vie).",
              "Biophysique des Radiations : Interaction RX/gamma, radioprotection.",
              "Optique Médicale : Lois de la réflexion/réfraction (Snell-Descartes), dioptres, lentilles minces.",
              "Optique Médicale : Biophysique de l'œil (accommodation, PP/PR), anomalies (myopie, hypermétropie, presbytie, astigmatisme)."
            ]
          }
        ]
      },
      {
        name: "Chimie Générale et Organique",
        frenchName: "Chimie Générale et Organique",
        modules: [
          {
            name: "Chimie Générale et Organique",
            frenchName: "Chimie Générale et Organique",
            courses: [
              "Structure de la matière : Atomes, Isotopes, Modèle de Bohr, Nombres quantiques",
              "Classification périodique des éléments & Propriétés périodiques",
              "Liaisons chimiques (Covalente, Ionique, Métallique, Intermoléculaires)",
              "Thermodynamique chimique : 1er et 2ème principes, Enthalpie, Entropie, Énergie libre",
              "Équilibres chimiques & Constante d'équilibre (Kc, Kp)",
              "Cinétique chimique : Vitesse de réaction, Ordre de réaction, Catalyse",
              "Équilibres en solution aqueuse : Acido-basiques (pH, tampons), Solubilité",
              "Chimie Organique : Nomenclature, Isomérie (De constitution, Stéréoisomérie, Énantiomères)",
              "Effets électroniques (Inductif, Mésomère) & Réactivité",
              "Grandes fonctions en chimie organique : Alcanes, Alcènes, Alcools, Amines, Acides carboxyliques"
            ]
          }
        ]
      },
      {
        name: "Informatique - Biostatistique",
        frenchName: "Informatique - Biostatistique",
        modules: [
          {
            name: "Informatique - Biostatistique",
            frenchName: "Informatique - Biostatistique",
            courses: [
              "Introduction à l'informatique médicale et systèmes d'information hospitaliers",
              "Réseaux informatiques, Internet, Sécurité des données de santé",
              "Biostatistique descriptive : Variables, Distributions, Représentations graphiques",
              "Indicateurs de position (Moyenne, Médiane, Mode) et de dispersion (Variance, Écart-type)",
              "Concepts de probabilités : Lois de probabilité (Binomiale, Poisson, Normale)",
              "Échantillonnage et estimation : Intervalles de confiance",
              "Tests d'hypothèses statistiques : Principes généraux, risques alpha et bêta",
              "Tests de comparaison de moyennes (Test t de Student) et de variances",
              "Test du Chi-deux (X²) de comparaison de proportions",
              "Corrélation et Régression linéaire simple"
            ]
          }
        ]
      },
      {
        name: "Sciences Humaines et Sociales (Ethique & Déontologie)",
        frenchName: "Sciences Humaines et Sociales (Ethique & Déontologie)",
        modules: [
          {
            name: "Sciences Humaines et Sociales (Ethique & Déontologie)",
            frenchName: "Sciences Humaines et Sociales (Ethique & Déontologie)",
            courses: [
              "Introduction aux sciences humaines et sociales en médecine",
              "Histoire de la médecine : Des origines à la médecine moderne (Ibn Sina, Hippocrate, Pasteur)",
              "Psychologie médicale : Relation médecin-malade, annonce de diagnostic",
              "Éthique médicale : Principes fondamentaux (Autonomie, Bienfaisance, Non-malfaisance, Justice)",
              "Déontologie médicale : Code de déontologie algérien, secret médical",
              "Responsabilité médicale (Civile, Pénale, Disciplinaire) & Consentement éclairé",
              "Économie de la santé et systèmes de santé",
              "Sociologie de la santé et anthropologie de la maladie",
              "Droits du patient et législation sanitaire algérienne"
            ]
          }
        ]
      },
      {
        name: "Physiologie Générale",
        frenchName: "Physiologie Générale",
        modules: [
          {
            name: "Physiologie Générale",
            frenchName: "Physiologie Générale",
            courses: [
              "Introduction à la physiologie générale & homéostasie",
              "Physiologie de la membrane plasmique & transports membranaires",
              "Potentiels transmembranaires : Potentiel de repos & Potentiel d'action",
              "Transmission synaptique & Jonction neuromusculaire",
              "Physiologie de la contraction du muscle squelettique",
              "Physiologie du muscle lisse et du muscle cardiaque",
              "Système Nerveux Autonome (Sympathique & Parasympathique) : Neurotransmetteurs et récepteurs",
              "Physiologie générale du système endocrinien & boucles de rétrocontrôle"
            ]
          }
        ]
      },
      {
        name: "Français Médical & Terminologie",
        frenchName: "Français Médical & Terminologie",
        modules: [
          {
            name: "Français Médical & Terminologie",
            frenchName: "Français Médical & Terminologie",
            courses: [
              "Introduction à la terminologie médicale et racines gréco-latines",
              "Suffixes, préfixes et construction de mots médicaux",
              "Vocabulaire anatomique, clinique et thérapeutique de base",
              "Communication écrite et orale en milieu médical hospitalier"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "Year 2",
    label: "2ème Année",
    frenchLabel: "2ème Année",
    desc: "Cycle Pré-clinique II : Sciences Médicales Fondamentales II",
    units: [
      {
        name: "Anatomie Topographique et Viscérale",
        frenchName: "Anatomie Topographique et Viscérale",
        modules: [
          {
            name: "Anatomie Topographique et Viscérale",
            frenchName: "Anatomie Topographique et Viscérale",
            courses: [
              "Neuroanatomie : Moelle Épinière (cornes, substance blanche, faisceaux) & Tronc Cérébral.",
              "Neuroanatomie : Cervelet (archéo, paléo, néo), Diencéphale (thalamus, hypothalamus).",
              "Neuroanatomie : Cerveau (lobes, aires de Brodmann, ventricules, méninges, vascularisation/polygone de Willis).",
              "Anatomie Viscérale du Thorax : Paroi, muscles intercostaux, poumons (segments), plèvre.",
              "Anatomie Viscérale du Thorax : Médiastin antérieur et moyen, cœur (configuration, valves, coronaires, péricarde).",
              "Anatomie Viscérale du Thorax : Médiastin postérieur (œsophage, aorte descendante, trachée, nerf vague).",
              "Anatomie Viscérale de l'Abdomen et du Pelvis : Paroi abdominale, canal inguinal, cavité péritonéale (épiploons, méso).",
              "Anatomie Viscérale de l'Abdomen et du Pelvis : Tube digestif (estomac, duodénum, jéjunum, iléon, côlon, rectum).",
              "Anatomie Viscérale de l'Abdomen et du Pelvis : Foie, voies biliaires, pancréas, rate, vascularisation abdominale.",
              "Appareil Urogénital : Reins (rapports, loge rénale), uretères, vessie.",
              "Appareil Urogénital : Appareil génital masculin (testicules, prostate, urètre) & féminin (ovaires, utérus, vagin)."
            ]
          }
        ]
      },
      {
        name: "Physiologie Humaine (Grandes Fonctions)",
        frenchName: "Physiologie Humaine (Grandes Fonctions)",
        modules: [
          {
            name: "Physiologie Humaine (Grandes Fonctions)",
            frenchName: "Physiologie Humaine (Grandes Fonctions)",
            courses: [
              "Neurophysiologie : Synapses (PPSE/PPSI, neurotransmetteurs), somesthésie & douleur (Gate Control).",
              "Neurophysiologie : Organes des sens (vision, audition) & physiologie motrice (réflexes, cortex, cervelet).",
              "Neurophysiologie : Système nerveux autonome (récepteurs, sympathique, parasympathique).",
              "Physiologie Cardiovasculaire : Tissu nodal, électrophysiologie, cycle cardiaque mécanique.",
              "Physiologie Cardiovasculaire : Débit cardiaque, hémodynamique & régulation de la PA (baroréflexe, RAA).",
              "Physiologie Respiratoire : Mécanique, compliance, surfactant, pressions et volumes (VC, VRI, VRE, VR).",
              "Physiologie Respiratoire : Échanges gazeux (Fick, transport O2/CO2) & régulation respiratoire.",
              "Physiologie Rénale : Néphron, filtration glomérulaire (barrière, DFG, autorégulation).",
              "Physiologie Rénale : Fonctions tubulaires (TCP réabsorption glucose, anse de Henle/NKCC2, TCD/Aldostérone/ADH).",
              "Physiologie Rénale : Équilibre acido-basique et excrétion H+.",
              "Physiologie Endocrinienne : Mécanismes hormonaux & axe hypothalamo-hypophysaire.",
              "Physiologie Endocrinienne : Thyroïde (T3/T4) & surrénales (cortisol, aldostérone, catécholamines).",
              "Physiologie Endocrinienne : Pancréas endocrine (insuline, glucagon, glycémie) & métabolisme phosphocalcique."
            ]
          }
        ]
      },
      {
        name: "Biochimie Métabolique",
        frenchName: "Biochimie Métabolique",
        modules: [
          {
            name: "Biochimie Métabolique",
            frenchName: "Biochimie Métabolique",
            courses: [
              "Métabolisme des Glucides : Glycolyse (pyruvate/lactate) & cycle de Krebs.",
              "Métabolisme des Glucides : Chaîne respiratoire et phosphorylation oxydative (complexes I-IV, ATP synthase).",
              "Métabolisme des Glucides : Néoglucogénèse, métabolisme du glycogène & voie des pentoses phosphates.",
              "Métabolisme des Lipides : bêta-oxydation (Lynen, carnitine, bilan) & cétogénèse.",
              "Métabolisme des Lipides : Lipogénèse (acides gras synthase, triglycérides) & lipoprotéines.",
              "Métabolisme des Composés Azotés : Transamination (ALAT, ASAT, ALAT/ASAT, vitamine B6) & désamination oxydative.",
              "Métabolisme des Composés Azotés : Cycle de l'urée & catabolisme des purines."
            ]
          }
        ]
      },
      {
        name: "Génétique Médicale",
        frenchName: "Génétique Médicale",
        modules: [
          {
            name: "Génétique Médicale",
            frenchName: "Génétique Médicale",
            courses: [
              "Génétique Moléculaire et Chromosomique : Organisation du génome, chromosome métaphasique, caryotype, FISH.",
              "Lois de l'Hérédité : Autosomique Dominante (Marfan, NF1, Huntington) & Autosomique Récessive (Mucoviscidose, Drépanocytose).",
              "Lois de l'Hérédité : Liée à l'X (Hémophilie A/B, Duchenne), pénétrance, empreinte parentale.",
              "Anomalies Chromosomiques (Cytogénétique) : Aneuploïdies (Trisomies 21, 18, 13, Turner 45X, Klinefelter 47XXY).",
              "Anomalies Chromosomiques (Cytogénétique) : Anomalies de structure (translocations, délétions, duplications)."
            ]
          }
        ]
      },
      {
        name: "Biophysique Spécialisée & Explorations Fonctionnelles",
        frenchName: "Biophysique Spécialisée & Explorations Fonctionnelles",
        modules: [
          {
            name: "Biophysique Spécialisée & Explorations Fonctionnelles",
            frenchName: "Biophysique Spécialisée & Explorations Fonctionnelles",
            courses: [
              "Hémodynamique Physique : Fluides parfaits (Bernoulli) & réels (Poiseuille, Reynolds, viscosité).",
              "Hémodynamique Physique : Élasticité (Windkessel, onde de pouls).",
              "Biophysique Cardiaque (Bases de l'ECG) : Dipôle électrique, triangle d'Einthoven, dérivations (DI-DIII, aVR-aVF, V1-V6, axe électrique de Bailey).",
              "Bases Physiques de l'Imagerie Médicale : Rayons X (Bremsstrahlung, atténuation, contraste, scanner/Hounsfield).",
              "Bases Physiques de l'Imagerie Médicale : Ultrasons (piézoélectricité, impédance, modes A/B/TM, Doppler).",
              "Bases Physiques de l'Imagerie Médicale : IRM (Larmor, relaxation T1/T2, pondération, gradients)."
            ]
          }
        ]
      }
    ]
  },
  {
    key: "Year 3",
    label: "3ème Année",
    frenchLabel: "3ème Année",
    desc: "Cycle Pré-clinique III : Modules Sémiologiques & Paracliniques",
    units: [
      {
        name: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
        frenchName: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
        modules: [
          {
            name: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
            frenchName: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale",
            courses: [
              "Sémiologie Générale : Méthodologie de l'observation clinique (interrogatoire/anamnèse, examen physique).",
              "Sémiologie Générale : Syndrome fébrile & courbes thermiques, asthénie.",
              "Sémiologie Générale : Modifications morphologiques (maigreur, obésité/IMC, œdèmes généraux).",
              "Sémiologie & Physiopathologie Cardiovasculaire : Signes fonctionnels (dyspnée NYHA, douleur thoracique/angor/IDM/péricardite/dissection, palpitations, syncopes).",
              "Sémiologie & Physiopathologie Cardiovasculaire : Examen physique (bruits B1/B2/B3/B4/galop, souffles, clics, roulements).",
              "Sémiologie & Physiopathologie Cardiovasculaire : Examen périphérique (pouls, PA, HTA, hypotension, insuffisance artérielle, TVP/signe de Homans).",
              "Sémiologie & Physiopathologie Cardiovasculaire : Physiopathologie (insuffisance cardiaque gauche/droite, états de choc).",
              "Sémiologie & Physiopathologie Cardiovasculaire : Explorations (ECG pathologique/hypertrophies/ischémie/nécrose, radio thorax, écho Doppler).",
              "Sémiologie & Physiopathologie Respiratoire : Signes fonctionnels & physiques (dyspnée bradypnée, toux, expectoration, hémoptysie, douleur pleurale).",
              "Sémiologie & Physiopathologie Respiratoire : Syndromes cliniques (condensation, pleurésie/épanchement liquidien, pneumothorax/épanchement gazeux, cavitation).",
              "Sémiologie & Physiopathologie Respiratoire : Physiopathologie (insuffisance respiratoire/effet shunt/diffusion, asthme, SDRA).",
              "Sémiologie & Physiopathologie Respiratoire : Explorations (radio opacités/hyperclartés, EFR obstructive/restrictive/Tiffeneau).",
              "Biochimie Clinique Cardiorespiratoire : Biomarqueurs de la nécrose myocardique (Troponines I/T, CK-MB) & insuffisance cardiaque (BNP).",
              "Biochimie Clinique Cardiorespiratoire : Gazométrie artérielle & équilibre acido-basique (acidose/alcalose, trou anionique).",
              "Psychologie Médicale : Relation médecin-malade & psychologie du patient chronique.",
              "Psychologie Médicale : Bases des troubles anxieux et dépressifs."
            ]
          }
        ]
      },
      {
        name: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie",
        frenchName: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie",
        modules: [
          {
            name: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie",
            frenchName: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie",
            courses: [
              "Sémiologie & Physiopathologie Neurologique : Grands syndromes moteurs (pyramidal/Babinski, périphérique/neurogène, cérébelleux, extrapyramidal/parkinsonien).",
              "Sémiologie & Physiopathologie Neurologique : Sémiologie sensitive (lemniscal, thermo-algique, cordonnal).",
              "Sémiologie & Physiopathologie Neurologique : Examen des nerfs crâniens (II à XII).",
              "Sémiologie & Physiopathologie Neurologique : Fonctions supérieures (aphasies, Glasgow, syndrome méningé/Kernig/Brudzinski).",
              "Sémiologie & Physiopathologie Neurologique : Physiopathologie (HTIC, AVC ischémique/hémorragique, myasthénie) & explorations (TDM/IRM, EEG, ponction lombaire/LCR).",
              "Sémiologie & Physiopathologie de l'Appareil Locomoteur : Sémiologie articulaire (rythme inflammatoire vs mécanique, arthrite, arthrose, mono/oligo/polyarthrite).",
              "Sémiologie & Physiopathologie de l'Appareil Locomoteur : Sémiologie rachidienne (lombalgie, lombosciatique L5/S1, canal carpien) & imagerie.",
              "Sémiologie Dermatologique : Lésions élémentaires primitives (macules, papules, nodules, végétations, vésicules, bulles/Nikolsky, pustules).",
              "Sémiologie Dermatologique : Lésions secondaires (squames, croûtes, érosions, ulcérations, cicatrices) & dermoscopie.",
              "Biochimie Clinique Locomoteur : Marqueurs du remodelage osseux (PAL, calcium, phosphore) & syndrome inflammatoire (VS, CRP).",
              "Biochimie Clinique Locomoteur : Analyse et examen du liquide synovial (mécanique vs inflammatoire/infectieux)."
            ]
          }
        ]
      },
      {
        name: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire",
        frenchName: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire",
        modules: [
          {
            name: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire",
            frenchName: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire",
            courses: [
              "Sémiologie & Physiopathologie Endocrinienne : Axe thyroïdien (hyperthyroïdie, hypothyroïdie, goitres, nodules).",
              "Sémiologie & Physiopathologie Endocrinienne : Axe corticotrope (Cushing, Addison, phéochromocytome/triade de Ménard).",
              "Sémiologie & Physiopathologie Endocrinienne : Diabète sucré, syndrome cardinal, acidocétose, hypoglycémie.",
              "Sémiologie & Physiopathologie Endocrinienne : Explorations endocriniennes (glycémie, HbA1c, dosages hormonaux basaux/dynamiques, bilan lipidique).",
              "Sémiologie de l'Appareil Urinaire : Signes fonctionnels & physiques (polyurie, oligurie, anurie, dysurie, hématurie, colique néphrétique, globe vésical, points urétéraux).",
              "Sémiologie de l'Appareil Urinaire : Grands syndromes néphrologiques (néphritique, néphrotique, insuffisance rénale aiguë/chronique).",
              "Sémiologie de l'Appareil Urinaire : Imagerie & biologie rénale (échographie, clairance Cockcroft/MDRD, protéinurie 24h, ionogramme).",
              "Sémiologie de l'Appareil Reproducteur : Sémiologie mammaire, génitale masculine, toucher rectal et prostate."
            ]
          }
        ]
      },
      {
        name: "UEI 4 : Appareil Digestif & Système Hématopoïétique",
        frenchName: "UEI 4 : Appareil Digestif & Système Hématopoïétique",
        modules: [
          {
            name: "UEI 4 : Appareil Digestif & Système Hématopoïétique",
            frenchName: "UEI 4 : Appareil Digestif & Système Hématopoïétique",
            courses: [
              "Sémiologie & Physiopathologie Digestive : Signes fonctionnels (douleurs, dysphagie, pyrosis, vomissements, diarrhée, constipation, hémorragies).",
              "Sémiologie & Physiopathologie Digestive : Examen physique de l'abdomen (météorisme, CVC, défense/contracture, McBurney, TR/Douglas).",
              "Sémiologie & Physiopathologie Digestive : Grands syndromes (ictères, hypertension portale/ascite, insuffisance hépatocellulaire/astérixis, occlusion).",
              "Sémiologie & Physiopathologie Digestive : Explorations d'imagerie, d'endoscopie & biochimie (cytolyse, cholestase, TP, amylasémie, lipasémie).",
              "Sémiologie Hématologique : Syndrome anémique (pâleur, tachycardie, dyspnée, classification microcytaire/macrocytaire/hémolytique).",
              "Sémiologie Hématologique : Syndrome hémorragique (purpura/vibices, ecchymoses, hémostase/TP/TCA/TS) & insuffisance médullaire.",
              "Sémiologie Hématologique : Syndrome tumoral (adénopathies, splénomégalie) & explorations biologiques (NFS, VGM, réticulocytes, myélogramme)."
            ]
          }
        ]
      },
      {
        name: "Anatomie Pathologique Générale (Anapath / ACP)",
        frenchName: "Anatomie Pathologique Générale (Anapath / ACP)",
        modules: [
          {
            name: "Anatomie Pathologique Générale (Anapath / ACP)",
            frenchName: "Anatomie Pathologique Générale (Anapath / ACP)",
            courses: [
              "Techniques en ACP : Prélèvements (biopsie, pièce opératoire, cytologie), fixation (formol) & coloration standard (HES).",
              "Techniques en ACP : Immunohistochimie (IHC) & examen extemporané.",
              "Lésions élémentaires cellulaires : Adaptations cellulaires (hypertrophie, hyperplasie, atrophie, métaplasie).",
              "Lésions élémentaires cellulaires : Lésions réversibles (stéatose, dégénérescence hydropique) & irréversibles (apoptose, types de nécrose).",
              "Inflammation : Inflammation aiguë (phase hémodynamique, diapédèse des PNN, exsudat).",
              "Inflammation : Inflammation chronique (réparation, fibrose, granulomes) & nécrose caséeuse spécifique de la Tuberculose.",
              "Pathologie tumorale générale : Tumeurs bénignes vs tumeurs malignes (critères de différenciation et d'invasion).",
              "Pathologie tumorale générale : Nomenclature tumorale (carcinome, adénocarcinome, sarcome, lymphome), gradation & Staging (TNM)."
            ]
          }
        ]
      },
      {
        name: "Immunologie Générale",
        frenchName: "Immunologie Générale",
        modules: [
          {
            name: "Immunologie Générale",
            frenchName: "Immunologie Générale",
            courses: [
              "Immunité Innée : Barrières naturelles, cellules de l'immunité innée (macrophages, dendritiques, PNN, NK, récepteurs PRR/TLR).",
              "Immunité Innée : Le Système du Complément (voies classique, alternative, lectines, complexe d'attaque membranaire).",
              "Immunité Innée : Réaction inflammatoire aiguë et cytokines pro-inflammatoires (IL-1, IL-6, TNF-alpha).",
              "Immunité Adaptative : Organes lymphoïdes primaires (moelle, thymus) & secondaires (ganglions, rate, MALT).",
              "Immunité Adaptative : L'antigène, lymphocytes B et structure/classes/fonctions des anticorps (immunoglobulines).",
              "Immunité Adaptative : Lymphocytes T (ontogénèse thymique, restriction au CMH) & molécules du CMH de classe I et II.",
              "Réponse Immune : Coopération CPA/LT & différenciation des LT (Th1, Th2, Th17, Treg, LT cytotoxiques).",
              "Pathologies du Système Immunitaire : Hypersensibilités (Gell et Coombs : Types I, II, III, IV).",
              "Pathologies du Système Immunitaire : Auto-immunité (tolérance, mécanismes) & déficits immunitaires primaires et secondaires."
            ]
          }
        ]
      },
      {
        name: "Microbiologie Médicale (Bactériologie - Virologie)",
        frenchName: "Microbiologie Médicale (Bactériologie - Virologie)",
        modules: [
          {
            name: "Microbiologie Médicale (Bactériologie - Virologie)",
            frenchName: "Microbiologie Médicale (Bactériologie - Virologie)",
            courses: [
              "Bactériologie Générale : Structure de la cellule bactérienne (paroi Gram +/- , chromosome, plasmides, capsule, spores).",
              "Bactériologie Générale : Croissance bactérienne, génétique (conjugaison, transformation, transduction).",
              "Bactériologie Générale : Physiopathologie de l'infection (facteurs de virulence, endotoxines, exotoxines).",
              "Antibiotiques et Résistance : Familles d'antibiotiques et mécanismes d'action (Bêta-lactamines, aminosides, macrolides, quinolones).",
              "Antibiotiques et Résistance : Mécanismes de résistance bactérienne (bêta-lactamases/BLSE, efflux, imperméabilité) & antibiogramme (CMI, CMB).",
              "Virologie Générale : Structure et classification des virus (ADN/ARN, capside, enveloppe, virus nus vs enveloppés).",
              "Virologie Générale : Réplication virale (étapes) & physiopathologie des infections virales (aiguë, persistante, latente, oncogène).",
              "Virologie Générale : Mécanismes d'action des antiviraux."
            ]
          }
        ]
      },
      {
        name: "Parasitologie - Mycologie Médicale",
        frenchName: "Parasitologie - Mycologie Médicale",
        modules: [
          {
            name: "Parasitologie - Mycologie Médicale",
            frenchName: "Parasitologie - Mycologie Médicale",
            courses: [
              "Parasitologie Générale : Définitions et cycles évolutifs (hôte définitif, hôte intermédiaire, vecteur).",
              "Principales Parasitoses Humaines : Protozoaires intestinaux et tissulaires (Amibiase, Toxoplasmose).",
              "Principales Parasitoses Humaines : Le Paludisme (Plasmodium, cycle, clinique, goutte épaisse/frottis).",
              "Principales Parasitoses Humaines : Helminthes intestinaux et tissulaires (Ascaridiose, Oxyurose, Tæniasis).",
              "Principales Parasitoses Humaines : Hydatidose (Kyste hydatique / Echinococcus granulosus) & Schistosomiases.",
              "Mycologie Médicale : Morphologie des champignons (levures, filaments, dimorphiques) & diagnostic mycologique (direct, Sabouraud).",
              "Mycologie Médicale : Candidoses (Candida albicans/muguet) & Dermatophytoses (teignes, onyxis).",
              "Mycologie Médicale : Aspergilloses (Aspergillus fumigatus, formes cliniques).",
            ]
          }
        ]
      },
      {
        name: "Pharmacologie Clinique Générale",
        frenchName: "Pharmacologie Clinique Générale",
        modules: [
          {
            name: "Pharmacologie Clinique Générale",
            frenchName: "Pharmacologie Clinique Générale",
            courses: [
              "Pharmacocinétique : Devenir du médicament et système ADME (absorption, biodisponibilité, premier passage).",
              "Pharmacocinétique : Distribution tissulaire (liaison protéique, volume de distribution, barrières).",
              "Pharmacocinétique : Métabolisme (Cytochromes P450, phase I & II, inducteurs/inhibiteurs).",
              "Pharmacocinétique : Élimination des médicaments (clairance rénale, demi-vie, cycle entéro-hépatique).",
              "Pharmacodynamie : Mécanismes d'action et interactions drogue-récepteur (agonistes, antagonistes).",
              "Pharmacodynamie : Relations dose-effet (Emax, CE50) & Index thérapeutique."
            ]
          }
        ]
      }
    ]
  },
  {
    key: "Year 4",
    label: "4ème Année",
    frenchLabel: "4ème Année",
    desc: "Cycle Clinique I : Modules Cliniques Majoritaires",
    units: [
      {
        name: "Cardiologie et Pathologies Vasculaires",
        frenchName: "Cardiologie et Pathologies Vasculaires",
        modules: [
          {
            name: "Cardiologie",
            frenchName: "Cardiologie",
            courses: [
              "Sémeiologie cardiaque et auscultation",
              "Insuffisance cardiaque aiguë et chronique",
              "Infarctus du myocarde (IDM) et syndromes coronariens aigus (SCA)",
              "Angine de poitrine (Angor stable et instable)",
              "Hypertension Artérielle (HTA) essentielle et secondaire",
              "Valvulopathies (Retrécissement mitral, Insuffisance mitrale, Rétrécissement aortique, Insuffisance aortique)",
              "Troubles du rythme (Fibrillation auriculaire, Flutter) et de la conduction (BAV)",
              "Endocardite infectieuse et Péricardites aiguës",
              "Embolie pulmonaire et Thrombose Veineuse Profonde (TVP)",
              "Artériopathies oblitérantes des membres inférieurs (AOMI) et Anévrismes"
            ]
          },
          {
            name: "Chirurgie Cardiaque",
            frenchName: "Chirurgie Cardiaque",
            courses: []
          },
          {
            name: "Chirurgie Vasculaire",
            frenchName: "Chirurgie Vasculaire",
            courses: []
          }
        ]
      },
      {
        name: "Pneumologie et Pthisiologie",
        frenchName: "Pneumologie et Pthisiologie",
        modules: [
          {
            name: "Pneumologie",
            frenchName: "Pneumologie",
            courses: [
              "Sémiologie respiratoire et explorations fonctionnelles (EFR)",
              "Tuberculose pulmonaire et extrapulmonaire (Pthisiologie)",
              "Asthme de l'adulte et exacerbations",
              "Broncho-Pneumopathie Chronique Obstrutive (BPCO) et Cœur pulmonaire chronique",
              "Pneumopathies infectieuses bactériennes et atypiques",
              "Cancer broncho-pulmonaire primitif",
              "Pleurésies séro-fibrineuses et purulentes",
              "Pneumothorax spontané et traumatique",
              "Insuffisance respiratoire chronique",
              "Dilatation des bronches et Suppurations bronchiques"
            ]
          },
          {
            name: "Chirurgie Thoracique",
            frenchName: "Chirurgie Thoracique",
            courses: []
          }
        ]
      },
      {
        name: "Gastro-Entérologie et Chirurgie Digestive",
        frenchName: "Gastro-Entérologie et Chirurgie Digestive",
        modules: [
          {
            name: "Gastro-Entérologie",
            frenchName: "Gastro-Entérologie",
            courses: [
              "Sémiologie digestive et ictères",
              "Maladie ulcéreuse gastroduodénale et infection à H. pylori",
              "Cancers digestifs (Œsophage, Estomac, Colon, Rectum, Pancréas, Foie)",
              "Cirrhoses et ses complications (Ascite, Hémorragie digestive par rupture de VO)",
              "Hépatites virales aiguës et chroniques (B, C)",
              "Maladies Inflammatoires Chroniques de l'Intestin (MICI : Crohn, RCH)",
              "Pathologies biliaires : Lithiase vésiculaire, Cholécystite, Angiocholite",
              "Pancréatites aiguës et chroniques",
              "Urgences chirurgicales : Appendicite aiguë, Péritonites, Occlusions intestinales, Hernies étranglées",
              "Hémorragies digestives hautes et basses"
            ]
          },
          {
            name: "Chirurgie Digestive / Viscérale",
            frenchName: "Chirurgie Digestive / Viscérale",
            courses: []
          }
        ]
      },
      {
        name: "Maladies Infectieuses",
        frenchName: "Maladies Infectieuses",
        modules: [
          {
            name: "Infectiologie",
            frenchName: "Infectiologie",
            courses: [
              "Physiopathologie de la fièvre et choc endotoxinique",
              "Fièvre typhoïde et Salmonelloses",
              "Brucellose aiguë et chronique",
              "Méningites infectieuses (bactériennes, virales, tuberculeuses)",
              "Infection par le VIH / SIDA et infections opportunistes",
              "Paludisme et parasitoses importées",
              "Rickettsioses et fièvres éruptives infectieuses",
              "Septicémies et bactériémies",
              "Rage et tétanos (Prévention et prise en charge)",
              "Principes de l'antibiothérapie et antibiorésistance"
            ]
          }
        ]
      },
      {
        name: "Neurologie et Neurochirurgie",
        frenchName: "Neurologie et Neurochirurgie",
        modules: [
          {
            name: "Neurologie",
            frenchName: "Neurologie",
            courses: [
              "Sémiologie neurologique : Syndromes pyramidaux, extrapyramidaux, cérébelleux, sensoriels",
              "Accidents Vasculaires Cérébraux (AVC) ischémiques et hémorragiques",
              "Épilepsies de l'adulte (Crises généralisées et partielles)",
              "Sclérose en Plaques (SEP) et maladies démyélinisantes",
              "Maladie de Parkinson et syndromes parkinsoniens",
              "Tumeurs cérébrales et médullaires",
              "Hypertension Intracrânienne (HTIC) et processus expansifs intra-crâniens",
              "Traumatismes crâniens et hématomes (Extradural, Sous-dural)",
              "Neuropathies périphériques et Syndrome de Guillain-Barré",
              "Myasthénie et pathologies de la jonction neuromusculaire"
            ]
          },
          {
            name: "Neurochirurgie",
            frenchName: "Neurochirurgie",
            courses: []
          }
        ]
      },
      {
        name: "Hématologie Clinique",
        frenchName: "Hématologie Clinique",
        modules: [
          {
            name: "Hématologie",
            frenchName: "Hématologie",
            courses: [
              "Sémiologie hématologique et interprétation de l'Hémogramme (FNS)",
              "Anémies carentielles (Ferriprive, Biermer)",
              "Anémies hémolytiques constitutionnelles (Thalassémies, Drépanocytose) et acquises",
              "Leucémies Aiguës (LAL, LAM) : Diagnostic et principes thérapeutiques",
              "Syndromes lymphoprolifératifs chroniques : Leucémie Lymphoïde Chronique (LLC)",
              "Lymphomes malins : Maladie de Hodgkin et Lymphomes Non-Hodgkiniens (LNH)",
              "Syndromes myéloprolifératifs (LMC, Maladie de Vaquez)",
              "Myélome multiple (Maladie de Kahler)",
              "Troubles de l'hémostase primaire : Purpuras, Thrombopénies",
              "Troubles de la coagulation : Hémophilies, Syndrome de CIVD"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "Year 5",
    label: "5ème Année",
    frenchLabel: "5ème Année",
    desc: "Cycle Clinique II : Pathologies Médico-Chirurgicales II & Spécialités",
    units: [
      {
        name: "Appareil Locomoteur",
        frenchName: "Appareil Locomoteur",
        modules: [
          {
            name: "Orthopédie-Traumatologie",
            frenchName: "Orthopédie-Traumatologie",
            courses: [
              "Généralités sur les fractures et les entorses",
              "Fractures de l'extrémité supérieure du fémur",
              "Traumatismes du genou et de la cheville",
              "Traumatismes du rachis",
              "Infections ostéo-articulaires aiguës",
              "Tumeurs osseuses primitives"
            ]
          },
          {
            name: "Rhumatologie",
            frenchName: "Rhumatologie",
            courses: [
              "Polyarthrite rhumatoïde (PR) et Spondylarthrite ankylosante (SPA)",
              "Arthropathies microcristallines",
              "Pathologie radiculaire mécanique : Sciatique et Cruralgie",
              "Arthrose",
              "Ostéopathies fragilisantes",
              "Infections ostéo-articulaires subaiguës et chroniques"
            ]
          },
          {
            name: "Médecine Physique et Réadaptation",
            frenchName: "Médecine Physique et Réadaptation",
            courses: [
              "Principes généraux de la rééducation fonctionnelle"
            ]
          }
        ]
      },
      {
        name: "Gynécologie-Obstétrique",
        frenchName: "Gynécologie-Obstétrique",
        modules: [
          {
            name: "Obstétrique",
            frenchName: "Obstétrique",
            courses: [
              "Diagnostic et surveillance de la grossesse",
              "Hémorragies des 1er, 2ème et 3ème trimestres",
              "États hypertensifs de la grossesse et Pré-éclampsie",
              "Diabète gestationnel",
              "Mécanique et phases de l'accouchement normal",
              "Accouchements dystociques",
              "Pathologies des annexes",
              "Prématurité et Grossesse prolongée",
              "Hémorragies de la délivrance"
            ]
          },
          {
            name: "Gynécologie",
            frenchName: "Gynécologie",
            courses: [
              "Troubles du cycle menstruel",
              "Infertilité du couple",
              "Infections génitales basses et hautes",
              "Tumeurs bénignes de l'utérus et de l'ovaire",
              "Cancers gynécologiques (col, endomètre, ovaire)",
              "Pathologie mammaire et Cancer du sein",
              "Contraception et Ménopause"
            ]
          }
        ]
      },
      {
        name: "Pédiatrie",
        frenchName: "Pédiatrie",
        modules: [
          {
            name: "Pédiatrie Générale",
            frenchName: "Pédiatrie Générale",
            courses: [
              "Croissance staturo-pondérale et développement psychomoteur",
              "Alimentation du nourrisson sain et besoins nutritionnels",
              "Programme National de Vaccination en Algérie"
            ]
          },
          {
            name: "Néonatologie",
            frenchName: "Néonatologie",
            courses: [
              "Prise en charge du nouveau-né sain",
              "Détresse respiratoire néonatale",
              "Ictères néonataux",
              "Infections néonatales"
            ]
          },
          {
            name: "Pathologies Pédiatriques",
            frenchName: "Pathologies Pédiatriques",
            courses: [
              "Malnutritions protéino-énergétiques",
              "Rachitisme carentiel",
              "Déshydratations aiguës du nourrisson",
              "Diabète de type 1 de l'enfant",
              "Infections respiratoires aiguës hautes et basses",
              "Pathologies digestives (Diarrhées, Maladie coeliaque, Mucoviscidose)",
              "Fièvres éruptives de l'enfant",
              "Méningites de l'enfant"
            ]
          }
        ]
      },
      {
        name: "Endocrinologie - Maladies Métaboliques",
        frenchName: "Endocrinologie - Maladies Métaboliques",
        modules: [
          {
            name: "Diabétologie",
            frenchName: "Diabétologie",
            courses: [
              "Diabète de type 2 (Physiopathologie, complications, traitement)"
            ]
          },
          {
            name: "Endocrinologie",
            frenchName: "Endocrinologie",
            courses: [
              "Hyperthyroïdies et Hypothyroïdies",
              "Goitres et Nodules thyroïdiens",
              "Insuffisance surrénalienne",
              "Syndrome de Cushing",
              "Adénomes hypophysaires"
            ]
          }
        ]
      },
      {
        name: "Santé Mentale",
        frenchName: "Santé Mentale",
        modules: [
          {
            name: "Psychiatrie de l'Adulte",
            frenchName: "Psychiatrie de l'Adulte",
            courses: [
              "Sémiologie psychiatrique générale",
              "Schizophrénie et troubles psychotiques",
              "Bouffée délirante aiguë",
              "Troubles de l'humeur (Épisode dépressif, Trouble bipolaire)",
              "Troubles anxieux et TOC",
              "Conduites addictives",
              "Urgences psychiatriques et conduites suicidaires",
              "Maniement des psychotropes"
            ]
          }
        ]
      },
      {
        name: "Urologie - Néphrologie",
        frenchName: "Urologie - Néphrologie",
        modules: [
          {
            name: "Néphrologie",
            frenchName: "Néphrologie",
            courses: [
              "Sémiologie néphrologique",
              "Insuffisance Rénale Aiguë (IRA)",
              "Insuffisance Rénale Chronique (IRC) et suppléance",
              "Syndromes néphrotiques et néphritiques"
            ]
          },
          {
            name: "Urologie",
            frenchName: "Urologie",
            courses: [
              "Lithiase urinaire et Colique néphrétique",
              "Hypertrophie Bénigne et Cancer de la Prostate",
              "Tumeurs de la vessie et du rein",
              "Infections urinaires de l'adulte",
              "Rétention aiguë d'urine et Anurie obstructive",
              "Traumatismes de l'appareil urinaire",
              "Pathologies scrotales aiguës"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "Year 6",
    label: "6ème Année",
    frenchLabel: "6ème Année",
    desc: "Cycle Clinique III : Spécialités Blocs & Santé Publique",
    units: [
      {
        name: "Médecine d'Urgence",
        frenchName: "Médecine d'Urgence",
        modules: [
          {
            name: "Anesthésie-Réanimation",
            frenchName: "Anesthésie-Réanimation",
            courses: [
              "Arrêt cardio-respiratoire (ACR) et RCP",
              "États de choc (hypovolémique, septique, anaphylactique, cardiogénique)",
              "Insuffisance Respiratoire Aiguë (IRA)",
              "Comas non traumatiques",
              "Intoxications aiguës graves",
              "Prise en charge initiale du polytraumatisé",
              "Brûlures graves et caustiques",
              "Principes généraux de l'anesthésie",
              "Équilibre hydro-électrolytique et acido-basique",
              "ECOS - Prise en charge d'un ACR (MCE, pose de canule de Guedel, utilisation du DSA)",
              "ECOS - Interprétation d'un tracé ECG d'urgence (IdM, FV, TV, BAV complet)",
              "ECOS - Calcul des débits d'administration des catécholamines",
              "ECOS - Interprétation d'une gazométrie de crise (acidose métabolique/respiratoire)"
            ]
          }
        ]
      },
      {
        name: "Médecine Légale et Droit Médical",
        frenchName: "Médecine Légale et Droit Médical",
        modules: [
          {
            name: "Médecine Légale",
            frenchName: "Médecine Légale",
            courses: [
              "Déontologie, Secret professionnel et Responsabilité médicale",
              "Certificats médicaux en pratique quotidienne",
              "Thanatologie et diagnostic de la mort",
              "Mort subite de l'adulte et du nourrisson",
              "Traumatisme médico-légal (armes, accidents)",
              "Agressions sexuelles",
              "Législation sanitaire algérienne",
              "ECOS - Rédaction d'un certificat de constatation de coups et blessures involontaires (détermination de l'ITT)",
              "ECOS - Examen et rédaction d'un rapport pour agression sexuelle",
              "ECOS - Description médico-légale des ecchymoses et plaies par arme blanche"
            ]
          }
        ]
      },
      {
        name: "Personne Agée",
        frenchName: "Personne Agée",
        modules: [
          {
            name: "Gériatrie",
            frenchName: "Gériatrie",
            courses: [
              "Physiologie du vieillissement et pharmacologie gériatrique",
              "Syndromes gériatriques (chutes, dénutrition, isolement)",
              "Confusion mentale aiguë chez le sujet âgé",
              "Maladie d'Alzheimer et syndromes apparentés",
              "Évaluation de l'autonomie et de la dépendance"
            ]
          }
        ]
      },
      {
        name: "Maladies Systémiques",
        frenchName: "Maladies Systémiques",
        modules: [
          {
            name: "Médecine Interne",
            frenchName: "Médecine Interne",
            courses: [
              "Lupus Érythémateux Disséminé (LED)",
              "Syndrome de Sjögren et Sclérodermie systémique",
              "Dermatomyosite et Polymyosite",
              "Vascularites systémiques (Horton, PAN, Behçet)",
              "Démarche diagnostique devant un syndrome inflammatoire prolongé"
            ]
          }
        ]
      },
      {
        name: "Dermatologie",
        frenchName: "Dermatologie",
        modules: [
          {
            name: "Dermatologie",
            frenchName: "Dermatologie",
            courses: [
              "Sémiologie dermatologique et lésions élémentaires",
              "Dermatose infectieuses (bactériennes, virales, mycologiques, parasitaires)",
              "Psoriasis, Dermatite atopique et Eczéma de contact",
              "Toxidermies médicamenteuses (Lyell, Stevens-Johnson)",
              "Cancers cutanés (carcinomes, mélanome)",
              "Manifestations dermatologiques des maladies systémiques",
              "ECOS - Identification et classification d'un mélanome (critères ABCDE)",
              "ECOS - Reconnaissance des signes précurseurs d'un syndrome de Lyell"
            ]
          }
        ]
      },
      {
        name: "ORL",
        frenchName: "ORL",
        modules: [
          {
            name: "Oto-Rhino-Laryngologie",
            frenchName: "Oto-Rhino-Laryngologie",
            courses: [
              "Otites moyennes aiguës et chroniques, Vertiges, Surdités",
              "Rhinites, Sinusites aiguës et chroniques, Épistaxis",
              "Angines, Dysphonies, Dyspnées laryngées",
              "Cancers du larynx, du cavum et tuméfactions cervicales",
              "ECOS - Réalisation pratique d'un tamponnement nasal antérieur efficace",
              "ECOS - Conduite à tenir face à une dyspnée laryngée aiguë de l'enfant"
            ]
          }
        ]
      },
      {
        name: "Ophtalmologie",
        frenchName: "Ophtalmologie",
        modules: [
          {
            name: "Ophtalmologie",
            frenchName: "Ophtalmologie",
            courses: [
              "Sémiologie oculaire et examen de l'oeil",
              "Troubles de la réfraction",
              "Oeil rouge et/ou douloureux (Conjonctivites, Kératites, Uvéites, GAFA)",
              "Baisse progressive de la vision (Cataracte, GCAO, DMLA)",
              "Rétinopathie diabétique et hypertensive",
              "Urgences ophtalmologiques (traumatismes, OACR, décollement de rétine)",
              "ECOS - Diagnostic d'une occlusion de l'artère centrale de la rétine (OACR) au fond d'œil",
              "ECOS - Conduite à tenir immédiate devant une brûlure oculaire chimique basique"
            ]
          }
        ]
      },
      {
        name: "Santé au Travail et Environnement",
        frenchName: "Santé au Travail et Environnement",
        modules: [
          {
            name: "Médecine du Travail",
            frenchName: "Médecine du Travail",
            courses: [
              "Organisation de la médecine du travail en Algérie",
              "Pathologies professionnelles chimiques (Saturnisme, solvants)",
              "Pathologies physiques (Bruit, vibrations, rayonnements)",
              "Pathologies respiratoires professionnelles (Silicose, asthme)",
              "Cancers professionnels",
              "Ergonomie, accidents du travail et procédures de déclaration"
            ]
          }
        ]
      },
      {
        name: "Épidémiologie - Méthodologie - LCA - Santé Publique",
        frenchName: "Épidémiologie - Méthodologie - LCA - Santé Publique",
        modules: [
          {
            name: "Épidémiologie",
            frenchName: "Épidémiologie",
            courses: [
              "Épidémiologie descriptive, analytique et évaluative",
              "Méthodologie de la recherche et protocoles d'études",
              "Lecture Critique d'Article (LCA) et interprétation statistique"
            ]
          },
          {
            name: "Santé Publique",
            frenchName: "Santé Publique",
            courses: [
              "Indicateurs de santé et programmes nationaux en Algérie",
              "Planification et Économie de la santé"
            ]
          }
        ]
      }
    ]
  }
];

// Generate Residanat Year Config containing verbatim mapping
const residanatUnits: UnitConfig[] = [
  {
    name: "Sciences Médicales",
    frenchName: "Sciences Médicales",
    modules: [
      { name: "Cardiologie", frenchName: "Cardiologie", courses: ["Valvular Heart Disease", "Coronary Artery Disease", "Heart Failure", "Arterial Hypertension", "Infective Endocarditis"] },
      { name: "Pneumologie", frenchName: "Pneumologie", courses: ["Obstructive Lung Diseases", "Tuberculosis", "Pneumonias", "Pleural Effusions", "Lung Cancer"] },
      { name: "Gastro-entérologie", frenchName: "Gastro-entérologie", courses: ["Peptic Ulcer Disease", "Inflammatory Bowel Disease", "Cirrhosis", "Colorectal Cancer", "Acute Pancreatitis"] },
      { name: "Neurologie", frenchName: "Neurologie", courses: ["Cerebrovascular Disease", "Epilepsies", "Multiple Sclerosis", "Parkinson Disease", "Peripheral Neuropathies"] },
      { name: "Maladies Infectieuses", frenchName: "Maladies Infectieuses", courses: ["Meningitis", "Septic States", "Viral Hepatitis", "Brucellosis", "Antibiotic Stewardship"] },
      { name: "Hématologie", frenchName: "Hématologie", courses: ["Anemias", "Leukemias", "Lymphomas", "Hemostasis Disorders", "Multiple Myeloma"] },
      { name: "Endocrinologie", frenchName: "Endocrinologie", courses: ["Thyroid Disorders", "Diabetes Mellitus", "Adrenal Insufficiency", "Pituitary Disorders", "Calcium Metabolism"] },
      { name: "Rhumatologie", frenchName: "Rhumatologie", courses: ["Joint Pain", "Rheumatoid Arthritis", "Ankylosing Spondylitis", "Gout", "Osteoporosis"] },
      { name: "Néphrologie", frenchName: "Néphrologie", courses: ["Acute Kidney Injury", "Chronic Kidney Disease", "Glomerulonephritis", "Electrolyte Imbalances"] },
      { name: "Pédiatrie", frenchName: "Pédiatrie", courses: ["Infant Growth", "Neonatal Jaundice", "Childhood Infectious Diseases", "Dehydration", "Neonatal Care"] },
      { name: "Dermatologie", frenchName: "Dermatologie", courses: ["Eczema", "Psoriasis", "Acne", "Skin Infections", "Melanoma"] },
      { name: "Psychiatrie", frenchName: "Psychiatrie", courses: ["Schizophrenia", "Bipolar Disorder", "Depressive States", "Anxiety Disorders", "Mood Disorders"] }
    ]
  },
  {
    name: "Sciences Chirurgicales",
    frenchName: "Sciences Chirurgicales",
    modules: [
      { name: "Orthopédie-Traumatologie", frenchName: "Orthopédie-Traumatologie", courses: ["Bone Fractures", "Joint Dislocations", "Osteoarthritis", "Spine Trauma"] },
      { name: "Urologie", frenchName: "Urologie", courses: ["Renal Colic", "Prostate Cancer", "Urinary Tract Infections", "Hematuria"] },
      { name: "Gynécologie-Obstétrique", frenchName: "Gynécologie-Obstétrique", courses: ["Pregnancy Follow-up", "Ectopic Pregnancy", "Uterine Fibroids", "Contraception", "Pregnancy Disorders"] },
      { name: "ORL", frenchName: "ORL", courses: ["Otitis Media", "Epistaxis", "Sinusitis", "Hearing Loss", "Tonsillitis"] },
      { name: "Ophtalmologie", frenchName: "Ophtalmologie", courses: ["Cataract", "Acute Glaucoma", "Refractive Errors", "Diabetic Retinopathy", "Conjunctivitis"] }
    ]
  },
  {
    name: "Sciences Fondamentales",
    frenchName: "Sciences Fondamentales",
    modules: [
      { name: "Anatomie", frenchName: "Anatomie", courses: ["Introduction à l'Anatomie", "Ostéologie (Étude des os)", "Squelette axial", "Membres supérieurs", "Membres inférieurs", "Arthrologie (Étude des articulations)", "Myologie (Étude des muscles)", "Neuroanatomie (Système Nerveux Central)", "Anatomie du Thorax", "Anatomie de l'Abdomen et du Pelvis"] },
      { name: "Physiologie", frenchName: "Physiologie", courses: ["Introduction à la physiologie cellulaire", "Potentiels transmembranaires", "Physiologie neuromusculaire", "Physiologie du système nerveux autonome", "Neurophysiologie", "Physiologie Cardiovasculaire", "Physiologie Respiratoire", "Physiologie Rénale", "Physiologie Endocrinienne"] },
      { name: "Biochimie", frenchName: "Biochimie", courses: ["Les Glucides", "Les Lipides", "Les Acides Aminés et Protéines", "Enzymologie", "Biochimie Métabolique", "Métabolisme des Glucides", "Métabolisme des Lipides", "Métabolisme des Composés Azotés"] },
      { name: "Histologie", frenchName: "Histologie", courses: ["Histologie Générale (Les 4 tissus fondamentaux)", "Tissus épithéliaux", "Tissus conjonctifs", "Tissu musculaire", "Tissu nerveux", "Histologie du Système Nerveux", "Histologie Cardiorespiratoire", "Histologie Digestive", "Histologie Rénale"] },
      { name: "Embryologie", frenchName: "Embryologie", courses: ["Embryologie Générale (Du gamète à la 4ème semaine)", "Gamétogénèse", "Fécondation", "Première semaine", "Deuxième semaine (Nidation)", "Troisième semaine (Gastrulation)", "Quatrième semaine (Délimitation)"] },
      { name: "Pharmacologie", frenchName: "Pharmacologie", courses: ["Pharmacologie Générale", "Pharmacocinétique Générale", "Pharmacodynamie Générale", "Pharmacocinétique", "Pharmacodynamie", "Règles Générales de Prescription et Pharmacovigilance"] },
      { name: "Immunologie", frenchName: "Immunologie", courses: ["Organes et Cellules du Système Immunitaire", "Immunité Innée et Adaptative", "Le Complexe Majeur d'Histocompatibilité", "Le Système du Complément", "Pathologies du Système Immunitaire"] },
      { name: "Parasitologie", frenchName: "Parasitologie", courses: ["Introduction à la Parasitologie", "Parasitologie Systématique", "Mycologie Médicale"] },
      { name: "Microbiologie", frenchName: "Microbiologie", courses: ["Bactériologie Générale", "Antibiotiques et Résistance", "Bactériologie Systématique", "Virologie Générale et Systématique"] },
      { name: "Anatomie Pathologique", frenchName: "Anatomie Pathologique", courses: ["Introduction à l'Anatomie Pathologique", "Lésions Élémentaires Cellulaires et Tissulaires", "Inflammation Aiguë et Chronique", "Pathologie Tumorale Générale"] }
    ]
  }
];

export const ALGERIAN_CURRICULUM: YearConfig[] = [
  ...BASE_ALGERIAN_CURRICULUM,
  {
    key: "Residanat",
    label: "Concours de Résidanat",
    frenchLabel: "Résidanat",
    desc: "Syllabus complet du concours national de Résidanat en Algérie (Contient l'intégralité des spécialités médicales, chirurgicales et sciences fondamentales).",
    units: residanatUnits
  }
];

export interface Module {
  name: string;
}

export interface Unite {
  name: string;
  modules: Module[];
}

export interface CurriculumStructure {
  [yearKey: string]: {
    label: string;
    unites: Unite[];
  };
}

export const curriculumData: CurriculumStructure = {
  "1ère Année": {
    label: "1ère Année",
    unites: [
      { name: "Anatomie Humaine (Générale et Membres)", modules: [{ name: "Anatomie Humaine (Générale et Membres)" }] },
      { name: "Histologie & Embryologie Générale", modules: [{ name: "Histologie & Embryologie Générale" }] },
      { name: "Cytologie / Biologie Cellulaire", modules: [{ name: "Cytologie / Biologie Cellulaire" }] },
      { name: "Biochimie Structurale", modules: [{ name: "Biochimie Structurale" }] },
      { name: "Biophysique Générale", modules: [{ name: "Biophysique Générale" }] },
      { name: "Chimie Générale et Organique", modules: [{ name: "Chimie Générale et Organique" }] },
      { name: "Informatique - Biostatistique", modules: [{ name: "Informatique - Biostatistique" }] },
      { name: "Sciences Humaines et Sociales (Ethique & Déontologie)", modules: [{ name: "Sciences Humaines et Sociales (Ethique & Déontologie)" }] },
      { name: "Physiologie Générale", modules: [{ name: "Physiologie Générale" }] },
      { name: "Français Médical & Terminologie", modules: [{ name: "Français Médical & Terminologie" }] }
    ]
  },
  "2ème Année": {
    label: "2ème Année",
    unites: [
      { name: "Anatomie Topographique et Viscérale", modules: [{ name: "Anatomie Topographique et Viscérale" }] },
      { name: "Physiologie Humaine (Grandes Fonctions)", modules: [{ name: "Physiologie Humaine (Grandes Fonctions)" }] },
      { name: "Biochimie Métabolique", modules: [{ name: "Biochimie Métabolique" }] },
      { name: "Génétique Médicale", modules: [{ name: "Génétique Médicale" }] },
      { name: "Biophysique Spécialisée & Explorations Fonctionnelles", modules: [{ name: "Biophysique Spécialisée & Explorations Fonctionnelles" }] }
    ]
  },
  "3ème Année": {
    label: "3ème Année",
    unites: [
      { name: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale", modules: [{ name: "UEI 1 : Sémiologie Générale, Cardiovasculaire, Respiratoire & Psychologie Médicale" }] },
      { name: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie", modules: [{ name: "UEI 2 : Neurologie, Appareil Locomoteur & Dermatologie" }] },
      { name: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire", modules: [{ name: "UEI 3 : Endocrinologie, Appareil Reproducteur & Appareil Urinaire" }] },
      { name: "UEI 4 : Appareil Digestif & Système Hématopoïétique", modules: [{ name: "UEI 4 : Appareil Digestif & Système Hématopoïétique" }] },
      { name: "Anatomie Pathologique Générale (Anapath / ACP)", modules: [{ name: "Anatomie Pathologique Générale (Anapath / ACP)" }] },
      { name: "Immunologie Générale", modules: [{ name: "Immunologie Générale" }] },
      { name: "Microbiologie Médicale (Bactériologie - Virologie)", modules: [{ name: "Microbiologie Médicale (Bactériologie - Virologie)" }] },
      { name: "Parasitologie - Mycologie Médicale", modules: [{ name: "Parasitologie - Mycologie Médicale" }] },
      { name: "Pharmacologie Clinique Générale", modules: [{ name: "Pharmacologie Clinique Générale" }] }
    ]
  },
  "4ème Année": {
    label: "4ème Année",
    unites: [
      { name: "Cardiologie et Pathologies Vasculaires", modules: [{ name: "Cardiologie" }, { name: "Chirurgie Cardiaque" }, { name: "Chirurgie Vasculaire" }] },
      { name: "Pneumologie et Pthisiologie", modules: [{ name: "Pneumologie" }, { name: "Chirurgie Thoracique" }] },
      { name: "Gastro-Entérologie et Chirurgie Digestive", modules: [{ name: "Gastro-Entérologie" }, { name: "Chirurgie Digestive / Viscérale" }] },
      { name: "Maladies Infectieuses", modules: [{ name: "Infectiologie" }] },
      { name: "Neurologie et Neurochirurgie", modules: [{ name: "Neurologie" }, { name: "Neurochirurgie" }] },
      { name: "Hématologie Clinique", modules: [{ name: "Hématologie" }] }
    ]
  },
  "5ème Année": {
    label: "5ème Année",
    unites: [
      { name: "Appareil Locomoteur", modules: [{ name: "Orthopédie-Traumatologie" }, { name: "Rhumatologie" }, { name: "Médecine Physique et Réadaptation" }] },
      { name: "Gynécologie-Obstétrique", modules: [{ name: "Obstétrique" }, { name: "Gynécologie" }] },
      { name: "Pédiatrie", modules: [{ name: "Pédiatrie Générale" }, { name: "Néonatologie" }, { name: "Pathologies Pédiatriques" }] },
      { name: "Endocrinologie - Maladies Métaboliques", modules: [{ name: "Diabétologie" }, { name: "Endocrinologie" }] },
      { name: "Santé Mentale", modules: [{ name: "Psychiatrie de l'Adulte" }] },
      { name: "Urologie - Néphrologie", modules: [{ name: "Néphrologie" }, { name: "Urologie" }] }
    ]
  },
  "6ème Année": {
    label: "6ème Année",
    unites: [
      { name: "Médecine d'Urgence", modules: [{ name: "Anesthésie-Réanimation" }] },
      { name: "Médecine Légale et Droit Médical", modules: [{ name: "Médecine Légale" }] },
      { name: "Personne Agée", modules: [{ name: "Gériatrie" }] },
      { name: "Maladies Systémiques", modules: [{ name: "Médecine Interne" }] },
      { name: "Dermatologie", modules: [{ name: "Dermatologie" }] },
      { name: "ORL", modules: [{ name: "Oto-Rhino-Laryngologie" }] },
      { name: "Ophtalmologie", modules: [{ name: "Ophtalmologie" }] },
      { name: "Santé au Travail et Environnement", modules: [{ name: "Médecine du Travail" }] },
      { name: "Épidémiologie - Méthodologie - LCA - Santé Publique", modules: [{ name: "Épidémiologie" }, { name: "Santé Publique" }] }
    ]
  },
  "Residanat": {
    label: "Résidanat",
    unites: [
      { name: "Sciences Médicales", modules: [{ name: "Cardiologie" }, { name: "Pneumologie" }, { name: "Gastro-entérologie" }, { name: "Neurologie" }, { name: "Maladies Infectieuses" }, { name: "Hématologie" }, { name: "Endocrinologie" }, { name: "Rhumatologie" }, { name: "Néphrologie" }, { name: "Pédiatrie" }, { name: "Dermatologie" }, { name: "Psychiatrie" }] },
      { name: "Sciences Chirurgicales", modules: [{ name: "Orthopédie-Traumatologie" }, { name: "Urologie" }, { name: "Gynécologie-Obstétrique" }, { name: "ORL" }, { name: "Ophtalmologie" }] },
      { name: "Sciences Fondamentales", modules: [{ name: "Anatomie" }, { name: "Physiologie" }, { name: "Biochimie" }, { name: "Histologie" }, { name: "Embryologie" }, { name: "Pharmacologie" }, { name: "Immunologie" }, { name: "Parasitologie" }, { name: "Microbiologie" }, { name: "Anatomie Pathologique" }] }
    ]
  }
};

export const getYearConfig = (year: AcademicYear): YearConfig => {
  return ALGERIAN_CURRICULUM.find((y) => y.key === year) || ALGERIAN_CURRICULUM[2]; // Default to Year 3
};
