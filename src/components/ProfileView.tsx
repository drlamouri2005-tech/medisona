import React from "react";
import { useStudent } from "./StudentContext";
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  LogOut, 
  ChartBar, 
  Sparkles, 
  Palette, 
  Loader2, 
  Plus, 
  Check 
} from "lucide-react";
import { AcademicYear, ALL_ACADEMIC_YEARS } from "../types";
import { PRESET_THEMES, applyTheme, getSavedTheme, Theme } from "../lib/theme";

interface ProfileViewProps {
  onReplayWelcome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onReplayWelcome }) => {
  const { student, progress, updateAcademicYear, resetProgress, allQuestions, signOutStudent } = useStudent();

  // Appearance & Theme States
  const [activeTheme, setActiveTheme] = React.useState<Theme>(getSavedTheme);
  const [customThemes, setCustomThemes] = React.useState<Theme[]>(() => {
    try {
      const saved = localStorage.getItem("med_custom_themes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [themeError, setThemeError] = React.useState("");

  if (!student || !progress) return null;

  // Determine their base academic year from profile
  const baseYear = React.useMemo(() => {
    let saved = localStorage.getItem("med_registered_base_year");
    if (!saved && student.academicYear !== "Residanat") {
      localStorage.setItem("med_registered_base_year", student.academicYear);
      saved = student.academicYear;
    }
    return saved || (student.academicYear !== "Residanat" ? student.academicYear : "Year 3");
  }, [student.academicYear]);

  const academicYearsList = (student.isAdmin || student.academicYear === "Residanat")
    ? ALL_ACADEMIC_YEARS
    : ([baseYear, "Residanat"] as AcademicYear[]);

  // Calculate statistics for profile overview
  const totalInBank = allQuestions.length;
  const yearQs = allQuestions.filter((q) => {
    if (q.academicYear === student.academicYear) return true;
    if (q.is_residanat_origin) {
      const activeNum = student.academicYear.replace("Year ", "").trim();
      const targetNum = (q.target_undergrad_year || "")
        .replace("Year ", "")
        .replace("ème Année", "")
        .replace("ème", "")
        .trim();
      return targetNum === activeNum || q.target_undergrad_year === student.academicYear;
    }
    return false;
  });
  const totalYearQs = yearQs.length;

  const answeredIds = Object.keys(progress.answers).filter((qId) =>
    yearQs.some((q) => q.id === qId)
  );
  const totalAnswered = answeredIds.length;
  const correctCount = answeredIds.filter((qId) => progress.answers[qId].correct).length;
  const incorrectCount = totalAnswered - correctCount;

  const handleYearChange = async (year: AcademicYear) => {
    if (year === student.academicYear) return;
    if (window.confirm(`Are you sure you want to change your academic year to ${year}? Your questions feed, units, courses, and exam mode will update immediately.`)) {
      await updateAcademicYear(year);
    }
  };

  const handleReset = async () => {
    if (window.confirm("WARNING: Are you sure you want to reset all your QCM answer history? This action is permanent and will clear your success statistics from your Firestore cloud database.")) {
      await resetProgress();
      alert("Answer history has been reset successfully!");
    }
  };

  // Theme operations
  const handleApplyTheme = (theme: Theme) => {
    applyTheme(theme);
    setActiveTheme(theme);
  };

  const handleGenerateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setThemeError("");

    try {
      const response = await fetch("/api/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error("Could not contact the theme AI generator. Please check your connection.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Safeguard fallback defaults
      const newTheme: Theme = {
        id: "ai-custom",
        name: data.name || `Ambiance: ${aiPrompt.trim().substring(0, 16)}`,
        isDark: true, // Custom themes are beautiful immersive workspaces
        variables: {
          "--color-bg": data.bgColor || "#08090D",
          "--color-surface": data.surfaceColor || "#0D0E12",
          "--color-surface-hover": data.surfaceHoverColor || "#171A22",
          "--color-border": data.borderColor || "#1B1E26",
          "--color-text": data.textColor || "#FAF9F6",
          "--color-text-muted": data.textMutedColor || "#8C929D",
          "--color-accent": data.accentColor || "#7D8C61",
          "--color-accent-hover": data.accentHoverColor || "#6D7C52",
        },
      };

      // Add to local custom options
      const updatedList = [newTheme, ...customThemes.filter(t => t.name !== newTheme.name)].slice(0, 3);
      setCustomThemes(updatedList);
      localStorage.setItem("med_custom_themes", JSON.stringify(updatedList));
      
      // Apply instantly
      handleApplyTheme(newTheme);
      setAiPrompt("");
    } catch (err: any) {
      console.error("[ProfileView] Theme generator error:", err);
      setThemeError(err.message || "Failed to generate theme colors. Try typing a simpler prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="profile-view-layout">
      {/* Profile Overview Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2.25rem] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left">
        <div className="w-20 h-20 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center text-3xl font-serif font-black shrink-0 shadow-md shadow-[var(--color-accent)]/15">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <h2 className="text-3xl font-serif font-black text-[var(--color-text)]">{student.name}</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-mono text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {student.academicYear}
            </span>
            <span className="flex items-center gap-1.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Inscrit le {new Date(student.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance & AI Theme Customization Panel */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6 text-left">
        <div className="border-b border-[var(--color-border)]/55 pb-3">
          <h3 className="font-serif font-black text-lg text-[var(--color-text)] flex items-center gap-2">
            <Palette className="text-[var(--color-accent)] w-5 h-5" /> Design System & Thèmes IA
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs mt-1.5 leading-relaxed font-sans">
            Sélectionnez un style de travail poli ou laissez l'Intelligence Artificielle générer une ambiance clinique sur-mesure pour vos sessions nocturnes.
          </p>
        </div>

        {/* Theme presets grid */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Thèmes installés</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Presets */}
            {Object.values(PRESET_THEMES).map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleApplyTheme(theme)}
                  className={`p-4 border rounded-2xl text-left font-mono text-xs uppercase tracking-wider transition-all duration-300 relative flex flex-col justify-between h-24 cursor-pointer hover:scale-[1.02] ${
                    isSelected
                      ? "bg-[var(--color-surface-hover)] border-[var(--color-accent)] shadow-sm"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-[var(--color-text)] leading-none">{theme.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />}
                  </div>
                  {/* Little color dot indicators */}
                  <div className="flex gap-1.5 pt-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-bg"] }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-surface"] }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-accent"] }}></span>
                  </div>
                </button>
              );
            })}

            {/* AI Custom themes list */}
            {customThemes.map((theme, idx) => {
              const isSelected = activeTheme.id === "ai-custom" && activeTheme.name === theme.name;
              return (
                <button
                  key={idx}
                  onClick={() => handleApplyTheme(theme)}
                  className={`p-4 border rounded-2xl text-left font-mono text-xs uppercase tracking-wider transition-all duration-300 relative flex flex-col justify-between h-24 cursor-pointer hover:scale-[1.02] ${
                    isSelected
                      ? "bg-[var(--color-surface-hover)] border-[var(--color-accent)] shadow-sm"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-black text-[var(--color-text)] leading-tight text-[10px] truncate max-w-[140px]">{theme.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />}
                  </div>
                  <div className="flex justify-between items-end w-full">
                    <div className="flex gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-bg"] }}></span>
                      <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-surface"] }}></span>
                      <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: theme.variables["--color-accent"] }}></span>
                    </div>
                    <span className="text-[8px] text-[var(--color-accent)] font-bold">IA</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Theme generator input */}
        <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 space-y-4">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Laboratoire d'Ambiance de l'IA
          </p>

          <form onSubmit={handleGenerateTheme} className="flex gap-2">
            <input
              type="text"
              required
              disabled={isGenerating}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Bleu chirurgie d'urgence, or calme, nuit profonde..."
              className="flex-1 px-3 py-2.5 bg-white border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={isGenerating || !aiPrompt.trim()}
              className="px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Créer
                </>
              )}
            </button>
          </form>

          {themeError && (
            <p className="text-[10px] font-mono text-red-500">{themeError}</p>
          )}

          {/* Quick live preview panel */}
          <div className="border-t border-[var(--color-border)]/55 pt-4">
            <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Aperçu du Thème Actif</p>
            <div className="p-4 rounded-xl border flex items-center justify-between transition-colors duration-300" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold" style={{ color: "var(--color-text)" }}>Terminal Clinique</p>
                <p className="text-[9px] font-mono" style={{ color: "var(--color-text-muted)" }}>Échantillon de texte secondaire</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider text-white" style={{ backgroundColor: "var(--color-accent)" }}>
                Accentuation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Curriculaire / Scope Settings */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4 text-left">
        <div className="border-b border-[var(--color-border)]/55 pb-3">
          <h3 className="font-serif font-black text-lg text-[var(--color-text)] flex items-center gap-2">
            <GraduationCap className="text-[var(--color-accent)] w-5 h-5" /> Workspace Curriculaire
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs mt-1.5 leading-relaxed font-sans">
            {student.isAdmin || student.academicYear === "Residanat"
              ? "Accès Résidanat/Admin Activé — Vous pouvez basculer bilatéralement entre toutes les années."
              : `Votre compte est configuré pour la ${student.academicYear.replace("Year ", "")}e Année.`}
          </p>
        </div>

        {student.isAdmin || student.academicYear === "Residanat" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {academicYearsList.map((year) => {
              const isCurrent = year === student.academicYear;
              return (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`p-3.5 border rounded-xl text-center font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 relative select-none cursor-pointer hover:scale-[1.01] ${
                    isCurrent
                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/15"
                      : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {year === "Residanat" ? "Résidanat" : `${year.replace("Year ", "")}e Année`}
                  {isCurrent && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute top-2 right-2 fill-current" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-2.5 px-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono font-bold rounded-xl text-xs inline-block">
            {student.academicYear.replace("Year ", "")}e Année Unique
          </div>
        )}
      </div>

      {/* Detailed Stats Block */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-5 text-left">
        <h3 className="font-serif font-black text-lg text-[var(--color-text)] border-b border-[var(--color-border)]/55 pb-3 flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[var(--color-accent)]" /> Rapport Clinique de Progression
        </h3>
        <div className="grid grid-cols-2 gap-3.5 text-center">
          <div className="p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-hover)]">
            <p className="text-2xl font-serif font-black text-[var(--color-text)]">{totalAnswered} / {totalYearQs}</p>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 font-bold">Progression Annuelle</p>
          </div>
          <div className="p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-hover)]">
            <p className="text-2xl font-serif font-black text-[var(--color-accent)]">{correctCount}</p>
            <p className="text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-wider mt-1.5 font-bold">QCMs Corrects</p>
          </div>
          <div className="p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-hover)]">
            <p className="text-2xl font-serif font-black text-[#C58B74]">{incorrectCount}</p>
            <p className="text-[10px] font-mono text-[#C58B74] uppercase tracking-wider mt-1.5 font-bold">QCMs Incorrects</p>
          </div>
          <div className="p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-hover)]">
            <p className="text-2xl font-serif font-black text-[var(--color-text)]">{totalInBank}</p>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 font-bold">Banque Globale</p>
          </div>
        </div>
      </div>

      {/* Cinematic Portal Welcome Screen Retrigger */}
      {onReplayWelcome && (
        <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4 text-left">
          <h3 className="font-serif font-black text-lg text-[var(--color-text)] border-b border-[var(--color-border)]/55 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" /> Cinématique Holographique
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed font-sans">
            Rejouez la séquence cinématique d'authentification 3D avec les animations physiques des nébuleuses de poussière microscopiques et le suivi des connexions synaptiques.
          </p>

          <button
            onClick={onReplayWelcome}
            className="px-5 py-3.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/25 font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Relancer la Cinématique
          </button>
        </div>
      )}

      {/* Dangerous/Reset Settings */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4 text-left">
        <h3 className="font-serif font-black text-lg text-[var(--color-text)] border-b border-[var(--color-border)]/55 pb-3">
          Réinitialisation des Données
        </h3>
        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed font-sans">
          Besoin de remettre vos scores à zéro pour une nouvelle session de révision complète avant les examens ? Cette action videra votre historique de QCMs de manière permanente. Vos notes personnelles resteront intactes.
        </p>

        <button
          onClick={handleReset}
          className="px-5 py-3.5 bg-[#C58B74]/10 border border-[#C58B74]/30 text-[#C58B74] hover:bg-[#C58B74]/20 font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Réinitialiser mes Statistiques
        </button>
      </div>

      {/* Premium Account Security */}
      <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4 text-left">
        <h3 className="font-serif font-black text-lg text-[var(--color-text)] border-b border-[var(--color-border)]/55 pb-3">
          Sécurité de la Session Clinique
        </h3>
        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed font-sans">
          Fermez votre session active certifiée. Votre compte premium limitant les connexions simultanées, la déconnexion garantit la possibilité d'accès depuis n'importe quel autre terminal en toute sécurité.
        </p>

        <button
          onClick={signOutStudent}
          className="px-6 py-4 bg-[var(--color-text)] hover:bg-[var(--color-text-muted)] text-[var(--color-bg)] font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Fermer ma Session de Travail
        </button>
      </div>
    </div>
  );
};
