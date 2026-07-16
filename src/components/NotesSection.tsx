import React, { useState } from "react";
import { useStudent } from "./StudentContext";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Clipboard, 
  MessageSquare, 
  Heart, 
  Search, 
  Filter, 
  Sparkles, 
  User, 
  Users,
  Send,
  BookOpen,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollReveal, Magnetic } from "./EliteInteractions";

export const NotesSection: React.FC = () => {
  const { 
    notes, 
    addNote, 
    deleteNote,
    student,
    communityAdvices = [],
    addCommunityAdvice,
    likeCommunityAdvice,
    deleteCommunityAdvice,
    allQuestions = []
  } = useStudent();

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"private" | "community">("private");

  // Dynamic Units and Modules based on the student's active academic year
  const studentYearQuestions = student?.academicYear === "Residanat"
    ? (allQuestions || [])
    : (allQuestions?.filter(q => {
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
      }) || []);
  const availableUnits = Array.from(new Set(studentYearQuestions.map(q => q.unit).filter(Boolean))) as string[];
  const availableModules = Array.from(new Set(studentYearQuestions.map(q => q.module).filter(Boolean))) as string[];

  // Private Notes state
  const [noteText, setNoteText] = useState<string>("");
  const [privateUnit, setPrivateUnit] = useState<string>("Général");
  const [privateModule, setPrivateModule] = useState<string>("Général");
  const [isSubmittingPrivate, setIsSubmittingPrivate] = useState<boolean>(false);
  
  // Private Note filters
  const [privateUnitFilter, setPrivateUnitFilter] = useState<string>("All");
  const [privateModuleFilter, setPrivateModuleFilter] = useState<string>("All");
  const [privateSearch, setPrivateSearch] = useState<string>("");

  // Community Advice state
  const [adviceText, setAdviceText] = useState<string>("");
  const [adviceUnit, setAdviceUnit] = useState<string>("Général");
  const [adviceModule, setAdviceModule] = useState<string>("Général");
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState<boolean>(false);
  
  // Community Advice filters
  const [adviceSearch, setAdviceSearch] = useState<string>("");
  const [adviceUnitFilter, setAdviceUnitFilter] = useState<string>("All");
  const [adviceModuleFilter, setAdviceModuleFilter] = useState<string>("All");

  const handlePrivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingPrivate(true);
    try {
      await addNote(
        noteText.trim(),
        privateUnit !== "Général" ? privateUnit : undefined,
        privateModule !== "Général" ? privateModule : undefined
      );
      setNoteText("");
      setPrivateUnit("Général");
      setPrivateModule("Général");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPrivate(false);
    }
  };

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adviceText.trim()) return;

    setIsSubmittingAdvice(true);
    try {
      const category = adviceModule !== "Général" ? adviceModule : (adviceUnit !== "Général" ? adviceUnit : "Général");
      await addCommunityAdvice(
        adviceText.trim(),
        category,
        adviceUnit !== "Général" ? adviceUnit : undefined,
        adviceModule !== "Général" ? adviceModule : undefined
      );
      setAdviceText("");
      setAdviceUnit("Général");
      setAdviceModule("Général");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  // Filtered Private Notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.text.toLowerCase().includes(privateSearch.toLowerCase());
    const matchesUnit = privateUnitFilter === "All" || note.unit === privateUnitFilter;
    const matchesModule = privateModuleFilter === "All" || note.module === privateModuleFilter;
    return matchesSearch && matchesUnit && matchesModule;
  });

  // Filtered Community Advice
  const filteredAdvices = communityAdvices.filter((item) => {
    const matchesSearch = item.text.toLowerCase().includes(adviceSearch.toLowerCase()) ||
                          item.authorName.toLowerCase().includes(adviceSearch.toLowerCase());
    const matchesUnit = adviceUnitFilter === "All" || item.unit === adviceUnitFilter;
    const matchesModule = adviceModuleFilter === "All" || item.module === adviceModuleFilter;
    return matchesSearch && matchesUnit && matchesModule;
  });

  // Dynamic color function for tags based on modulo of text hash
  const getCategoryColor = (category: string) => {
    if (!category || category === "Général" || category === "General") {
      return "bg-[#FAF9F6] text-[#7A756D] border-[#E6E2D8] dark:bg-[#171A22]/30 dark:border-[#1B1E26]/40";
    }
    // simple hash to generate deterministic colors
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 4;
    const colors = [
      "bg-amber-50 text-amber-800 border-amber-200/50 dark:bg-amber-950/15 dark:text-amber-300 dark:border-amber-900/30",
      "bg-[#7D8C61]/10 text-[#7D8C61] border-[#7D8C61]/20 dark:bg-[#8CA365]/10 dark:text-[#8CA365] dark:border-[#8CA365]/20",
      "bg-blue-50 text-blue-800 border-blue-200/50 dark:bg-blue-950/15 dark:text-blue-300 dark:border-blue-900/30",
      "bg-[#C58B74]/10 text-[#C58B74] border-[#C58B74]/20 dark:bg-[#C58B74]/15 dark:text-[#C58B74] dark:border-[#C58B74]/20"
    ];
    return colors[index];
  };

  return (
    <div className="space-y-8" id="notes-view text-left">
      
      {/* Maven Style Sub-navigation tabs */}
      <ScrollReveal delay={0} yOffset={10}>
        <div className="bg-[#F2F0E9]/80 dark:bg-[#171A22]/80 p-1.5 rounded-2xl flex border border-[#E6E2D8] dark:border-[#1B1E26] max-w-md">
          <button
            onClick={() => setActiveSubTab("private")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              activeSubTab === "private"
                ? "bg-white dark:bg-[#2C303D] text-[#7D8C61] dark:text-[#8CA365] shadow-sm"
                : "text-[#7A756D] dark:text-[#8C929D] hover:text-[#423F3A] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Private Notebook</span>
          </button>
          <button
            onClick={() => setActiveSubTab("community")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              activeSubTab === "community"
                ? "bg-white dark:bg-[#2C303D] text-[#7D8C61] dark:text-[#8CA365] shadow-sm"
                : "text-[#7A756D] dark:text-[#8C929D] hover:text-[#423F3A] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Classroom Board</span>
            {communityAdvices.length > 0 && (
              <span className="bg-[#C58B74] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {communityAdvices.length}
              </span>
            )}
          </button>
        </div>
      </ScrollReveal>

      <AnimatePresence mode="wait">
        {activeSubTab === "private" ? (
          <motion.div
            key="private-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-[1.75rem] p-6 sm:p-8 shadow-sm text-left space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-2.5">
                <FileText className="text-[#7D8C61] dark:text-[#8CA365] w-5 h-5" /> Private Clinical Scratchpad
              </h2>
              <p className="text-[#7A756D] dark:text-[#8C929D] text-sm font-sans max-w-xl">
                Store private clinical pearls, diagnostic mnemonic structures, and custom reminders. This notebook is fully encrypted and synced with your account.
              </p>
            </div>

            {/* Private Notes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Note Composer */}
              <div className="lg:col-span-1">
                <form onSubmit={handlePrivateSubmit} className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 shadow-sm space-y-4 sticky top-6 text-left">
                  <h3 className="font-mono font-bold text-[#423F3A] dark:text-[#FAF9F6] text-xs uppercase tracking-widest">New Pearl</h3>
                  
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g., SAD Triad of Aortic Stenosis: Syncope, Angina, Dyspnea..."
                    rows={4}
                    className="w-full p-3 text-sm border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] bg-[#FAF9F6]/40 dark:bg-[#171A22]/20 text-[#423F3A] dark:text-[#FAF9F6] resize-y"
                    disabled={isSubmittingPrivate}
                  />

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-wider">Integrated Unit (Optional)</label>
                    <select
                      value={privateUnit}
                      onChange={(e) => setPrivateUnit(e.target.value)}
                      className="w-full p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-xs bg-white dark:bg-[#171A22] text-[#423F3A] dark:text-[#FAF9F6] focus:ring-1 focus:ring-[#7D8C61] cursor-pointer"
                    >
                      <option value="Général">Général / Non-spécifié</option>
                      {availableUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-wider">Module (Optional)</label>
                    <select
                      value={privateModule}
                      onChange={(e) => setPrivateModule(e.target.value)}
                      className="w-full p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-xs bg-white dark:bg-[#171A22] text-[#423F3A] dark:text-[#FAF9F6] focus:ring-1 focus:ring-[#7D8C61] cursor-pointer"
                    >
                      <option value="Général">Général / Non-spécifié</option>
                      {availableModules.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPrivate || !noteText.trim()}
                    className={`w-full py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest transition duration-150 font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      !noteText.trim() || isSubmittingPrivate
                        ? "bg-[#F2F0E9] dark:bg-[#171A22]/50 text-[#9A9489] dark:text-[#8C929D]/40 cursor-not-allowed"
                        : "bg-[#423F3A] dark:bg-[#171A22] hover:bg-[#5C5852] dark:hover:bg-[#2C303D] text-white dark:text-[#FAF9F6] border dark:border-[#1B1E26]"
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Save to Scratchpad
                  </button>
                </form>
              </div>

              {/* Note Cards List */}
              <div className="lg:col-span-2 space-y-4 text-left">
                {/* Search and Filters panel for private notes */}
                <div className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#9A9489] dark:text-[#8C929D]/60" />
                    <input
                      type="text"
                      value={privateSearch}
                      onChange={(e) => setPrivateSearch(e.target.value)}
                      placeholder="Search private notes..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7D8C61] bg-[#FAF9F6]/30 dark:bg-[#171A22]/10 text-[#423F3A] dark:text-[#FAF9F6] font-sans"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                      value={privateUnitFilter}
                      onChange={(e) => setPrivateUnitFilter(e.target.value)}
                      className="p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-[10px] font-mono bg-white dark:bg-[#0D0E12] text-[#7A756D] dark:text-[#FAF9F6] cursor-pointer"
                    >
                      <option value="All">All Units</option>
                      {availableUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>

                    <select
                      value={privateModuleFilter}
                      onChange={(e) => setPrivateModuleFilter(e.target.value)}
                      className="p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-[10px] font-mono bg-white dark:bg-[#0D0E12] text-[#7A756D] dark:text-[#FAF9F6] cursor-pointer"
                    >
                      <option value="All">All Modules</option>
                      {availableModules.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0D0E12]/30 rounded-3xl border border-[#E6E2D8] dark:border-[#1B1E26] space-y-3">
                    <Clipboard className="w-12 h-12 text-[#9A9489]/50 mx-auto" />
                    <h4 className="text-[#423F3A] dark:text-[#FAF9F6] font-serif font-bold text-base">Scratchpad is empty</h4>
                    <p className="text-xs text-[#7A756D] dark:text-[#8C929D] font-sans">No pearls found matching current filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 text-left"
                      >
                        <div className="space-y-3">
                          {/* Note Categories Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {note.unit && (
                              <span className={`px-2 py-0.5 border rounded-lg text-[8px] font-mono font-bold tracking-wider uppercase ${getCategoryColor(note.unit)}`}>
                                Unit: {note.unit}
                              </span>
                            )}
                            {note.module && (
                              <span className={`px-2 py-0.5 border rounded-lg text-[8px] font-mono font-bold tracking-wider uppercase ${getCategoryColor(note.module)}`}>
                                Module: {note.module}
                              </span>
                            )}
                            {!note.unit && !note.module && (
                              <span className="px-2 py-0.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-lg text-[8px] font-mono font-bold tracking-wider uppercase bg-[#FAF9F6] dark:bg-[#171A22]/20 text-[#7A756D] dark:text-[#8C929D]">
                                Général
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[#423F3A] dark:text-[#FAF9F6] text-sm font-sans leading-relaxed whitespace-pre-wrap select-text">
                            {note.text}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#E6E2D8]/50 dark:border-[#1B1E26]/40 pt-3 text-[9px] font-mono text-[#9A9489] dark:text-[#8C929D]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#8C929D]" />
                            {new Date(note.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-[#C58B74] hover:text-[#c4694b] p-1.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="community-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-[1.75rem] p-6 sm:p-8 shadow-sm text-left space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-2.5">
                <Users className="text-[#7D8C61] dark:text-[#8CA365] w-5 h-5" /> Classroom Medical Advice Feed
              </h2>
              <p className="text-[#7A756D] dark:text-[#8C929D] text-sm font-sans max-w-xl">
                Contribute diagnostic mnemonics, clinical rotation tips, high-yield examination warnings, and help peers master critical knowledge bases.
              </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Advice Publisher Form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleCommunitySubmit} className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 shadow-sm space-y-4 sticky top-6 text-left">
                  <div className="flex items-center gap-1.5 border-b border-[#E6E2D8]/50 dark:border-[#1B1E26]/40 pb-2">
                    <Sparkles className="w-4 h-4 text-[#7D8C61] dark:text-[#8CA365]" />
                    <h3 className="font-mono font-bold text-[#423F3A] dark:text-[#FAF9F6] text-xs uppercase tracking-widest">Publish Advice</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-wider">Integrated Unit (Optional)</label>
                    <select
                      value={adviceUnit}
                      onChange={(e) => setAdviceUnit(e.target.value)}
                      className="w-full p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-xs bg-white dark:bg-[#171A22] text-[#423F3A] dark:text-[#FAF9F6] focus:ring-1 focus:ring-[#7D8C61] cursor-pointer"
                    >
                      <option value="Général">Général / Non-spécifié</option>
                      {availableUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-wider">Module (Optional)</label>
                    <select
                      value={adviceModule}
                      onChange={(e) => setAdviceModule(e.target.value)}
                      className="w-full p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-xs bg-white dark:bg-[#171A22] text-[#423F3A] dark:text-[#FAF9F6] focus:ring-1 focus:ring-[#7D8C61] cursor-pointer"
                    >
                      <option value="Général">Général / Non-spécifié</option>
                      {availableModules.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-wider">Your Message</label>
                    <textarea
                      value={adviceText}
                      onChange={(e) => setAdviceText(e.target.value)}
                      placeholder="Share high-yield exam traps to avoid, or rotation guides..."
                      rows={5}
                      className="w-full p-3 text-sm border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] bg-[#FAF9F6]/40 dark:bg-[#171A22]/20 text-[#423F3A] dark:text-[#FAF9F6] resize-y"
                      disabled={isSubmittingAdvice}
                      maxLength={1500}
                    />
                    <div className="text-right text-[9px] text-[#9A9489] dark:text-[#8C929D]/60 font-mono">
                      {adviceText.length}/1500 characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAdvice || !adviceText.trim()}
                    className={`w-full py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest transition duration-150 font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      !adviceText.trim() || isSubmittingAdvice
                        ? "bg-[#F2F0E9] dark:bg-[#171A22]/50 text-[#9A9489] dark:text-[#8C929D]/40 cursor-not-allowed"
                        : "bg-[#7D8C61] hover:bg-[#8A9A5B] text-white shadow-md shadow-[#7D8C61]/10"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish to Feed
                  </button>
                </form>
              </div>

              {/* Advice Feed list */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Search and Filters panel */}
                <div className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#9A9489] dark:text-[#8C929D]/60" />
                    <input
                      type="text"
                      value={adviceSearch}
                      onChange={(e) => setAdviceSearch(e.target.value)}
                      placeholder="Search community posts, clinical mnemonics..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7D8C61] bg-[#FAF9F6]/30 dark:bg-[#171A22]/10 text-[#423F3A] dark:text-[#FAF9F6] font-sans"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                      value={adviceUnitFilter}
                      onChange={(e) => setAdviceUnitFilter(e.target.value)}
                      className="p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-[10px] font-mono bg-white dark:bg-[#0D0E12] text-[#7A756D] dark:text-[#FAF9F6] cursor-pointer"
                    >
                      <option value="All">All Units</option>
                      {availableUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>

                    <select
                      value={adviceModuleFilter}
                      onChange={(e) => setAdviceModuleFilter(e.target.value)}
                      className="p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-[10px] font-mono bg-white dark:bg-[#0D0E12] text-[#7A756D] dark:text-[#FAF9F6] cursor-pointer"
                    >
                      <option value="All">All Modules</option>
                      {availableModules.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Feed Cards */}
                {filteredAdvices.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0D0E12]/30 rounded-3xl border border-[#E6E2D8] dark:border-[#1B1E26] space-y-3">
                    <MessageSquare className="w-12 h-12 text-[#9A9489]/50 mx-auto" />
                    <h4 className="text-[#423F3A] dark:text-[#FAF9F6] font-serif font-bold text-base">Feed is quiet</h4>
                    <p className="text-xs text-[#7A756D] dark:text-[#8C929D] font-sans">No posts found matching current filters.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAdvices.map((advice) => {
                      const isLikedByMe = student && advice.likedBy?.includes(student.id);
                      const isMyPost = student && student.name === advice.authorName;

                      return (
                        <div
                          key={advice.id}
                          className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-150 space-y-4 flex flex-col justify-between text-left"
                        >
                          <div className="space-y-3">
                            {/* Author Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#FAF9F6] dark:bg-[#171A22] text-[#7D8C61] dark:text-[#8CA365] border border-[#E6E2D8] dark:border-[#1B1E26] flex items-center justify-center text-xs font-bold font-mono">
                                  {advice.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <span className="font-bold text-[#423F3A] dark:text-[#FAF9F6] text-xs block">
                                    {advice.authorName} {isMyPost && <span className="text-[9px] font-mono bg-[#7D8C61]/10 text-[#7D8C61] px-1.5 py-0.5 rounded-md font-bold ml-1.5">You</span>}
                                  </span>
                                  <span className="text-[10px] text-[#7A756D] dark:text-[#8C929D] block font-mono">
                                    🎓 {advice.authorYear}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {advice.unit && (
                                  <span className={`px-2.5 py-0.5 border rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase ${getCategoryColor(advice.unit)}`}>
                                    Unit: {advice.unit}
                                  </span>
                                )}
                                {advice.module && (
                                  <span className={`px-2.5 py-0.5 border rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase ${getCategoryColor(advice.module)}`}>
                                    Module: {advice.module}
                                  </span>
                                )}
                                {!advice.unit && !advice.module && (
                                  <span className={`px-2.5 py-0.5 border rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase ${getCategoryColor(advice.category)}`}>
                                    {advice.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content Body */}
                            <p className="text-[#423F3A] dark:text-[#FAF9F6] text-sm leading-relaxed whitespace-pre-wrap select-text font-sans">
                              {advice.text}
                            </p>
                          </div>

                          {/* Post Footer Actions */}
                          <div className="flex items-center justify-between border-t border-[#E6E2D8]/50 dark:border-[#1B1E26]/40 pt-3.5">
                            <span className="text-[9px] font-mono text-[#9A9489] dark:text-[#8C929D] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#8C929D]" />
                              {new Date(advice.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Like / Heart button */}
                              <button
                                onClick={() => likeCommunityAdvice(advice.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  isLikedByMe
                                    ? "bg-[#C58B74]/10 text-[#C58B74] hover:bg-[#C58B74]/25"
                                    : "bg-[#FAF9F6] dark:bg-[#171A22] text-[#7A756D] dark:text-[#FAF9F6] border border-[#E6E2D8] dark:border-[#1B1E26] hover:bg-[#F2F0E9]"
                                }`}
                                title={isLikedByMe ? "Unlike post" : "Like post"}
                              >
                                <Heart className={`w-3.5 h-3.5 transition-transform ${isLikedByMe ? "fill-[#C58B74] text-[#C58B74] scale-110" : "text-[#7A756D] dark:text-[#8C929D]"}`} />
                                <span className="font-mono text-[11px] font-bold">{advice.likesCount || 0}</span>
                              </button>

                              {/* Author/Admin Delete */}
                              {(isMyPost || student?.isAdmin) && (
                                <button
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to permanently delete this advice post?")) {
                                      try {
                                        await deleteCommunityAdvice(advice.id);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }
                                  }}
                                  className="text-[#9A9489] dark:text-[#8C929D]/60 hover:text-[#C58B74] hover:bg-rose-50/50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition cursor-pointer"
                                  title="Delete post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
