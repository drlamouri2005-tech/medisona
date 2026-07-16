import React, { useState, useEffect, useMemo } from "react";
import { useStudent } from "./StudentContext";
import { 
  BookOpen, 
  Layers, 
  ClipboardList, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Activity, 
  Stethoscope, 
  X, 
  Plus, 
  Sparkles, 
  FileText,
  Clock,
  HelpCircle,
  Check,
  Search,
  ListChecks,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALGERIAN_CURRICULUM, getYearConfig, ModuleConfig, UnitConfig } from "../data/curriculum";
import { AcademicYear, ALL_ACADEMIC_YEARS } from "../types";
import { doesQuestionMatchCourse } from "../lib/courseMatcher";
import ModuleGrid from "./ModuleGrid";
import CurriculumHeader from "./dashboard/CurriculumHeader";

interface CurriculumNavProps {
  onStartSession: (config: {
    mode: "normal" | "exam";
    courses?: string[];
    examYear?: string;
    limit?: number;
  }) => void;
  initialExamYear?: string | null;
  selectedModuleFilter?: string | null;
  onClearModuleFilter?: () => void;
}

export const CurriculumNav: React.FC<CurriculumNavProps> = ({ 
  onStartSession, 
  initialExamYear,
  selectedModuleFilter = null,
  onClearModuleFilter
}) => {
  const { student, updateAcademicYear, allQuestions } = useStudent();
  const [activePath, setActivePath] = useState<"PathA" | "ExamMode" | "ModuleGrid">(
    initialExamYear 
      ? "ExamMode" 
      : (student?.academicYear === "Year 3" ? "ModuleGrid" : "PathA")
  );
  
  // Custom states matching the professional QCM builder (Créer un quiz)
  const [selectedMode, setSelectedMode] = useState<"standard" | "examen" | "revision">("standard");
  const [limit, setLimit] = useState<number>(20); // Default to 20 QCMs
  const [searchQuery, setSearchQuery] = useState("");
  const [isContentExpanded, setIsContentExpanded] = useState(true);

  // Selected course tags for QCM testing
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<{ [moduleName: string]: boolean }>({});

  // 3-tier UX states
  const [expandedUnits, setExpandedUnits] = useState<{ [unitName: string]: boolean }>({});
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);

  // Retrieve Algerian Curriculum Configuration for Student's current Academic Year
  const currentYearConfig = getYearConfig(student?.academicYear || "Year 3");

  // Auto-expand the module and unit if it's selected via WelcomeScreen filter
  useEffect(() => {
    if (selectedModuleFilter && currentYearConfig) {
      setExpandedModules(prev => ({
        ...prev,
        [selectedModuleFilter]: true
      }));

      // Find the module and parent unit to auto-expand both and open the slide-over drawer
      for (const unit of currentYearConfig.units) {
        const foundM = unit.modules.find(m => 
          m.name.toLowerCase() === selectedModuleFilter.toLowerCase() || 
          m.frenchName.toLowerCase() === selectedModuleFilter.toLowerCase()
        );
        if (foundM) {
          setExpandedUnits(prev => ({
            ...prev,
            [unit.name]: true
          }));
          setSelectedModule(foundM);
          break;
        }
      }
    }
  }, [selectedModuleFilter, currentYearConfig]);

  if (!student) return null;

  // Filter questions according to student's academic year
  const yearQuestions = student.academicYear === "Residanat"
    ? allQuestions
    : allQuestions.filter((q) => {
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

  // --- EXAM MODE ---
  const examYears = Array.from(new Set(yearQuestions.map((q) => q.examYear))).filter(Boolean).sort() as string[];

  // Helper to count available questions for a course using smart keyword matching
  const countQuestionsForCourse = (courseName: string) => {
    return yearQuestions.filter((q) => doesQuestionMatchCourse(q.course, courseName)).length;
  };

  // Helper to check if course has questions
  const hasQuestions = (courseName: string) => {
    return countQuestionsForCourse(courseName) > 0;
  };

  // List of all matching courses under current search query
  const filteredCoursesList = useMemo(() => {
    const list: string[] = [];
    currentYearConfig.units.forEach((unit) => {
      unit.modules.forEach((module) => {
        const isModuleMatch = module.frenchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             module.name.toLowerCase().includes(searchQuery.toLowerCase());
        module.courses.forEach((course) => {
          const isCourseMatch = course.toLowerCase().includes(searchQuery.toLowerCase());
          if (isModuleMatch || isCourseMatch) {
            list.push(course);
          }
        });
      });
    });
    return list;
  }, [currentYearConfig, searchQuery]);

  // Is "Tout sélectionner" fully active?
  const isAllFilteredSelected = useMemo(() => {
    if (filteredCoursesList.length === 0) return false;
    return filteredCoursesList.every(c => selectedCourses.includes(c));
  }, [filteredCoursesList, selectedCourses]);

  // Toggle "Tout sélectionner"
  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Remove all currently filtered courses
      setSelectedCourses(selectedCourses.filter(c => !filteredCoursesList.includes(c)));
    } else {
      // Add all currently filtered courses safely (without duplicates)
      const merged = Array.from(new Set([...selectedCourses, ...filteredCoursesList]));
      setSelectedCourses(merged);
    }
  };

  // Checkbox toggles for individual courses
  const handleToggleCourse = (course: string) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  // Select all courses in a specific module
  const handleToggleAllInModule = (moduleConfig: ModuleConfig) => {
    const moduleCourses = moduleConfig.courses;
    const allSelected = moduleCourses.every(c => selectedCourses.includes(c));

    if (allSelected) {
      // Remove all
      setSelectedCourses(selectedCourses.filter(c => !moduleCourses.includes(c)));
    } else {
      // Add missing
      const uniqueCourses = Array.from(new Set([...selectedCourses, ...moduleCourses]));
      setSelectedCourses(uniqueCourses);
    }
  };

  // Select all courses in a specific unit
  const handleToggleAllInUnit = (unitConfig: UnitConfig) => {
    const unitCourses = unitConfig.modules.flatMap(m => m.courses);
    const allSelected = unitCourses.every(c => selectedCourses.includes(c));

    if (allSelected) {
      setSelectedCourses(selectedCourses.filter(c => !unitCourses.includes(c)));
    } else {
      const uniqueCourses = Array.from(new Set([...selectedCourses, ...unitCourses]));
      setSelectedCourses(uniqueCourses);
    }
  };

  const toggleModuleExpand = (moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Helper for dynamic micro module icon pairing
  const getModuleIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    if (name.includes("anatomie") || name.includes("pathologique") || name.includes("anapath")) return <Stethoscope className="w-5 h-5 text-[#7D8C61]" />;
    if (name.includes("physio") || name.includes("cardi") || name.includes("resp") || name.includes("pneumo") || name.includes("neuro") || name.includes("reprod") || name.includes("urin") || name.includes("digestif") || name.includes("générale")) return <Activity className="w-5 h-5 text-[#7D8C61]" />;
    if (name.includes("pharmacologie") || name.includes("immunologie") || name.includes("microbiologie") || name.includes("parasitologie") || name.includes("bactério") || name.includes("virologie") || name.includes("mycologie")) return <Sparkles className="w-5 h-5 text-[#7D8C61]" />;
    return <BookOpen className="w-5 h-5 text-[#7D8C61]" />;
  };

  // Master click to build quiz!
  const handleLaunchNormalSession = () => {
    if (selectedCourses.length === 0) return;
    onStartSession({
      mode: selectedMode === "examen" ? "exam" : "normal",
      courses: selectedCourses,
      limit: limit === 0 ? undefined : limit
    });
  };

  const handleLaunchExamSession = (year: string) => {
    onStartSession({
      mode: "exam",
      examYear: year
    });
  };

  // Count active modules
  const totalModulesInYear = currentYearConfig.units.flatMap(u => u.modules).length;

  // Real-time selected question count
  const selectedQuestionsCount = useMemo(() => {
    return yearQuestions.filter(q => selectedCourses.includes(q.course)).length;
  }, [yearQuestions, selectedCourses]);

  return (
    <div className="space-y-8" id="curriculum-container">
      {/* Isolated & Premium Curriculum Header */}
      <CurriculumHeader userSubscribedYear={currentYearConfig.frenchLabel} />

      {/* WelcomeScreen Active Module Filter Banner */}
      <AnimatePresence>
        {selectedModuleFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-[#7D8C61]/10 border border-[#7D8C61]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-[0_4px_20px_rgba(125,140,97,0.1)]"
            id="active-module-filter-banner"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#7D8C61]/20 border border-[#7D8C61]/35 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#7D8C61]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#7D8C61] font-bold block">
                  Filtre de Module Actif
                </span>
                <h4 className="text-sm font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6]">
                  Isolation active: <span className="text-[#7D8C61]">{selectedModuleFilter}</span>
                </h4>
                <p className="text-xs text-[#7A756D] dark:text-[#8C929D] font-sans">
                  Affichage restreint aux cours et QCM de ce module clinique pour cibler vos révisions.
                </p>
              </div>
            </div>
            {onClearModuleFilter && (
              <button
                onClick={onClearModuleFilter}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#171A22] border border-[#E6E2D8] dark:border-[#1B1E26] hover:border-[#7D8C61] text-xs font-mono text-[#7A756D] dark:text-[#8C929D] hover:text-[#FAF9F6] transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                id="clear-module-filter-trigger"
              >
                <X className="w-3.5 h-3.5 text-[#C58B74]" />
                <span>Afficher tout</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Switcher with Premium layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E2D8]/50 dark:border-[#1B1E26]/50 pb-3">
        <div className="bg-[#F2F0E9]/80 dark:bg-[#171A22]/90 p-1 rounded-2xl flex border border-[#E6E2D8] dark:border-[#1B1E26] max-w-lg backdrop-blur-md w-full">
          <button
            onClick={() => {
              setActivePath("PathA");
              setSelectedCourses([]);
            }}
            className={`flex-1 py-2.5 text-center font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 select-none cursor-pointer flex items-center justify-center gap-2 ${
              activePath === "PathA"
                ? "bg-white dark:bg-[#2C303D] text-[#7D8C61] dark:text-[#8CA365] shadow-sm"
                : "text-[#7A756D] dark:text-[#8C929D] hover:text-[#423F3A] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Créer un Quiz
          </button>
          <button
            onClick={() => {
              setActivePath("ModuleGrid");
              setSelectedCourses([]);
            }}
            className={`flex-1 py-2.5 text-center font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 select-none cursor-pointer flex items-center justify-center gap-2 ${
              activePath === "ModuleGrid"
                ? "bg-white dark:bg-[#2C303D] text-[#7D8C61] dark:text-[#8CA365] shadow-sm"
                : "text-[#7A756D] dark:text-[#8C929D] hover:text-[#423F3A] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
            Visual Modules
          </button>
          <button
            onClick={() => {
              setActivePath("ExamMode");
              setSelectedCourses([]);
            }}
            className={`flex-1 py-2.5 text-center font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 select-none cursor-pointer flex items-center justify-center gap-2 ${
              activePath === "ExamMode"
                ? "bg-white dark:bg-[#2C303D] text-[#7D8C61] dark:text-[#8CA365] shadow-sm"
                : "text-[#7A756D] dark:text-[#8C929D] hover:text-[#423F3A] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Examens Officiels ({examYears.length})
          </button>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-[10px] font-mono text-[#7A756D] dark:text-[#8C929D]/60 uppercase tracking-widest block font-bold">
            Curriculum Path: {currentYearConfig.desc}
          </span>
        </div>
      </div>

      {/* Path A Content: Ultra-Premium QCM Constructor "Créer un quiz" */}
      {activePath === "PathA" && (
        <div className="space-y-8 text-left animate-fade-in" id="path-a-view">
          
          {/* Header segment */}
          <div className="flex items-center justify-between border-b border-[#E6E2D8]/40 dark:border-[#1B1E26]/40 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6]">Créer un quiz</h2>
              <p className="text-xs text-[#7A756D] dark:text-[#8C929D] mt-1">Configurez votre module d'évaluation clinique personnalisé.</p>
            </div>
            <a href="#help" className="flex items-center gap-1.5 text-xs text-[#7D8C61] dark:text-[#8CA365] hover:underline font-mono uppercase tracking-wider font-bold">
              <HelpCircle className="w-4 h-4" />
              Aide
            </a>
          </div>

          {/* Mode Selector Cards Grid matching second picture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Standard Card */}
            <button
              onClick={() => setSelectedMode("standard")}
              className={`p-5 rounded-2xl border text-left flex items-center justify-between relative transition-all duration-200 cursor-pointer ${
                selectedMode === "standard"
                  ? "bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-[#121215]/30 border-white/5 hover:border-emerald-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Standard</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Valider puis corriger</p>
                </div>
              </div>
              {selectedMode === "standard" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Examen Card */}
            <button
              onClick={() => setSelectedMode("examen")}
              className={`p-5 rounded-2xl border text-left flex items-center justify-between relative transition-all duration-200 cursor-pointer ${
                selectedMode === "examen"
                  ? "bg-blue-500/5 border-blue-500/40 shadow-lg shadow-blue-500/5"
                  : "bg-[#121215]/30 border-white/5 hover:border-blue-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Examen</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mode chronométré</p>
                </div>
              </div>
              {selectedMode === "examen" && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-black flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Révision Card */}
            <button
              onClick={() => setSelectedMode("revision")}
              className={`p-5 rounded-2xl border text-left flex items-center justify-between relative transition-all duration-200 cursor-pointer ${
                selectedMode === "revision"
                  ? "bg-purple-500/5 border-purple-500/40 shadow-lg shadow-purple-500/5"
                  : "bg-[#121215]/30 border-white/5 hover:border-purple-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Révision</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Voir les réponses</p>
                </div>
              </div>
              {selectedMode === "revision" && (
                <div className="w-5 h-5 rounded-full bg-purple-500 text-black flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>

          {/* Premium Glowing Filter Search Bar */}
          <div className="relative group/search bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.03)] hover:shadow-[0_0_50px_rgba(16,185,129,0.08)] transition-all duration-300">
            {/* Subtle glow blur backdrops */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover/search:bg-emerald-500/20 transition-all duration-300" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover/search:bg-teal-500/20 transition-all duration-300" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-4 justify-between z-10">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-400 group-focus-within/search:text-emerald-300 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un module ou un cours (ex: Anatomie, Cardiologie, etc)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-[#070709]/90 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/80 transition-all duration-200 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                {searchQuery && (
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg shrink-0">
                    {filteredCoursesList.length} cours correspondants
                  </span>
                )}
                <label className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAllFiltered}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-[#070709] w-4 h-4 cursor-pointer"
                  />
                  <span>TOUT SÉLECTIONNER</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modules & Cours Container */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#121215]/30 shadow-sm">
            {/* Header Collapsible Trigger */}
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="w-full px-6 py-4 bg-[#121215]/40 border-b border-white/5 flex items-center justify-between transition-colors hover:bg-[#121215]/60 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-white">Modules & Cours</h3>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold uppercase">Choisir le contenu</p>
                </div>
              </div>
              {isContentExpanded ? (
                <ChevronUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-emerald-400" />
              )}
            </button>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
              {isContentExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-transparent"
                >
                  <div className="p-6 space-y-6">
                    {/* 3-Tier Curriculum Selection Layout with smooth opacity transitions */}
                    <div className="space-y-5">
                      <AnimatePresence mode="popLayout">
                        {(() => {
                          const isUnitExpanded = (unit: any) => {
                            if (searchQuery !== "") {
                              return unit.modules.some((module: any) => {
                                const isModuleMatch = module.frenchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                     module.name.toLowerCase().includes(searchQuery.toLowerCase());
                                const hasMatchingCourse = module.courses.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()));
                                return isModuleMatch || hasMatchingCourse;
                              });
                            }
                            if (selectedModuleFilter) {
                              return unit.modules.some((m: any) => 
                                m.name.toLowerCase() === selectedModuleFilter.toLowerCase() || 
                                m.frenchName.toLowerCase() === selectedModuleFilter.toLowerCase()
                              );
                            }
                            return !!expandedUnits[unit.name];
                          };

                          const toggleUnitExpand = (unitName: string) => {
                            setExpandedUnits(prev => ({
                              ...prev,
                              [unitName]: !prev[unitName]
                            }));
                          };

                          const unitList = currentYearConfig.units.map((unit) => {
                            // Filter modules inside the unit based on active filter or searchQuery
                            const matchingModules = unit.modules.filter((module) => {
                              const isFilteredOutByBanner = selectedModuleFilter && 
                                module.name.toLowerCase() !== selectedModuleFilter.toLowerCase() && 
                                module.frenchName.toLowerCase() !== selectedModuleFilter.toLowerCase();
                              
                              if (isFilteredOutByBanner) return false;

                              const matchesSearch = searchQuery === "" || 
                                module.frenchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                module.courses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

                              return matchesSearch;
                            });

                            if (matchingModules.length === 0) return null;

                            const isExpanded = isUnitExpanded(unit);
                            const unitCourses = unit.modules.flatMap(m => m.courses);
                            const selectedCountInUnit = unitCourses.filter(c => selectedCourses.includes(c)).length;
                            const allSelectedInUnit = unitCourses.length > 0 && selectedCountInUnit === unitCourses.length;

                            return (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                key={unit.name}
                                className="border border-white/5 rounded-2xl overflow-hidden bg-[#121215]/20 shadow-xs transition-all duration-200 hover:border-white/10"
                              >
                                {/* Tier 1: Unity Header */}
                                <div className="flex items-center justify-between p-5 bg-[#121215]/30">
                                  <button
                                    onClick={() => toggleUnitExpand(unit.name)}
                                    className="flex items-center space-x-3.5 text-left flex-1 min-w-0 cursor-pointer group"
                                  >
                                    <div className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
                                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-sm font-serif font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                                        {unit.frenchName || unit.name}
                                      </h4>
                                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                                        {unit.modules.length} modules • {unitCourses.length} cours • {selectedCountInUnit} sélectionnés
                                      </p>
                                    </div>
                                  </button>

                                  <div className="flex items-center space-x-3 shrink-0">
                                    {selectedCountInUnit > 0 && (
                                      <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {selectedCountInUnit} Cours
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleToggleAllInUnit(unit)}
                                      className={`px-3 py-1.5 rounded-xl text-[9px] font-mono font-extrabold border transition-all duration-150 cursor-pointer ${
                                        allSelectedInUnit
                                          ? "bg-emerald-500 text-black border-emerald-400"
                                          : "bg-white/5 border-white/10 text-gray-400 hover:border-emerald-500 hover:text-white"
                                      }`}
                                    >
                                      {allSelectedInUnit ? "TOUT RETIRER" : "TOUT COCHER"}
                                    </button>
                                  </div>
                                </div>

                                {/* Tier 2: Modules sub-grid view */}
                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: "auto" }}
                                      exit={{ height: 0 }}
                                      className="overflow-hidden bg-transparent border-t border-white/5"
                                    >
                                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <AnimatePresence mode="popLayout">
                                          {matchingModules.map((module) => {
                                            const selectedInModule = module.courses.filter(c => selectedCourses.includes(c));
                                            const selectedCount = selectedInModule.length;
                                            const totalCount = module.courses.length;
                                            const allSelected = selectedCount === totalCount;

                                            return (
                                              <motion.button
                                                layout
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.96 }}
                                                transition={{ duration: 0.2 }}
                                                key={module.name}
                                                onClick={() => setSelectedModule(module)}
                                                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#121215]/30 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-200 text-left group cursor-pointer"
                                              >
                                                <div className="flex items-center space-x-3.5 min-w-0">
                                                  <div className="w-10 h-10 rounded-xl bg-[#070709] border border-white/5 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                                                    {getModuleIcon(module.name)}
                                                  </div>
                                                  <div className="min-w-0">
                                                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight line-clamp-1">
                                                      {module.frenchName || module.name}
                                                    </h5>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-1">
                                                      {totalCount} cours disponibles
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="flex items-center space-x-2 shrink-0">
                                                  {selectedCount > 0 && (
                                                    <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${
                                                      allSelected
                                                        ? "bg-emerald-500 text-black border-emerald-400"
                                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    }`}>
                                                      {allSelected ? "Tout" : `${selectedCount}/${totalCount}`}
                                                    </span>
                                                  )}
                                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-all group-hover:translate-x-0.5" />
                                                </div>
                                              </motion.button>
                                            );
                                          })}
                                        </AnimatePresence>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          }).filter(Boolean);

                          if (unitList.length === 0) {
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-16 bg-[#121215]/20 rounded-2xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center space-y-4"
                              >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                  <HelpCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-white">Aucun module correspondant</p>
                                  <p className="text-xs text-gray-400 max-w-sm text-center">
                                    Nous n'avons trouvé aucun module ni cours correspondant à <span className="text-emerald-400">"{searchQuery}"</span>.
                                  </p>
                                </div>
                                <button 
                                  onClick={() => setSearchQuery("")}
                                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-mono font-bold text-emerald-400 rounded-xl transition-all cursor-pointer"
                                >
                                  Réinitialiser le filtre
                                </button>
                              </motion.div>
                            );
                          }

                          return unitList;
                        })()}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Bottom Floater launch panel matching second picture */}
          {selectedCourses.length > 0 && (
            <div className="sticky bottom-6 bg-[#FAF9F6]/95 dark:bg-[#0d0d12]/90 backdrop-blur-xl border border-[#7D8C61]/35 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto z-40 animate-fade-in text-left">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-[#7D8C61]/15 text-[#7D8C61] flex items-center justify-center shrink-0">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-[#423F3A] dark:text-[#FAF9F6]">
                    {selectedQuestionsCount} Questions
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {selectedCourses.length} cours sélectionnés
                  </p>
                </div>
              </div>

              {/* Controls: Limit and Mode indicators */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Limit select box */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400">LIMITE:</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                    className="bg-[#FAF9F6] dark:bg-[#11131a]/60 border border-[#E6E2D8] dark:border-[#1b1e28] rounded-xl text-xs font-mono font-bold text-[#423F3A] dark:text-[#FAF9F6] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7D8C61]"
                  >
                    <option value={10}>10 QCMs</option>
                    <option value={20}>20 QCMs</option>
                    <option value={50}>50 QCMs</option>
                    <option value={100}>100 QCMs</option>
                    <option value={0}>Aucune</option>
                  </select>
                </div>

                {/* Selected Mode Badge */}
                <span className="px-3 py-1.5 rounded-xl text-[9px] font-mono font-extrabold uppercase tracking-wide border bg-[#FAF9F6] dark:bg-[#11131a]/60 border-[#E6E2D8] dark:border-[#1b1e28] text-gray-500">
                  {selectedMode}
                </span>

                {/* Start Button */}
                <button
                  onClick={handleLaunchNormalSession}
                  className="px-5 py-3 bg-[#137333] hover:bg-[#10602a] text-white font-mono text-[10px] uppercase tracking-widest font-bold rounded-2xl transition-all shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  CONSTRUIRE LE QUIZ <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exam Mode Content */}
      {activePath === "ExamMode" && (
        <div className="bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-[1.75rem] p-6 sm:p-8 shadow-sm space-y-6 backdrop-blur-md text-left animate-fade-in" id="exam-mode-view">
          <div className="border-b border-[#E6E2D8]/60 dark:border-[#1B1E26]/40 pb-4 text-left group">
            <h3 className="font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] text-lg flex items-center gap-2">
              <Stethoscope className="text-[#7D8C61] dark:text-[#8CA365] w-5 h-5 stethoscope-rotate" /> Standardized Mock Board Papers
            </h3>
            <p className="text-[#7A756D] dark:text-[#8C929D] text-xs mt-1.5 leading-relaxed font-sans">
              Select an official examination paper below. medisona will compile all accredited questions for {student.academicYear} and present them under strict exam conditions.
            </p>
          </div>

          {examYears.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#0D0E12]/20 rounded-2xl border border-[#E6E2D8] dark:border-[#1B1E26] shadow-sm backdrop-blur-md">
              <ClipboardList className="w-10 h-10 text-[#9A9489]/50 mx-auto mb-3" />
              <p className="text-xs text-[#7A756D] dark:text-[#8C929D] font-sans">No official mock papers uploaded for {student.academicYear} yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {examYears.map((year) => {
                const qForYear = yearQuestions.filter((q) => q.examYear === year);
                const qCount = qForYear.length;
                return (
                  <div
                    key={year}
                    className="p-5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl bg-[#FAF9F6]/30 dark:bg-[#171A22]/20 flex flex-col justify-between space-y-5 text-left premium-card-hover group transition-all"
                  >
                    <div className="space-y-1.5">
                      <span className="px-2 py-0.5 bg-[#7D8C61]/10 text-[#7D8C61] dark:bg-[#8CA365]/20 dark:text-[#8CA365] text-[9px] font-mono rounded tracking-wider uppercase font-bold border border-[#7D8C61]/20 dark:border-[#8CA365]/30">
                        Official Exam
                      </span>
                      <h4 className="text-base font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] mt-1 flex items-center gap-2 leading-tight">
                        <Stethoscope className="w-4.5 h-4.5 text-[#7D8C61] dark:text-[#8CA365] stethoscope-rotate" /> {student.academicYear} Exam Paper ({year})
                      </h4>
                      <p className="text-[10px] text-[#7A756D] dark:text-[#8C929D] font-mono">{qCount} Compiled QCM Vignettes</p>
                    </div>

                    <button
                      onClick={() => handleLaunchExamSession(year)}
                      className="w-full py-3 bg-[#423F3A] dark:bg-[#171A22] hover:bg-[#5C5852] dark:hover:bg-[#2C303D] text-white dark:text-[#FAF9F6] font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl border border-transparent dark:border-[#1B1E26] transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      Launch Exam <ChevronRight className="w-4 h-4 animate-bounce-horizontal" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Module Grid Cinematic View */}
      {activePath === "ModuleGrid" && (
        <div className="animate-fade-in text-left">
          <ModuleGrid 
            onSelectModule={(curriculumName) => {
              setActivePath("PathA");
              setExpandedModules({ [curriculumName]: true });

              // Find the correct module object and its parent unit to auto-expand and slide open drawer
              if (currentYearConfig) {
                for (const unit of currentYearConfig.units) {
                  const foundM = unit.modules.find(m => 
                    m.name.toLowerCase() === curriculumName.toLowerCase() || 
                    m.frenchName.toLowerCase() === curriculumName.toLowerCase()
                  );
                  if (foundM) {
                    setExpandedUnits(prev => ({
                      ...prev,
                      [unit.name]: true
                    }));
                    setSelectedModule(foundM);
                    break;
                  }
                }
              }
            }}
          />
        </div>
      )}

      {/* Sleek Course Slide-Over Sheet (Tier 3) */}
      <AnimatePresence>
        {selectedModule && (
          <>
            {/* Dark blurred background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModule(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#070709] border-l border-white/5 shadow-2xl z-55 flex flex-col text-left"
              id="course-slideover-panel"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-[#121215]/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400 font-bold block">
                    Sélection du Module Clinique
                  </span>
                  <h3 className="text-base font-serif font-bold text-white leading-snug">
                    {selectedModule.frenchName || selectedModule.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedModule.courses.length} cours disponibles
                  </p>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar: Select All inside this module */}
              <div className="px-6 py-3 border-b border-white/5 bg-[#121215]/20 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Fiches de révision
                </span>
                <button
                  onClick={() => handleToggleAllInModule(selectedModule)}
                  className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  {selectedModule.courses.every(c => selectedCourses.includes(c))
                    ? "TOUT DÉSELECTIONNER"
                    : "TOUT SÉLECTIONNER"}
                </button>
              </div>

              {/* Scrollable list of granular courses */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 scrollbar-thin">
                {(() => {
                  // If searching, filter courses
                  const matchingCourses = selectedModule.courses.filter(c => 
                    c.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  if (matchingCourses.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-xs text-gray-400 font-sans">Aucun cours ne correspond à votre recherche.</p>
                      </div>
                    );
                  }
                  
                  return matchingCourses.map((course) => {
                    const isSelected = selectedCourses.includes(course);
                    const qCount = countQuestionsForCourse(course);
                    const available = hasQuestions(course);

                    return (
                      <label
                        key={course}
                        className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-xs"
                            : "bg-transparent border-white/5 hover:border-emerald-500/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCourse(course)}
                          className="mt-1 mr-3.5 rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-[#070709] cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 text-left min-w-0">
                          <span className="text-xs font-bold block leading-snug text-white">
                            {course}
                          </span>
                          <span className={`text-[9px] font-mono block ${available ? "text-emerald-400 font-bold" : "text-gray-500"}`}>
                            {qCount} vignettes QCM disponibles {available && "• Prêts"}
                          </span>
                        </div>
                      </label>
                    );
                  });
                })()}
              </div>

              {/* Bottom Sticky Action inside slideover */}
              <div className="p-6 border-t border-white/5 bg-[#121215]/40">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] uppercase tracking-widest font-black rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Valider la sélection ({selectedModule.courses.filter(c => selectedCourses.includes(c)).length} cours)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
