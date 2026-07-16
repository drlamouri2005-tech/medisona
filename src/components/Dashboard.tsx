import React, { useState, useEffect, useRef } from "react";
import { useStudent } from "./StudentContext";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  BookOpen, 
  Clock, 
  Play, 
  ChevronRight, 
  Flame, 
  Calendar, 
  Sparkles, 
  Stethoscope, 
  Heart, 
  Brain, 
  Shield, 
  Dna, 
  Activity, 
  Bookmark, 
  Compass, 
  Layers, 
  Search, 
  Check, 
  Lock, 
  Grid,
  Zap,
  BookMarked,
  Layers3,
  ListRestart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TiltCard, ScrollReveal, Magnetic } from "./EliteInteractions";
import { ALGERIAN_CURRICULUM } from "../data/curriculum";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DashboardProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { student, progress, allQuestions } = useStudent();
  const [savedSession, setSavedSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilderCourses, setSelectedBuilderCourses] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeTimelineNode, setActiveTimelineNode] = useState<number>(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Parallax mouse state for 3D holographic anatomy illustration
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Medical board motivation quotes
  const medicalQuotes = [
    { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
    { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" },
    { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
    { text: "The art of healing comes from nature, not from the physician.", author: "Paracelsus" },
    { text: "Primum non nocere. First, do no harm.", author: "Hippocrates" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % medicalQuotes.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("med_active_session");
      if (saved) {
        setSavedSession(JSON.parse(saved));
      } else {
        setSavedSession(null);
      }
    } catch {
      setSavedSession(null);
    }
  }, []);

  // GSAP Cinematic 3D scroll-driven & entrance animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Cinematic Hero Entrance (Apple style perspective flip)
      gsap.fromTo("#cinematic-hero", 
        { opacity: 0, y: 40, scale: 0.98, rotationX: -8 },
        { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, ease: "power4.out", clearProps: "transform" }
      );

      // 2. Staggered Clinical metrics loading
      gsap.fromTo("#clinical-metrics-grid > div",
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.05, 
          ease: "power3.out", 
          scrollTrigger: {
            trigger: "#clinical-metrics-grid",
            start: "top 95%",
            once: true
          }
        }
      );

      // 3. Linear-inspired 3D Scroll Flipping for syllabus modules
      const scrollCards = document.querySelectorAll(".scrolling-3d-card");
      scrollCards.forEach((card) => {
        gsap.fromTo(card,
          { 
            opacity: 0.5, 
            y: 40, 
            rotationX: -10, 
            scale: 0.97
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0, 
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 95%", 
              end: "top 75%",   
              scrub: 1,
            }
          }
        );
      });

      // Recalculate dimensions on a tiny timeout in case of expanded items or layout shifts
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 400);

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }
  }, [searchQuery, student.academicYear]);

  if (!student || !progress) return null;

  const currentYearConfig = ALGERIAN_CURRICULUM.find(y => y.key === student.academicYear) || ALGERIAN_CURRICULUM[2];

  // Compile student answers for this academic year
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
  const totalQuestionsCount = yearQuestions.length;
  const answeredIds = Object.keys(progress.answers).filter((qId) =>
    yearQuestions.some((q) => q.id === qId)
  );
  const totalAnswered = answeredIds.length;
  const correctAnswersCount = answeredIds.filter((qId) => progress.answers[qId].correct).length;
  const wrongAnswersCount = totalAnswered - correctAnswersCount;

  // Retrieve custom flagged/bookmark items
  const flaggedStr = localStorage.getItem(`med_flagged_qs_${student.id}`) || "[]";
  let flaggedCount = 0;
  try {
    const flaggedIds = JSON.parse(flaggedStr) as string[];
    flaggedCount = flaggedIds.filter(id => yearQuestions.some(q => q.id === id)).length;
  } catch (e) {
    console.error(e);
  }

  // Study time estimate (e.g. 2.5 minutes per completed question + natural streak weight)
  const studyTimeMinutes = Math.max(12, totalAnswered * 2 + (student.streakCount || 0) * 15);

  // Next Recommended Module Selection
  const allModules = currentYearConfig.units.flatMap(u => u.modules);
  const nextModule = allModules.find(m => {
    // Find a module that is not fully completed
    const mCourses = m.courses;
    const answeredCount = yearQuestions.filter(q => mCourses.includes(q.course) && progress.answers[q.id]).length;
    const totalQCount = yearQuestions.filter(q => mCourses.includes(q.course)).length;
    return totalQCount > 0 && answeredCount < totalQCount;
  }) || allModules[0] || { frenchName: "Sémiologie", name: "Semiology", courses: [] };

  const handleResumeSavedSession = () => {
    if (savedSession) {
      onNavigate("resume-session", savedSession);
    }
  };

  const handleClearSavedSession = () => {
    localStorage.removeItem("med_active_session");
    setSavedSession(null);
  };

  // Custom icon mapping wrapper
  const getModuleIcon = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes("cardi") || norm.includes("sémio")) {
      return (
        <motion.div
          animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-[#C58B74]"
        >
          <Heart className="w-5 h-5 fill-current" />
        </motion.div>
      );
    }
    if (norm.includes("neur") || norm.includes("psych")) {
      return (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="text-[#7D8C61]"
        >
          <Brain className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("urina") || norm.includes("néphro") || norm.includes("urolog")) {
      return (
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#81A1C1]"
        >
          <Stethoscope className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("génét") || norm.includes("dna")) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="text-[#C58B74]"
        >
          <Dna className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("immun") || norm.includes("parasit")) {
      return (
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-[#7D8C61]"
        >
          <Shield className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("microb") || norm.includes("infect")) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="text-[#C58B74]"
        >
          <Activity className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("histo") || norm.includes("cytol")) {
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-stone-400"
        >
          <BookOpen className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("anat")) {
      return (
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-[#7D8C61]"
        >
          <Layers className="w-5 h-5" />
        </motion.div>
      );
    }
    if (norm.includes("pharma")) {
      return (
        <motion.div
          animate={{ y: [0, -2, 0], rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-[#C58B74]"
        >
          <Calendar className="w-5 h-5" />
        </motion.div>
      );
    }
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-[#7D8C61]"
      >
        <Stethoscope className="w-5 h-5" />
      </motion.div>
    );
  };

  // Launch pre-configured session types
  const handleLaunchTargetPractice = (type: string) => {
    if (type === "year") {
      const yearCourses = currentYearConfig.units.flatMap(u => u.modules.flatMap(m => m.courses));
      onNavigate("resume-session", { mode: "normal", courses: yearCourses });
    } else if (type === "favorites" || type === "flagged") {
      onNavigate("resume-session", { mode: "normal", filterType: "flagged" });
    } else if (type === "incorrect") {
      onNavigate("resume-session", { mode: "normal", filterType: "incorrect" });
    } else if (type === "exam") {
      // Find default mock exam year or launch exam tab
      onNavigate("curriculum", { examModeYear: "2024" });
    }
  };

  // Course Builder Custom Launcher
  const handleLaunchCustomBuilderSession = () => {
    if (selectedBuilderCourses.length === 0) return;
    onNavigate("resume-session", { mode: "normal", courses: selectedBuilderCourses });
  };

  return (
    <div className="space-y-12 pb-12" id="dashboard-container">      {/* 1. CINEMATIC WELCOME EXPERIENCE */}
      <ScrollReveal delay={0.02} yOffset={25}>
        <div 
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden bg-[#121215]/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row items-center justify-between gap-10 transition-all duration-300 relative z-10"
          id="cinematic-hero"
        >
          {/* Ambient Radial Neon Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[24rem] h-[24rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Particle stream in background */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-emerald-400/50 rounded-full animate-pulse delay-200"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-rose-400/30 rounded-full animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 space-y-6 flex-1 text-left w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider uppercase rounded-full border border-emerald-500/20 font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              {student.academicYear} BOARD SYLLABUS DIRECTIVE
            </span>
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
                  const firstName = student.name.split(" ")[0] || student.name;
                  return `${greeting}, Dr. ${firstName}`;
                })()}
              </h1>
              <p className="text-sm font-sans text-gray-300 max-w-lg leading-relaxed">
                Ready to master today's board exams? Challenge your clinical skills with custom sessions, detailed explanations, and our advanced SocratesMD AI mentor.
              </p>
            </div>

            {/* Live rotating quote board */}
            <div className="border-l-2 border-emerald-500 pl-4 max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xs font-serif italic text-gray-300 leading-relaxed">
                    "{medicalQuotes[quoteIndex].text}"
                  </p>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mt-1 block font-bold">
                    — {medicalQuotes[quoteIndex].author}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Main resume study action trigger */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {savedSession ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Magnetic strength={0.2} range={45}>
                    <button
                      onClick={handleResumeSavedSession}
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Continue Studying Session
                    </button>
                  </Magnetic>
                  <button
                    onClick={handleClearSavedSession}
                    className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-mono rounded-xl transition border border-white/10 cursor-pointer text-center"
                  >
                    Reset Active Path
                  </button>
                </div>
              ) : (
                <Magnetic strength={0.15} range={35}>
                  <button
                    onClick={() => {
                      const el = document.getElementById("course-selection-builder");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3.5 bg-white text-black hover:bg-white/90 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Build Custom Practice <ChevronRight className="w-4 h-4" />
                  </button>
                </Magnetic>
              )}

              {/* Dynamic study streak badge */}
              {(student.streakCount || 0) > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Flame className="w-4.5 h-4.5 animate-pulse fill-orange-500/10" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">{student.streakCount} Day Study Streak!</span>
                </div>
              )}
            </div>
          </div>

          {/* Holographic interactive chest/heart anatomy widget (Right side) */}
          <div 
            className="w-full lg:w-80 h-80 relative flex items-center justify-center rounded-2xl bg-[#121215]/30 border border-white/10 backdrop-blur-xl overflow-hidden group shadow-inner shrink-0"
            style={{
              perspective: 1000
            }}
          >
            <motion.div
              style={{
                x: mousePos.x * 25,
                y: mousePos.y * 25,
                rotateY: mousePos.x * 20,
                rotateX: -mousePos.y * 20,
                transformStyle: "preserve-3d"
              }}
              className="w-full h-full flex flex-col items-center justify-center space-y-4 cursor-pointer relative"
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            >
              {/* Pulsing chest cage SVG background lineart */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-110 pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
                  <path d="M50,40 Q100,20 150,40 M40,80 Q100,50 160,80 M30,120 Q100,80 170,120 M20,160 Q100,110 180,160" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>

              {/* Real-time glowing anatomical heart */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1, 1.15, 1],
                    filter: [
                      "drop-shadow(0 0 10px rgba(16,185,129,0.2))",
                      "drop-shadow(0 0 30px rgba(16,185,129,0.65))",
                      "drop-shadow(0 0 10px rgba(16,185,129,0.2))"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  className="p-8 bg-emerald-500/5 rounded-full border border-emerald-500/20"
                >
                  <Heart className="w-14 h-14 text-emerald-400 fill-current" />
                </motion.div>

                {/* Concentric soundwaves / heartbeat waves radiating */}
                <div className="absolute w-28 h-28 border border-emerald-500/20 rounded-full animate-ping pointer-events-none"></div>
                <div className="absolute w-36 h-36 border border-emerald-500/10 rounded-full animate-ping pointer-events-none delay-300"></div>
              </div>

              <div className="text-center relative z-10">
                <p className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">SYNAPSE BIOMETRICS</p>
                <p className="text-xs font-serif text-gray-300 italic">Pulsing at 72 BPM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. NO MEANINGLESS STATISTICS: DISPLAY SPECIFIC CLINICAL FOCUS METRICS */}
      <ScrollReveal delay={0.1} yOffset={25}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6" id="clinical-metrics-grid">
          
          {/* Card 1: Today's Goal */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Today's Goal</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">20 QCMs</h2>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Standard clinical board revision quota.
            </p>
          </div>

          {/* Card 2: Weekly Progress */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Weekly Progress</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-baseline gap-1 font-mono">
                {totalAnswered}
                <span className="text-sm font-sans font-normal text-gray-400">/ 150 answered</span>
              </h2>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                style={{ width: `${Math.min(100, (totalAnswered / 150) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Current Learning Path */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Active Path</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white truncate uppercase tracking-tight">
                {student.academicYear}
              </h2>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
              {currentYearConfig.desc}
            </p>
          </div>

          {/* Card 4: Next Recommended Module */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Recommended Unit</span>
              <h2 className="text-sm sm:text-base font-serif font-bold text-white line-clamp-1">
                {nextModule.frenchName}
              </h2>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("course-selection-builder");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                setSelectedBuilderCourses(nextModule.courses);
                setExpandedModules(prev => ({ ...prev, [nextModule.frenchName]: true }));
              }}
              className="text-[11px] text-emerald-400 font-mono font-bold uppercase hover:underline text-left block flex items-center gap-1 cursor-pointer"
            >
              Configure Path <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 5: Study Time Today */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Study Time Today</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white font-mono">
                {studyTimeMinutes}m
              </h2>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Clinically estimated active board review time.
            </p>
          </div>

          {/* Card 6: Revision Needed */}
          <div 
            onClick={() => handleLaunchTargetPractice("favorites")}
            className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold group-hover:text-emerald-400">Flagged QCMs</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white font-mono">
                {flaggedCount} Qs
              </h2>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider group-hover:underline">
              Launch Revision Session
            </p>
          </div>

          {/* Card 7: Mock Exam Countdown */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Mock Exam Target</span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Résidanat 2026
              </h2>
            </div>
            <p className="text-[11px] text-rose-400 font-mono font-bold uppercase tracking-wider animate-pulse">
              84 Days Remaining
            </p>
          </div>

          {/* Card 8: Subscription Status */}
          <div className="bg-[#121215]/30 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-2xl pointer-events-none"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Subscription Plan</span>
              <h2 className="text-sm sm:text-base font-serif font-bold text-white">
                {student.academicYear} Access
              </h2>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono uppercase">
              <span className="text-emerald-400 font-bold">Active</span>
              <span className="text-gray-400">Renew in 341d</span>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* 3. LEARNING JOURNEY TIMELINE (ROADMAP SEQUENCE) */}
      <ScrollReveal delay={0.15} yOffset={25}>
        <div className="bg-[#121215]/30 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-xl text-left space-y-8 relative overflow-hidden group hover:border-emerald-500/10 transition-all duration-500">
          {/* Subtle decorative radial light glow in background */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Medical Syllabus Progression Path
              </h3>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Syllabus Journey Roadmap</h2>
            </div>
            <div className="text-xs font-mono text-gray-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-bold">
              Step {activeTimelineNode + 1} of 6 • Active
            </div>
          </div>

          <div className="relative pt-6 z-10">
            {/* Elegant connecting vector pathway */}
            <div className="absolute top-[2.5rem] left-10 right-10 h-[2px] bg-gradient-to-r from-emerald-500/40 via-white/10 to-transparent pointer-events-none hidden sm:block"></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 relative">
              {[
                { label: "Academic Year", value: student.academicYear, sub: currentYearConfig.frenchLabel },
                { label: "Semester", value: "S1 & S2", sub: "Annuel" },
                { label: "Active Unit", value: currentYearConfig.units[0]?.name || "Sciences", sub: currentYearConfig.units[0]?.frenchName || "Bloc" },
                { label: "Focus Module", value: allModules[0]?.name || "Semiology", sub: allModules[0]?.frenchName || "Sémiologie" },
                { label: "Board Course", value: `${selectedBuilderCourses.length || 1} Selected`, sub: "Interactive Block" },
                { label: "Board QCM", value: `${totalAnswered} Answered`, sub: `${totalQuestionsCount - totalAnswered} Left` }
              ].map((node, idx) => {
                const isActive = idx === activeTimelineNode;
                const isPassed = idx < activeTimelineNode;
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveTimelineNode(idx)}
                    className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3.5 cursor-pointer group/node select-none transition-all duration-300"
                  >
                    {/* Animated Step Node */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 relative ${
                      isActive 
                        ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.45)] scale-110 font-black rotate-3" 
                        : isPassed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-[#121215]/50 border-white/10 text-gray-400 group-hover/node:border-emerald-500/50 group-hover/node:text-white"
                    }`}>
                      <span className="font-mono text-sm font-bold">{idx + 1}</span>
                      
                      {/* Active orbital ring indicator */}
                      {isActive && (
                        <div className="absolute -inset-1.5 rounded-3xl border border-emerald-400/20 animate-pulse pointer-events-none"></div>
                      )}
                    </div>
                    
                    <div className="space-y-1 px-1">
                      <p className={`text-[9px] font-mono uppercase tracking-widest font-bold transition-colors ${
                        isActive ? "text-emerald-400" : "text-gray-500"
                      }`}>{node.label}</p>
                      <h4 className="text-xs font-serif font-extrabold text-white line-clamp-1 group-hover/node:text-emerald-300 transition-colors">{node.value}</h4>
                      <p className="text-[9px] text-gray-400 font-sans line-clamp-1 font-medium">{node.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 4. COURSE SELECTION SYSTEM (COURSE BUILDER) */}
      <ScrollReveal delay={0.2} yOffset={30}>
        <div 
          className="bg-[#121215]/40 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-xl text-left space-y-8 relative overflow-hidden group/builder hover:border-emerald-500/5 transition-all duration-500" 
          id="course-selection-builder"
        >
          {/* Top aesthetic gradient flare */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-transparent blur-[120px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 relative z-10">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                Synapse Practice Architect
              </span>
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight pt-1">Medical Course Builder</h2>
              <p className="text-xs font-sans text-gray-400 max-w-xl leading-relaxed">
                Freely construct personalized board exam training sessions. Select complete semesters, specialized units, single modules, custom combinations, or your targeted revision buckets.
              </p>
            </div>

            {/* Quick-practice target triggers with pristine borders */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleLaunchTargetPractice("year")}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-mono font-bold transition-all duration-300 cursor-pointer active:scale-95"
              >
                Entire Curriculum
              </button>
              <button
                onClick={() => handleLaunchTargetPractice("favorites")}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-mono font-bold transition-all duration-300 cursor-pointer active:scale-95"
              >
                Revision Flagged
              </button>
              <button
                onClick={() => handleLaunchTargetPractice("incorrect")}
                className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/25 text-xs font-mono font-bold transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
              >
                Incorrect Qs
              </button>
            </div>
          </div>

          {/* Unified search and bulk selectors */}
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medical course syllabus, topics, and rationales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-[#070709]/50 text-xs sm:text-sm text-white placeholder-gray-500 transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedBuilderCourses.length > 0 && (
              <button
                onClick={() => setSelectedBuilderCourses([])}
                className="text-xs font-mono text-gray-400 hover:text-white underline transition shrink-0 cursor-pointer font-bold bg-white/5 px-3 py-2 rounded-xl border border-white/5"
              >
                Deselect All ({selectedBuilderCourses.length})
              </button>
            )}
          </div>

          {/* Module lists and course grid */}
          <div className="space-y-8 relative z-10">
            {currentYearConfig.units.map((unit, uIdx) => {
              // Filter modules based on search query
              const filteredModules = unit.modules.filter(m => {
                if (!searchQuery) return true;
                const matchModule = m.frenchName.toLowerCase().includes(searchQuery.toLowerCase());
                const matchCourse = m.courses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchModule || matchCourse;
              });

              if (filteredModules.length === 0) return null;

              return (
                <div key={uIdx} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">{unit.frenchName}</span>
                    <button
                      onClick={() => {
                        const unitCourses = unit.modules.flatMap(m => m.courses);
                        const allSelected = unitCourses.every(c => selectedBuilderCourses.includes(c));
                        if (allSelected) {
                          setSelectedBuilderCourses(selectedBuilderCourses.filter(c => !unitCourses.includes(c)));
                        } else {
                          setSelectedBuilderCourses(Array.from(new Set([...selectedBuilderCourses, ...unitCourses])));
                        }
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline uppercase font-bold transition-all duration-200"
                    >
                      {unit.modules.flatMap(m => m.courses).every(c => selectedBuilderCourses.includes(c)) ? "Deselect Unit" : "Select Entire Unit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredModules.map((moduleConfig, mIdx) => {
                      const isExpanded = !!expandedModules[moduleConfig.frenchName];
                      const moduleCourses = moduleConfig.courses;
                      const allSelectedInModule = moduleCourses.every(c => selectedBuilderCourses.includes(c));
                      const someSelectedInModule = moduleCourses.some(c => selectedBuilderCourses.includes(c));

                      return (
                        <div 
                          key={mIdx}
                          className={`border rounded-2xl p-6 transition-all duration-500 backdrop-blur-xl group/card relative overflow-hidden scrolling-3d-card will-change-transform ${
                            someSelectedInModule 
                              ? "bg-emerald-500/[0.04] border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.06)] scale-[1.01]" 
                              : "bg-[#121215]/40 border-white/5 hover:border-emerald-500/20 hover:bg-[#121215]/70 hover:shadow-[0_0_30px_rgba(16,185,129,0.04)]"
                          }`}
                        >
                          {/* Iridescent radial hover overlay glow */}
                          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          
                          <div className="flex items-center justify-between gap-4 pb-4 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400 shadow-inner group-hover/card:scale-110 group-hover/card:border-emerald-500/20 group-hover/card:text-emerald-300 transition-all duration-300">
                                {getModuleIcon(moduleConfig.frenchName)}
                              </div>
                              <div className="text-left">
                                <h4 className="font-serif font-extrabold text-white text-base tracking-tight transition-colors group-hover/card:text-emerald-300 duration-300">{moduleConfig.frenchName}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">{moduleCourses.length} Board Courses</span>
                                  {someSelectedInModule && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  if (allSelectedInModule) {
                                    setSelectedBuilderCourses(selectedBuilderCourses.filter(c => !moduleCourses.includes(c)));
                                  } else {
                                    setSelectedBuilderCourses(Array.from(new Set([...selectedBuilderCourses, ...moduleCourses])));
                                  }
                                }}
                                className={`px-3 py-2 rounded-xl font-mono text-[9px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                  allSelectedInModule 
                                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105" 
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                                }`}
                              >
                                {allSelectedInModule ? "ALL SELECTED" : "SELECT ALL"}
                              </button>

                              <button
                                onClick={() => setExpandedModules(prev => ({ ...prev, [moduleConfig.frenchName]: !isExpanded }))}
                                className={`p-2 rounded-lg text-emerald-400 hover:text-emerald-300 bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                aria-label={isExpanded ? "Collapse module" : "Expand module"}
                              >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Smooth expanded list of courses */}
                          <AnimatePresence initial={false}>
                            {(isExpanded || searchQuery) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden border-t border-white/5 pt-4 mt-2 space-y-2 text-left relative z-10"
                              >
                                {moduleCourses.map((course, cIdx) => {
                                  const isSelected = selectedBuilderCourses.includes(course);
                                  return (
                                    <label 
                                      key={cIdx}
                                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-350 cursor-pointer ${
                                        isSelected 
                                          ? "bg-emerald-500/[0.05] border-emerald-500/25 text-white shadow-[0_0_15px_rgba(16,185,129,0.03)]" 
                                          : "bg-[#070709]/30 border-white/5 text-gray-400 hover:bg-white/[0.03] hover:text-white hover:border-white/10"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3.5 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {
                                            if (isSelected) {
                                              setSelectedBuilderCourses(selectedBuilderCourses.filter(c => c !== course));
                                            } else {
                                              setSelectedBuilderCourses([...selectedBuilderCourses, course]);
                                            }
                                          }}
                                          className="w-4 h-4 rounded text-emerald-500 border-white/10 focus:ring-emerald-500 bg-[#070709] transition-all cursor-pointer"
                                        />
                                        <span className="text-xs font-sans leading-relaxed truncate font-medium">{course}</span>
                                      </div>
                                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-md font-extrabold shrink-0 border ${
                                        isSelected 
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                          : "bg-white/5 border-white/5 text-gray-500"
                                      }`}>
                                        Verified
                                      </span>
                                    </label>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final launcher dock */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 relative z-10">
            <div className="text-left space-y-1">
              <h3 className="font-serif font-bold text-lg text-white tracking-tight">Review Workspace Session Details</h3>
              <p className="text-xs font-mono text-gray-400 uppercase font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {selectedBuilderCourses.length} of {currentYearConfig.units.flatMap(u => u.modules.flatMap(m => m.courses)).length} Courses Configured
              </p>
            </div>

            <Magnetic strength={0.2} range={50}>
              <button
                onClick={handleLaunchCustomBuilderSession}
                disabled={selectedBuilderCourses.length === 0}
                className={`px-8 py-4 rounded-2xl font-mono text-xs uppercase tracking-widest font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  selectedBuilderCourses.length === 0
                    ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 border border-emerald-500 hover:scale-[1.02] active:scale-95"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" /> Launch Synapse Session
              </button>
            </Magnetic>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};
