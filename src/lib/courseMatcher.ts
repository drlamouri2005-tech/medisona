/**
 * Advanced matching logic to associate clinical/fundamental questions with granular course options.
 * This is crucial because Year 1, 2, and 3 have been refactored into modular sub-topics
 * whereas the question database might contain the broader clinical chapter titles.
 */
export function doesQuestionMatchCourse(questionCourse: string, selectedCourse: string): boolean {
  if (!questionCourse || !selectedCourse) return false;
  
  const qc = questionCourse.toLowerCase().trim();
  const sc = selectedCourse.toLowerCase().trim();

  if (qc === sc) return true;

  // If the question's course contains the selected course (or vice versa) as a complete phrase, it's a match
  if (qc.includes(sc) || sc.includes(qc)) return true;

  // Clean and split strings into words for keyword overlap check
  // We remove common short French medical words and prepositions
  const stopWords = new Set([
    "et", "ou", "de", "la", "le", "les", "du", "des", "en", "dans", "par", "pour", "sur", "avec", 
    "un", "une", "aux", "au", "générale", "spécifique", "clinique", "médicale", "systématique", "descriptive",
    "and", "the", "of", "in", "with", "for", "to", "membre", "supérieur", "inférieur", "appareil", "voie", "voies",
    "grandes", "fonctions", "physiologie", "sémiologie", "physiopathologie", "biochimie"
  ]);

  const cleanWords = (str: string) => {
    return str
      .replace(/[():,;./_+-]/g, " ") // replace punctuation with spaces
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 2 && !stopWords.has(w));
  };

  const qWords = cleanWords(questionCourse);
  const sWords = cleanWords(selectedCourse);

  if (qWords.length === 0 || sWords.length === 0) return false;

  // Count matches
  let matches = 0;
  for (const sw of sWords) {
    if (qWords.includes(sw)) {
      matches++;
    }
  }

  // At least 50% of the significant terms in the selected course must be present in the question course (up to a max requirement of 2 matched terms)
  const threshold = Math.min(2, Math.ceil(sWords.length * 0.5));
  if (matches >= threshold) {
    return true;
  }

  // Special cases fallback (e.g. abbreviations, prefix checks)
  if (sWords.some(sw => sw === "anapath") && qWords.some(qw => qw.includes("pathologique") || qw === "acp")) {
    return true;
  }

  return false;
}
