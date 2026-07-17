import React, { useState, useEffect } from "react";
import { StudentProvider, useStudent } from "./components/StudentContext";
import { Dashboard } from "./components/Dashboard";
import { CurriculumNav } from "./components/CurriculumNav";
import { QcmEngine } from "./components/QcmEngine";
import { NotesSection } from "./components/NotesSection";
import { BugReporter } from "./components/BugReporter";
import { ProfileView } from "./components/ProfileView";
import { AiChatbotView } from "./components/AiChatbotView";
import { AdminPanel } from "./components/AdminPanel";
import { CoursePlanner } from "./components/CoursePlanner";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { getSavedTheme, applyTheme, PRESET_THEMES } from "./lib/theme";
import { Question, AcademicYear, ALL_ACADEMIC_YEARS } from "./types";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  ChevronRight, 
  Activity, 
  LogOut, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Menu, 
  X, 
  Flame, 
  Sparkles,
  HeartHandshake,
  Stethoscope,
  Sun,
  Moon,
  Bell,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomCursor, Magnetic, TiltCard } from "./components/EliteInteractions";
import { MolecularBackdrop } from "./components/MolecularBackdrop";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { TypewriterLaser } from "./components/TypewriterLaser";
import { DoctorsScene, AuthFieldFocus } from "./components/DoctorsScene";


function MainAppLayout() {
  
  const { 
    student, 
    isLoading, 
    signInStudent, 
    signUpStudent, 
    signInWithGoogle,
    signOutStudent, 
    forceActivateSession, 
    isSessionTerminated 
  } = useStudent();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(true);

  // Deep Night Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === null ? true : saved === "dark";
  });

  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem("has_unread_notifications");
    return saved === null ? true : saved === "true";
  });

  const notifications = [
    {
      id: "notif_1",
      tag: "CURRICULUM ACTIVE",
      title: "Diagnostic Rattrapage QCMs updated",
      desc: `We have synchronized the final clinical board questions for ${student?.academicYear || "Year 3"} modules with official references.`,
      date: "Today"
    },
    {
      id: "notif_2",
      tag: "AI ENHANCEMENT",
      title: "SocratesMD document analyzer online",
      desc: "Our AI Study Chatbot can read and cross-reference your uploaded notes. Drag and drop study PDFs in the Chat tab!",
      date: "Yesterday"
    },
    {
      id: "notif_3",
      tag: "REASONING GUIDES",
      title: "Verified clinical rationales deployed",
      desc: "Pathology and drug treatment rationales have been updated and reviewed by residency committee advisors.",
      date: "3 days ago"
    }
  ];

  const renderNotificationsDropdown = () => {
    if (!notificationsOpen) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0D0E12] border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl shadow-xl overflow-hidden z-50 text-left backdrop-blur-md"
        id="notifications-dropdown-menu"
      >
        <div className="p-4 border-b border-[#E6E2D8]/50 dark:border-[#1B1E26]/50 flex justify-between items-center bg-[#FAF9F6]/50 dark:bg-[#0D0E12]/50">
          <span className="text-xs font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#7D8C61]" /> Faculty Bulletins & Updates
          </span>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="text-[10px] font-mono text-[#7D8C61] dark:text-[#8CA365] hover:underline"
          >
            Close
          </button>
        </div>
        <div className="divide-y divide-[#E6E2D8]/40 dark:divide-[#1B1E26]/40 max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 hover:bg-[#FAF9F6] dark:hover:bg-[#171A22]/40 transition text-left">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="px-1.5 py-0.5 bg-[#7D8C61]/10 text-[#7D8C61] dark:text-[#8CA365] text-[8px] font-mono rounded font-bold uppercase">
                  {n.tag}
                </span>
                <span className="text-[9px] font-mono text-[#9A9489] dark:text-[#8C929D]">{n.date}</span>
              </div>
              <h4 className="text-xs font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] mb-1 leading-snug">
                {n.title}
              </h4>
              <p className="text-[11px] text-[#7A756D] dark:text-[#8C929D] leading-relaxed">
                {n.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Synchronize on startup and when isDarkMode changes
  useEffect(() => {
    const saved = getSavedTheme();
    applyTheme(saved);
    setIsDarkMode(saved.isDark);
    
    const handleStorage = () => {
      setIsDarkMode(getSavedTheme().isDark);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const saved = getSavedTheme();
    if (saved.isDark !== isDarkMode) {
      const targetPreset = isDarkMode ? PRESET_THEMES.dark : PRESET_THEMES.light;
      applyTheme(targetPreset);
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  
  // Authentication & Registration States
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regYear, setRegYear] = useState<AcademicYear>("Year 1");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  // Which auth field is focused — drives the 3D doctors' behaviour on the left panel
  const [authFocusField, setAuthFocusField] = useState<AuthFieldFocus>("none");

  // Active QCM Session State (when student is answering questions)
  const [activeSession, setActiveSession] = useState<{
    mode: "normal" | "exam";
    courses?: string[];
    examYear?: string;
  } | null>(null);

  // Cross-page parameters
  const [prefilledBugId, setPrefilledBugId] = useState<string | null>(null);
  const [prefilledBugText, setPrefilledBugText] = useState<string | null>(null);
  const [prefilledChatQuestion, setPrefilledChatQuestion] = useState<Question | null>(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string | null>(null);

  // New Onboarding Flow States
  const [welcomeScanned, setWelcomeScanned] = useState<boolean>(false);
  const [hasChosenYear, setHasChosenYear] = useState<boolean>(false);
  const [sessionAuthenticated, setSessionAuthenticated] = useState<boolean>(false);
  const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false);

  // Initial load check for returning users with academicYear already on their profile
  useEffect(() => {
    if (!isLoading && !initialCheckDone) {
      if (student && student.academicYear && !sessionAuthenticated) {
        setHasChosenYear(true);
      }
      setInitialCheckDone(true);
    }
  }, [isLoading, student, initialCheckDone, sessionAuthenticated]);

  // Sync states on logout
  useEffect(() => {
    if (!student) {
      setWelcomeScanned(false);
      setHasChosenYear(false);
      setSessionAuthenticated(false);
      setInitialCheckDone(false);
    }
  }, [student]);

  const handleWelcomeComplete = () => {
    setWelcomeScanned(true);
    if (student && student.academicYear && !sessionAuthenticated) {
      setHasChosenYear(true);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-6 relative overflow-hidden ${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}`}>
        <MolecularBackdrop />
        <div className="relative flex items-center justify-center z-10">
          <div className={`w-20 h-20 border-2 rounded-full animate-pulse ${isDarkMode ? "border-[#7D8C61]/10" : "border-[#70ABAF]/15"}`}></div>
          <div className={`w-20 h-20 border-2 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute ${isDarkMode ? "border-t-[#7D8C61]" : "border-t-[#70ABAF]"}`}></div>
          <Stethoscope className={`w-8 h-8 absolute stethoscope-rotate ${isDarkMode ? "text-[#7D8C61]" : "text-[#70ABAF]"}`} />
        </div>
        <div className="text-center space-y-2.5 animate-pulse z-10">
          <p className={`font-serif text-2xl font-bold tracking-wide ${isDarkMode ? "text-[#00F5D4] drop-shadow-[0_0_10px_rgba(0,245,212,0.3)]" : "text-[#70ABAF] drop-shadow-[0_0_10px_rgba(112,171,175,0.3)]"}`}>medisona</p>
          <p className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold ${isDarkMode ? "text-[#8CA365]" : "text-[#99E1D9]"}`}>
            Configuring Synapse Terminal...
          </p>
        </div>
      </div>
    );
  }

  // 1. Welcome Screen (First Stage: Biometric Card Scan Page)
  if (!welcomeScanned) {
    return (
      <WelcomeScreen 
        doctorName={student?.name || "Doctor"} 
        initialStage="welcome"
        onWelcomeComplete={handleWelcomeComplete}
        onEnter={() => {}}
      />
    );
  }

  // Session hijack disconnect screen
  if (isSessionTerminated) {
    return (
      <div className={`min-h-screen backdrop-blur-md flex items-center justify-center p-4 z-50 fixed inset-0 ${isDarkMode ? "bg-[#040507]/90" : "bg-[#F0F7F4]/90"}`}>
        <MolecularBackdrop />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-xl rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-[0_30px_70px_rgba(0,0,0,0.6)] border space-y-6 text-center z-10 ${isDarkMode ? "bg-[#0d0d11]/45 border-[#7D8C61]/35" : "bg-[#FFFFFF] border-[#70ABAF]/15"}`}
        >
          <div className="w-16 h-16 bg-[#C58B74]/15 rounded-2xl flex items-center justify-center text-[#C58B74] mx-auto animate-pulse border border-[#C58B74]/30">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h2 className={`text-2xl font-serif font-bold ${isDarkMode ? "text-[#FAF9F6]" : "text-[#32292F]"}`}>
              Session Disconnected
            </h2>
            <p className={`text-sm leading-relaxed ${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}`}>
              Your medisona premium account has been accessed from another device or browser tab.
            </p>
            <p className={`text-[11px] font-mono leading-relaxed ${isDarkMode ? "text-[#8C929D]/60" : "text-[#7A756D]/60"}`}>
              To guarantee data integrity and prevent unauthorized account sharing, active access is restricted to 1 device at a time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-3">
            <button
              onClick={forceActivateSession}
              className={`w-full py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all duration-200 cursor-pointer ${isDarkMode ? "bg-[#7D8C61] hover:bg-[#8A9A5B] text-white shadow-[#7D8C61]/10" : "bg-[#70ABAF] hover:bg-[#5C9498] text-[#F0F7F4] shadow-[#70ABAF]/10"}`}
            >
              Force Access Here
            </button>
            <button
              onClick={signOutStudent}
              className={`w-full py-3.5 border rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer ${isDarkMode ? "bg-[#171A22] hover:bg-[#2C303D] text-[#FAF9F6] border-white/5" : "bg-white hover:bg-[#F7FBF9] text-[#32292F] border-[#70ABAF]/20"}`}
            >
              Sign Out & Relog
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Premium Authentication & Registration Portal
  if (!student) {
    const years = ALL_ACADEMIC_YEARS;
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError("");
      setAuthLoading(true);

      try {
        if (authMode === "signin") {
          await signInStudent(authEmail, authPassword);
        } else {
          if (!regName.trim()) {
            setAuthError("Please provide your full name to sign up.");
            setAuthLoading(false);
            return;
          }
          await signUpStudent(regName.trim(), authEmail, authPassword, regYear);
        }
        setSessionAuthenticated(true);
      } catch (err: any) {
        console.error("Auth submit error:", err);
        setAuthError(err.message || "An authentication error occurred. Please verify your credentials.");
      } finally {
        setAuthLoading(false);
      }
    };

    const handleGoogleSignIn = async () => {
      setAuthError("");
      setAuthLoading(true);
      try {
        await signInWithGoogle(regYear);
        setSessionAuthenticated(true);
      } catch (err: any) {
        console.error("Google Sign-In error:", err);
        setAuthError(err.message || "Google Authentication failed. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    };

    const handleDemoMode = () => {
      localStorage.setItem("med_student_id", "offline_user");
      localStorage.setItem("med_student_name", "Dr. Sandbox Demo");
      localStorage.setItem("med_student_year", "Year 3");
      localStorage.setItem("med_student_answers", "{}");
      localStorage.setItem("med_student_notes", "[]");
      window.location.reload();
    };

    return (
      <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}`} id="onboarding-portal">
        <MolecularBackdrop />

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-16 h-8 rounded-full border transition-all duration-500 cursor-pointer shadow-lg flex items-center p-1 overflow-hidden focus:outline-none ${
              isDarkMode
                ? "bg-[#0d0d11]/80 border-[#7D8C61]/35 hover:border-[#7D8C61]/70 hover:shadow-[0_0_15px_rgba(125,140,97,0.2)]"
                : "bg-[#FFFFFF]/90 border-[#70ABAF]/50 hover:border-[#70ABAF] hover:shadow-[0_4px_12px_rgba(112,171,175,0.25)]"
            }`}
            aria-label="Toggle theme"
          >
            {/* Slider Background Track Details */}
            <div className="absolute inset-0 flex justify-between px-2.5 items-center pointer-events-none opacity-45 font-mono text-[8px] font-extrabold">
              <span className={!isDarkMode ? "text-[#32292F]" : "text-[#7D8C61]"}>D</span>
              <span className={!isDarkMode ? "text-[#70ABAF]" : "text-[#FAF9F6]"}>L</span>
            </div>

            {/* Animated Knob */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transform transition-all duration-500 shadow-md ${
                isDarkMode
                  ? "translate-x-0 bg-[#7D8C61] text-[#0d0d11] rotate-0"
                  : "translate-x-8 bg-[#70ABAF] text-[#F0F7F4] rotate-180"
              }`}
            >
              {isDarkMode ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </div>
          </button>
        </div>

        {/* Cinematic glow in backgrounds */}
        <div className={`absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full blur-[120px] pointer-events-none ${isDarkMode ? "bg-[#7D8C61]/10" : "bg-[#70ABAF]/15"}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full blur-[140px] pointer-events-none ${isDarkMode ? "bg-[#81A1C1]/5" : "bg-[#99E1D9]/20"}`}></div>

        {/* Split layout: 3D medical crew on the left, auth card on the right */}
        <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">

          {/* LEFT — Interactive 3D doctors panel */}
          <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] lg:h-screen lg:sticky lg:top-0 flex-col px-10 xl:px-14 py-10 relative overflow-hidden">
            {/* Panel ambient glows */}
            <div className={`absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-[110px] pointer-events-none ${isDarkMode ? "bg-[#7D8C61]/12" : "bg-[#99E1D9]/30"}`}></div>
            <div className={`absolute bottom-0 right-0 w-[24rem] h-[24rem] rounded-full blur-[120px] pointer-events-none ${isDarkMode ? "bg-[#00F5D4]/6" : "bg-[#70ABAF]/15"}`}></div>

            {/* Panel brand header */}
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center gap-3.5"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg ${isDarkMode ? "bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/40 shadow-[0_0_20px_rgba(0,245,212,0.25)]" : "bg-[#70ABAF]/10 text-[#70ABAF] border-[#70ABAF]/40 shadow-[0_0_20px_rgba(112,171,175,0.25)]"}`}>
                <Stethoscope className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <p className={`font-serif font-bold text-lg leading-none ${isDarkMode ? "text-[#FAF9F6]" : "text-[#32292F]"}`}>medisona</p>
                <p className={`text-[9px] font-mono uppercase tracking-[0.22em] font-bold mt-1 ${isDarkMode ? "text-[#8CA365]" : "text-[#70ABAF]"}`}>Care Crew On Duty</p>
              </div>
            </motion.div>

            {/* The 3D crew itself */}
            <div className="relative z-10 flex-1 min-h-0">
              <div className="absolute inset-0">
                <DoctorsScene focusedField={authFocusField} isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Reactive caption that mirrors the crew's behaviour */}
            <div className="relative z-10 min-h-[4.5rem] text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={authFocusField === "password" ? "pw" : (authFocusField === "email" || authFocusField === "name") ? "typing" : "idle"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-1.5"
                >
                  <p className={`font-serif font-bold text-xl ${isDarkMode ? "text-[#FAF9F6]" : "text-[#32292F]"}`}>
                    {authFocusField === "password"
                      ? "Privacy mode: engaged."
                      : (authFocusField === "email" || authFocusField === "name")
                        ? "They're reading along…"
                        : "Meet your clinical crew."}
                  </p>
                  <p className={`text-xs font-mono leading-relaxed max-w-sm ${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}`}>
                    {authFocusField === "password"
                      ? "Hands over eyes and bodies turned — nobody's peeking at your password. Promise."
                      : (authFocusField === "email" || authFocusField === "name")
                        ? "The whole crew leans in to watch you type. No pressure."
                        : "Three specialists on shift around the clock. Move your cursor — they never miss a thing."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Authentication card */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 lg:py-8 relative">

        <motion.div
          initial={{ 
            opacity: 0, 
            y: -180, 
            scale: 0.85, 
            rotateX: 45, 
            rotateY: -5, 
            z: -200 
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            rotateX: 0, 
            rotateY: 0, 
            z: 0 
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
          className={`backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-12 max-w-xl w-full shadow-[0_30px_80px_rgba(0,0,0,0.8)] border space-y-8 relative z-10 ${isDarkMode ? "bg-[#0d0d11]/45 border-[#7D8C61]/35" : "bg-[#FFFFFF] border-[#70ABAF]/15"}`}
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
              whileHover={{ scale: 1.12, rotate: 8 }}
              className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center mx-auto cursor-pointer group transition-all duration-300 relative overflow-hidden ${isDarkMode ? "bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/40 shadow-[0_0_25px_rgba(0,245,212,0.3),inset_0_0_10px_rgba(0,245,212,0.15)]" : "bg-[#70ABAF]/10 text-[#70ABAF] border-[#70ABAF]/40 shadow-[0_0_25px_rgba(112,171,175,0.3),inset_0_0_10px_rgba(112,171,175,0.15)]"}`}
            >
              <motion.div
                animate={{
                  y: [0, -3, 0],
                  scale: [1, 1.04, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Stethoscope className={`w-8 h-8 ${isDarkMode ? "text-[#00F5D4] drop-shadow-[0_0_12px_rgba(0,245,212,0.85)]" : "text-[#70ABAF] drop-shadow-[0_0_12px_rgba(112,171,175,0.85)]"}`} />
              </motion.div>
              <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-ping ${isDarkMode ? "bg-[#00F5D4]" : "bg-[#70ABAF]"}`} />
            </motion.div>
            <h1 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${isDarkMode ? "text-[#FAF9F6]" : "text-[#32292F]"}`}>
              <TypewriterLaser text="medisona Portal" delay={200} speed={35} />
            </h1>
            <p className={`text-sm leading-relaxed max-w-sm mx-auto font-sans ${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}`}>
              <TypewriterLaser text="An elite medical Board Prep syllabus console. Authenticate below to activate your interactive clinic curriculum." delay={700} speed={12} />
            </p>
          </div>

          {/* Toggle Tab */}
          <div className={`p-1.5 rounded-2xl flex border ${isDarkMode ? "bg-[#171A22]/90 border-[#1B1E26]" : "bg-[#F7FBF9] border-[#70ABAF]/15"}`}>
            <button
              onClick={() => { setAuthMode("signin"); setAuthError(""); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all duration-200 font-bold select-none cursor-pointer ${
                authMode === "signin"
                  ? (isDarkMode ? "bg-[#0d0d11] text-[#7D8C61] shadow-sm border border-[#1B1E26]" : "bg-white text-[#70ABAF] shadow-sm border border-[#70ABAF]/15")
                  : (isDarkMode ? "text-[#8C929D] hover:text-[#FAF9F6]" : "text-[#7A756D] hover:text-[#32292F]")
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setAuthError(""); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all duration-200 font-bold select-none cursor-pointer ${
                authMode === "signup"
                  ? (isDarkMode ? "bg-[#0d0d11] text-[#7D8C61] shadow-sm border border-[#1B1E26]" : "bg-white text-[#70ABAF] shadow-sm border border-[#70ABAF]/15")
                  : (isDarkMode ? "text-[#8C929D] hover:text-[#FAF9F6]" : "text-[#7A756D] hover:text-[#32292F]")
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {authError.toLowerCase().includes("unauthorized-domain") ? (
                <div className={`border p-5 rounded-2xl text-xs space-y-4 shadow-sm ${isDarkMode ? "bg-[#0d0d11]/80 border-[#C58B74]/50 text-[#FAF9F6]" : "bg-[#FAF9F6] border-[#C58B74]/50 text-[#423F3A]"}`}>
                  <div className="flex items-start gap-2.5 text-[#C58B74] font-bold font-sans">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="uppercase tracking-wider">Authorized Domain Required</span>
                  </div>
                  <p className={`leading-relaxed font-sans ${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}`}>
                    Google Auth is pending setup because this environment's domain is not registered in your Firebase settings.
                  </p>
                  
                  <div className={`border rounded-xl p-3 flex items-center justify-between gap-2 ${isDarkMode ? "bg-[#0a0a0e] border-[#1B1E26]" : "bg-[#FAF9F6] border-[#E6E2D8]"}`}>
                    <div className={`font-mono text-[11px] select-all overflow-hidden text-ellipsis whitespace-nowrap ${isDarkMode ? "text-[#FAF9F6]" : "text-[#5C5852]"}`}>
                      {window.location.hostname}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.hostname);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 2000);
                      }}
                      className={`px-3 py-1.5 text-white rounded-lg text-[10px] font-mono uppercase font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${isDarkMode ? "bg-[#7D8C61] hover:bg-[#8A9A5B]" : "bg-[#70ABAF] hover:bg-[#5C9498]"}`}
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedDomain ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className={`space-y-2 font-sans text-[11px] border-t pt-3 ${isDarkMode ? "border-[#1B1E26] text-[#8C929D]" : "border-[#E6E2D8]/50 text-[#7A756D]"}`}>
                    <p className={`font-semibold uppercase tracking-wider text-[10px] ${isDarkMode ? "text-[#FAF9F6]" : "text-[#423F3A]"}`}>Setup Instruction:</p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      <li>
                        Go to your{" "}
                        <a
                          href="https://console.firebase.google.com/"
                          target="_blank"
                          rel="noreferrer"
                          className={`font-semibold underline inline-flex items-center gap-0.5 ${isDarkMode ? "text-[#7D8C61] hover:text-[#8A9A5B]" : "text-[#70ABAF] hover:text-[#5C9498]"}`}
                        >
                          Firebase Console <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>Select authentication settings and append this domain to <strong>Authorized domains</strong></li>
                      <li>Reload the workspace and try Google Sign-In again</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="bg-[#C58B74]/10 border border-[#C58B74]/30 text-[#C58B74] p-4 rounded-2xl text-xs font-mono leading-relaxed">
                  ⚠️ {authError}
                </div>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "signup" && (
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  onFocus={() => setAuthFocusField("name")}
                  onBlur={() => setAuthFocusField("none")}
                  placeholder="e.g. Dr. Jane Doe"
                  className={`w-full p-3.5 border rounded-xl transition text-sm ${
                    isDarkMode 
                      ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                      : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                  }`}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-4 h-4 w-4 ${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}`} />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  onFocus={() => setAuthFocusField("email")}
                  onBlur={() => setAuthFocusField("none")}
                  placeholder="name@university.edu"
                  className={`w-full pl-11 p-3.5 border rounded-xl transition text-sm ${
                    isDarkMode 
                      ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                      : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                Account Password
              </label>
              <div className="relative">
                <Key className={`absolute left-4 top-4 h-4 w-4 ${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}`} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onFocus={() => setAuthFocusField("password")}
                  onBlur={() => setAuthFocusField("none")}
                  placeholder="••••••••"
                  className={`w-full pl-11 p-3.5 border rounded-xl transition text-sm ${
                    isDarkMode 
                      ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                      : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all duration-350 flex items-center justify-center gap-2 cursor-pointer ${
                authLoading
                  ? (isDarkMode ? "bg-[#1B1E26] text-[#8C929D] cursor-not-allowed" : "bg-[#E6E2D8] text-[#9A9489] cursor-not-allowed")
                  : (isDarkMode ? "bg-[#7D8C61] hover:bg-[#8A9A5B] text-white shadow-md shadow-[#7D8C61]/10" : "bg-[#70ABAF] hover:bg-[#5C9498] text-[#F0F7F4] shadow-md shadow-[#70ABAF]/10")
              }`}
            >
              {authLoading ? (
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isDarkMode ? "border-[#8C929D]" : "border-[#9A9489]"}`}></div>
              ) : (
                <>
                  {authMode === "signin" ? "Access Workspace" : "Register Credentials"} 
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className={`flex-grow border-t ${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/60"}`}></div>
              <span className={`flex-shrink mx-4 text-[9px] font-mono uppercase tracking-widest ${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}`}>or</span>
              <div className={`flex-grow border-t ${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/60"}`}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className={`w-full py-3.5 px-4 border rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer ${
                authLoading ? "opacity-60 cursor-not-allowed" : ""
              } ${
                isDarkMode 
                  ? "border-[#1B1E26] bg-[#0d0d11] hover:bg-[#171A22] text-[#FAF9F6] hover:border-[#7D8C61]" 
                  : "border-[#70ABAF]/20 bg-white hover:bg-[#F7FBF9] text-[#32292F] hover:border-[#70ABAF]"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.63 0 3.1.56 4.25 1.66l3.18-3.18C17.5 1.7 14.95 1 12 1 7.37 1 3.42 3.66 1.48 7.56l3.77 2.92C6.15 7.15 8.84 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.45c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.57-5.12 3.57-8.65z" />
                <path fill="#FBBC05" d="M5.25 14.44a7.18 7.18 0 0 1 0-4.88V6.64H1.48a11.94 11.94 0 0 0 0 10.72l3.77-2.92z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.85-2.98c-1.07.72-2.45 1.15-4.11 1.15-3.16 0-5.85-2.11-6.8-5.44L1.41 15.75C3.35 19.64 7.33 23 12 23z" />
              </svg>
              {authMode === "signin" ? "Sign In with Google" : "Register with Google"}
            </button>
          </form>

          {/* Demo Sandbox Mode */}
          <div className={`text-center pt-3 border-t ${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/50"}`}>
            <span className={`text-[10px] font-mono block mb-2 uppercase tracking-wide ${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}`}>Or explore immediately:</span>
            <button
              onClick={handleDemoMode}
              className={`text-xs font-mono font-bold underline transition ${isDarkMode ? "text-[#7D8C61] hover:text-[#8A9A5B]" : "text-[#70ABAF] hover:text-[#5C9498]"}`}
            >
              Launch Sandbox Mode (Offline Demo)
            </button>
          </div>
        </motion.div>

          </div>
        </div>
      </div>
    );
  }
  // 2. Choosing Year (Second Stage: Post-Account Creation Academic Year / Module Selection)
  if (!hasChosenYear) {
    return (
      <WelcomeScreen 
        doctorName={student.name} 
        initialStage="years"
        onEnter={(selectedModule) => {
          if (selectedModule) {
            setSelectedModuleFilter(selectedModule);
            setActiveTab("curriculum");
          }
          setHasChosenYear(true);
        }} 
      />
    );
  }

  // Navigation Callback Utilities
  const handleStartSession = (config: {
    mode: "normal" | "exam";
    courses?: string[];
    examYear?: string;
  }) => {
    setActiveSession(config);
  };

  const handleNavigateToBugs = (qId: string, qText: string) => {
    setPrefilledBugId(qId);
    setPrefilledBugText(qText);
    setActiveTab("bugs");
  };

  const handleNavigateToChat = (q: Question) => {
    setPrefilledChatQuestion(q);
    setActiveTab("chat");
  };

  const handleDashboardNavigation = (tab: string, extra?: any) => {
    if (tab === "curriculum" && extra?.examModeYear) {
      setActiveSession({
        mode: "exam",
        examYear: extra.examModeYear
      });
    } else if (tab === "resume-session" && extra) {
      setActiveSession(extra);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="h-screen bg-[#FAF9F6] dark:bg-[#050608] text-[#2E3440] dark:text-[#FAF9F6] flex flex-col lg:flex-row font-sans relative overflow-hidden transition-colors duration-300" id="app-layout">
      {/* Background canvas of floating molecules */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60">
        <MolecularBackdrop />
      </div>
      
      {/* Sleek Mobile Navigation Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0D0E12]/90 backdrop-blur-md border-b border-[#E6E2D8] dark:border-[#1B1E26] px-4 py-3 flex items-center justify-between relative z-10">
        <div 
          onClick={() => {
            setActiveTab("dashboard");
            setActiveSession(null);
            setMobileMenuOpen(false);
          }}
          className="flex items-center space-x-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 bg-[#7D8C61] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#7D8C61]/10 transition-all duration-300 group-hover:scale-105">
            <Stethoscope className="w-5 h-5 stethoscope-rotate" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] leading-none text-base">medisona</h1>
            <span className="text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase tracking-wider block mt-0.5">Medical Academy</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User profile capsule */}
          <div className="bg-white dark:bg-[#171A22] border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <div className="w-5 h-5 bg-[#7D8C61]/15 text-[#7D8C61] dark:text-[#8CA365] rounded-md flex items-center justify-center font-bold text-[10px]">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-mono uppercase text-[#423F3A] dark:text-[#FAF9F6] font-bold">{student.academicYear}</span>
          </div>

          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-[#7D8C61] dark:text-[#8CA365] hover:bg-[#FAF9F6] dark:hover:bg-[#171A22] rounded-xl border border-[#E6E2D8] dark:border-[#1B1E26] flex items-center justify-center transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-[#7D8C61]" />
            )}
          </button>

          {/* Mobile Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) {
                  setHasUnreadNotifications(false);
                  localStorage.setItem("has_unread_notifications", "false");
                }
              }}
              className="p-2 text-[#7D8C61] dark:text-[#8CA365] hover:bg-[#FAF9F6] dark:hover:bg-[#171A22] rounded-xl border border-[#E6E2D8] dark:border-[#1B1E26] flex items-center justify-center transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <AnimatePresence>
              {renderNotificationsDropdown()}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#423F3A] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#171A22] rounded-xl border border-[#E6E2D8] dark:border-[#1B1E26]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Persistent Elegant Navigation Sidebar (Desktop & Mobile Panel) */}
      <AnimatePresence>
        {(mobileMenuOpen || !activeSession) && (
          <nav
            className={`fixed inset-y-0 left-0 lg:static z-40 ${navCollapsed ? 'w-24 px-4' : 'w-72 px-6'} py-6 bg-[#070709]/95 lg:bg-transparent border-r border-white/5 lg:border-r-0 flex flex-col justify-between shrink-0 transform transition-all duration-300 lg:transform-none backdrop-blur-md lg:backdrop-blur-none ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } ${activeSession ? "hidden lg:hidden" : "flex"}`}
          >
            <div className="space-y-8 relative z-10 w-full">
              {/* Logo (Desktop Only) */}
              <Magnetic strength={0.25} range={65}>
                <div 
                  onClick={() => {
                    setActiveTab("dashboard");
                    setActiveSession(null);
                  }}
                  className={`hidden lg:flex items-center pb-2 border-b border-white/10 group cursor-pointer ${navCollapsed ? 'justify-center' : 'space-x-3'}`}
                >
                  <div className="w-10 h-10 shrink-0 bg-emerald-500 text-black rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-105 border border-emerald-400 font-bold">
                    <Stethoscope className="w-5.5 h-5.5 stethoscope-rotate" />
                  </div>
                  <div className={`text-left ${navCollapsed ? 'hidden' : 'block'}`}>
                    <h1 className="font-serif font-bold text-white tracking-tight text-lg">medisona</h1>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-0.5 block font-bold">Medical Board Prep</span>
                  </div>
                </div>
              </Magnetic>

              {/* Navigation Links */}
              <div className="space-y-1 w-full">
                {[
                  { id: "dashboard", label: "Dashboard", icon: Stethoscope },
                  { id: "curriculum", label: "Curriculum Paths", icon: BookOpen },
                  { id: "planner", label: "Course Planner", icon: Calendar },
                  { id: "pomodoro", label: "Focus Timer", icon: Flame },
                  { id: "chat", label: "Study Chatbot", icon: MessageSquare, badge: "AI" },
                  { id: "notes", label: "Notes Scratchpad", icon: FileText },
                  { id: "bugs", label: "Signal Error", icon: AlertTriangle },
                  { id: "profile", label: "Profile Settings", icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      data-magnetic="true"
                      title={navCollapsed ? item.label : undefined}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center ${navCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer nav-btn-transition group ${
                        isActive
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10 border border-emerald-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className={`flex items-center ${navCollapsed ? 'justify-center' : 'space-x-3.5'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${item.id === "dashboard" ? "stethoscope-rotate" : "medical-icon-rotate"}`} />
                        {!navCollapsed && <span className="font-mono">{item.label}</span>}
                      </div>
                      {!navCollapsed && item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold leading-none ${
                          isActive ? "bg-black text-emerald-400" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {student.isAdmin && (
                  <button
                    data-magnetic="true"
                    title={navCollapsed ? "Admin Portal" : undefined}
                    onClick={() => {
                      setActiveTab("admin");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${navCollapsed ? 'justify-center' : 'space-x-3.5'} px-4 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      activeTab === "admin"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10 border border-emerald-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {!navCollapsed && <span>Admin Portal</span>}
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Student Context Profile Info */}
            <div className="space-y-4 pt-6 border-t border-white/10 relative z-10 w-full flex flex-col">
              {!navCollapsed ? (
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className="text-xs font-serif font-bold text-white truncate leading-tight">{student.name}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-0.5 truncate font-bold">{student.academicYear}</p>
                  </div>
                </div>
              ) : (
                <div className="w-9 h-9 mx-auto bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20" title={student.name}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                data-magnetic="true"
                onClick={signOutStudent}
                title={navCollapsed ? "Sign Out" : undefined}
                className={`w-full flex items-center ${navCollapsed ? 'justify-center' : 'justify-center gap-2'} py-3 bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer`}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                {!navCollapsed && <span>Sign Out</span>}
              </button>

              <button
                onClick={() => setNavCollapsed(!navCollapsed)}
                title={navCollapsed ? "Menu" : undefined}
                className={`w-full flex items-center ${navCollapsed ? 'justify-center' : 'justify-center gap-2'} py-3 mt-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer`}
              >
                <Menu className="w-3.5 h-3.5 shrink-0" />
                {!navCollapsed && <span>Menu</span>}
              </button>
            </div>
          </nav>
        )}
      </AnimatePresence>

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
        
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#FAF9F6]/85 dark:bg-[#050608]/85 backdrop-blur-md px-10 py-5 justify-between items-center border-b border-[#E6E2D8]/40 dark:border-[#1B1E26]/40">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#423F3A] dark:text-[#FAF9F6] capitalize">
              {activeSession ? "Mock Exam Terminal" : activeTab === "bugs" ? "Signal Medical Error" : activeTab.replace("_", " ")}
            </h2>
            <p className="text-[10px] font-mono text-[#9A9489] dark:text-[#8C929D] uppercase tracking-wider mt-1">
              {activeSession ? "Clinical Practice" : `Active Curriculum Path • ${student.academicYear}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Bell (Desktop) */}
            <div className="relative">
              <Magnetic strength={0.4} range={50}>
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    if (!notificationsOpen) {
                      setHasUnreadNotifications(false);
                      localStorage.setItem("has_unread_notifications", "false");
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D0E12] border border-[#E6E2D8] dark:border-[#1B1E26] text-[#7D8C61] dark:text-[#8CA365] flex items-center justify-center shadow-sm cursor-pointer transition-colors duration-200 hover:text-[#8CA365] hover:border-[#7D8C61] dark:hover:border-[#8CA365] focus:outline-none relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </Magnetic>
              <AnimatePresence>
                {renderNotificationsDropdown()}
              </AnimatePresence>
            </div>

            {/* Magnetic Dark Mode Toggle */}
            <Magnetic strength={0.4} range={50}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D0E12] border border-[#E6E2D8] dark:border-[#1B1E26] text-[#7D8C61] dark:text-[#8CA365] flex items-center justify-center shadow-sm cursor-pointer transition-colors duration-200 hover:text-[#8CA365] hover:border-[#7D8C61] dark:hover:border-[#8CA365] focus:outline-none"
                aria-label="Toggle dark mode"
                data-cursor="blend"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="w-5 h-5 text-[#7D8C61]" />
                )}
              </button>
            </Magnetic>

            {/* Real streak indicator */}
            <div className={`border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-sm transition-all duration-300 ${
              (student.streakCount || 0) > 0
                ? "bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 border-orange-500/25 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                : "bg-white dark:bg-[#0D0E12]"
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center relative overflow-visible transition-all duration-300 ${
                (student.streakCount || 0) > 0
                  ? "bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "bg-[#7D8C61]/10 text-[#7D8C61] dark:text-[#8CA365] border border-[#7D8C61]/15"
              }`}>
                {(student.streakCount || 0) > 0 && (
                  <>
                    <span className="absolute inset-0 rounded-lg bg-orange-500/30 blur animate-ping scale-110 pointer-events-none"></span>
                    <span className="absolute -top-1 left-1.5 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-80"></span>
                    <span className="absolute -top-1.5 left-4 w-0.5 h-0.5 bg-amber-400 rounded-full animate-bounce delay-150 opacity-70"></span>
                  </>
                )}
                <Flame className={`w-4 h-4 ${(student.streakCount || 0) > 0 ? "fill-white text-white" : "fill-current animate-pulse"}`} />
              </div>
              <div className="text-left font-mono">
                <span className={`text-xs font-bold block ${
                  (student.streakCount || 0) > 0 ? "text-orange-600 dark:text-orange-400" : "text-[#423F3A] dark:text-[#FAF9F6]"
                }`}>
                  {student.streakCount || 0} {(student.streakCount || 0) > 0 ? "🔥 Days" : "Days"}
                </span>
                <span className="text-[9px] text-[#7A756D] dark:text-[#8C929D] uppercase font-bold tracking-tight">Streak</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0D0E12] border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] dark:bg-[#171A22] border border-[#E6E2D8] dark:border-[#1B1E26] flex items-center justify-center text-xs font-bold font-mono text-[#423F3A] dark:text-[#FAF9F6]">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left font-sans">
                <span className="text-xs font-bold text-[#423F3A] dark:text-[#FAF9F6] block truncate max-w-[100px]">{student.name}</span>
                <span className="text-[9px] text-[#7A756D] dark:text-[#8C929D] font-mono uppercase block mt-0.5">{student.academicYear}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content canvas container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {activeSession ? (
              <motion.div
                key="qcm-session"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto w-full space-y-6"
              >
                <QcmEngine
                  sessionConfig={activeSession}
                  onClose={() => setActiveSession(null)}
                  onNavigateToBugs={handleNavigateToBugs}
                  onNavigateToChat={handleNavigateToChat}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 16, filter: "blur(6px)" }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {activeTab === "dashboard" && (
                  <Dashboard onNavigate={handleDashboardNavigation} />
                )}
                {activeTab === "curriculum" && (
                  <CurriculumNav
                    onStartSession={handleStartSession}
                    initialExamYear={null}
                    selectedModuleFilter={selectedModuleFilter}
                    onClearModuleFilter={() => setSelectedModuleFilter(null)}
                  />
                )}
                {activeTab === "planner" && <CoursePlanner />}
                {activeTab === "pomodoro" && <PomodoroTimer />}
                {activeTab === "chat" && (
                  <AiChatbotView
                    prefilledQuestion={prefilledChatQuestion}
                    onClearQuestion={() => setPrefilledChatQuestion(null)}
                  />
                )}
                {activeTab === "notes" && <NotesSection />}
                {activeTab === "bugs" && (
                  <BugReporter
                     prefilledQuestionId={prefilledBugId}
                     prefilledQuestionText={prefilledBugText}
                     onClearPrefills={() => {
                       setPrefilledBugId(null);
                       setPrefilledBugText(null);
                     }}
                  />
                )}
                {activeTab === "profile" && <ProfileView onReplayWelcome={() => { setWelcomeScanned(false); setHasChosenYear(false); setSessionAuthenticated(false); }} />}
                {activeTab === "admin" && student.isAdmin && <AdminPanel />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Beautiful Humble Healthcare Footer */}
        <footer className="mt-auto py-8 text-center text-[10px] font-mono text-[#9A9489] dark:text-[#8C929D]/60 uppercase tracking-wider border-t border-[#E6E2D8]/40 dark:border-[#1B1E26]/40 bg-white/20 dark:bg-transparent backdrop-blur-sm relative z-10">
          <p>© 2026 medisona Academy • Built for Clinical Board Examination Mastery • Cloud Firestore Secure</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <CustomCursor />
      <MainAppLayout />
    </StudentProvider>
  );
}
