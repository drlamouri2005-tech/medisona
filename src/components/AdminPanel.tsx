import React, { useState, useRef } from "react";
import { useStudent } from "./StudentContext";
import { Question, AcademicYear, ALL_ACADEMIC_YEARS } from "../types";
import { 
  Lock, KeyRound, CheckCircle2, AlertTriangle, HelpCircle, 
  Upload, FileJson, Plus, Trash2, ListFilter, Play, Eye, Sparkles,
  Edit2, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AdminPanel: React.FC = () => {
  const { 
    uploadQuestion, 
    customQuestions, 
    deleteQuestion,
    knownCourses = [],
    addKnownCourse,
    deleteKnownCourse,
    adminEmails = [],
    addAdminEmail,
    removeAdminEmail
  } = useStudent();

  // Admin Management States
  const [adminInputEmail, setAdminInputEmail] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");
  const [adminSuccess, setAdminSuccess] = useState<string>("");
  const [isAddingAdmin, setIsAddingAdmin] = useState<boolean>(false);

  // Known Courses Catalog States
  const [courseInputYear, setCourseInputYear] = useState<AcademicYear>("Year 1");
  const [courseInputModule, setCourseInputModule] = useState<string>("");
  const [courseInputName, setCourseInputName] = useState<string>("");
  const [isAddingCourse, setIsAddingCourse] = useState<boolean>(false);
  const [courseError, setCourseError] = useState<string>("");
  const [courseSuccess, setCourseSuccess] = useState<string>("");
  const [passkey, setPasskey] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(
    localStorage.getItem("med_admin_authorized") === "true"
  );
  const [authError, setAuthError] = useState<string>("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "manage" | "ai" | "admins">("single");

  // AI Parser State with Overrides
  const [aiRawText, setAiRawText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [aiError, setAiError] = useState<string>("");
  const [aiSuccess, setAiSuccess] = useState<string>("");
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // AI Overrides state
  const [useAiOverrides, setUseAiOverrides] = useState<boolean>(false);
  const [aiOverrideAcademicYear, setAiOverrideAcademicYear] = useState<string>("");
  const [aiOverrideExamYear, setAiOverrideExamYear] = useState<string>("");
  const [aiOverrideSessionType, setAiOverrideSessionType] = useState<string>("");
  const [aiOverrideModule, setAiOverrideModule] = useState<string>("");
  const [aiOverrideCourse, setAiOverrideCourse] = useState<string>("");

  // Single Edit State (Manage Tab)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editAcademicYear, setEditAcademicYear] = useState<AcademicYear>("Year 1");
  const [editModule, setEditModule] = useState<string>("");
  const [editCourse, setEditCourse] = useState<string>("");
  const [editExamYear, setEditExamYear] = useState<string>("");
  const [editSessionType, setEditSessionType] = useState<"Normal" | "Rattrapage">("Normal");
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>("");
  const [editErrorMsg, setEditErrorMsg] = useState<string>("");

  // Bulk Edit State (Manage Tab)
  const [bulkEditEnabled, setBulkEditEnabled] = useState<boolean>(false);
  const [bulkEditAcademicYear, setBulkEditAcademicYear] = useState<string>("");
  const [bulkEditModule, setBulkEditModule] = useState<string>("");
  const [bulkEditCourse, setBulkEditCourse] = useState<string>("");
  const [bulkEditExamYear, setBulkEditExamYear] = useState<string>("");
  const [bulkEditSessionType, setBulkEditSessionType] = useState<string>("");
  const [bulkEditSuccess, setBulkEditSuccess] = useState<string>("");
  const [bulkEditError, setBulkEditError] = useState<string>("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Single Question Form State
  const [id, setId] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<AcademicYear>("Year 1");
  const [unit, setUnit] = useState<string>("");
  const [module, setModule] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [choices, setChoices] = useState<string[]>(["", "", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);
  const [explanation, setExplanation] = useState<string>("");
  const [examYear, setExamYear] = useState<string>(new Date().getFullYear().toString());
  const [sessionType, setSessionType] = useState<"Normal" | "Rattrapage">("Normal");

  // Status Feedback
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Bulk State
  const [jsonInput, setJsonInput] = useState<string>("");
  const [bulkError, setBulkError] = useState<string>("");
  const [bulkSuccess, setBulkSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authorize Admin
  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_KEY = ((import.meta as any).env.VITE_ADMIN_PASSKEY || "admin").trim().toLowerCase();
    if (passkey.trim().toLowerCase() === ADMIN_KEY) {
      setIsAuthorized(true);
      setAuthError("");
      localStorage.setItem("med_admin_authorized", "true");
    } else {
      setAuthError("Invalid admin access key. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem("med_admin_authorized");
  };

  // AI Text File Parser Handlers
  const handleAiTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const contents = evt.target?.result;
      if (typeof contents === "string") {
        setAiRawText(contents);
        setAiError("");
        setAiSuccess(`Loaded "${file.name}" successfully! Click "Autoclassify & Build QCMs" below to run AI parsing.`);
      }
    };
    reader.readAsText(file);
  };

  const handleAiParseText = async () => {
    if (!aiRawText.trim()) {
      setAiError("Please paste some text or upload a plain text file first.");
      return;
    }

    setIsParsing(true);
    setAiError("");
    setAiSuccess("");
    setParsedQuestions([]);

    const payload: any = { 
      textContent: aiRawText,
      knownCourses: knownCourses
    };
    if (useAiOverrides) {
      if (aiOverrideAcademicYear) payload.overrideAcademicYear = aiOverrideAcademicYear;
      if (aiOverrideExamYear) payload.overrideExamYear = aiOverrideExamYear;
      if (aiOverrideSessionType) payload.overrideSessionType = aiOverrideSessionType;
      if (aiOverrideModule) payload.overrideModule = aiOverrideModule;
      if (aiOverrideCourse) payload.overrideCourse = aiOverrideCourse;
    }

    try {
      const response = await fetch("/api/admin/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to parse text content with AI.");
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format received from AI.");
      }

      const processed = data.questions.map((q: any) => ({
        ...q,
        id: q.id || `q_ai_${Math.random().toString(36).substring(2, 11)}`
      }));

      setParsedQuestions(processed);
      setAiSuccess(`Successfully structured and classified ${processed.length} QCMs with AI! Please review the questions below before saving.`);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setIsParsing(false);
    }
  };

  const uploadParsedQuestions = async () => {
    if (parsedQuestions.length === 0) return;
    setIsParsing(true);
    setAiError("");
    setAiSuccess("");

    try {
      let successCount = 0;
      for (const q of parsedQuestions) {
        await uploadQuestion(q);
        successCount++;
      }
      setAiSuccess(`Successfully saved ${successCount} QCMs to Firestore database! All questions are now live.`);
      setParsedQuestions([]);
      setAiRawText("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to commit parsed questions to database.");
    } finally {
      setIsParsing(false);
    }
  };

  // Pre-generate a random question ID
  const generateRandomId = () => {
    const cleanMod = module.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const cleanCourse = course.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `q_custom_${cleanMod || "qcm"}_${cleanCourse || "course"}_${randomNum}`;
  };

  // Start editing a single custom question
  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditAcademicYear(q.academicYear);
    setEditModule(q.module);
    setEditCourse(q.course);
    setEditExamYear(q.examYear);
    setEditSessionType(q.sessionType);
    setEditSuccessMsg("");
    setEditErrorMsg("");
  };

  // Save changes to single question
  const handleSaveEdit = async (q: Question) => {
    setEditSuccessMsg("");
    setEditErrorMsg("");

    if (!editModule.trim() || !editCourse.trim()) {
      setEditErrorMsg("Course Type (Module) and Course/Topic are required.");
      return;
    }

    const updated: Question = {
      ...q,
      academicYear: editAcademicYear,
      module: editModule.trim(),
      course: editCourse.trim(),
      examYear: editExamYear.trim() || q.examYear,
      sessionType: editSessionType
    };

    try {
      await uploadQuestion(updated);
      setEditSuccessMsg("Question updated successfully in database!");
      setEditingQuestionId(null);
    } catch (err: any) {
      setEditErrorMsg(err.message || "Failed to save question changes.");
    }
  };

  // Toggle selection of question for bulk edit
  const handleToggleSelectQuestion = (qId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Select all or select none
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === customQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(customQuestions.map(q => q.id));
    }
  };

  // Apply bulk edits to selected questions
  const handleApplyBulkEdit = async () => {
    setBulkEditSuccess("");
    setBulkEditError("");

    if (selectedQuestionIds.length === 0) {
      setBulkEditError("Please select at least one question to bulk edit.");
      return;
    }

    const hasAnyChange = bulkEditAcademicYear || bulkEditModule.trim() || bulkEditCourse.trim() || bulkEditExamYear.trim() || bulkEditSessionType;
    if (!hasAnyChange) {
      setBulkEditError("Please fill in at least one field to bulk edit.");
      return;
    }

    setIsParsing(true);

    try {
      let updatedCount = 0;
      for (const qId of selectedQuestionIds) {
        const original = customQuestions.find(q => q.id === qId);
        if (!original) continue;

        const updated: Question = {
          ...original,
          academicYear: (bulkEditAcademicYear as AcademicYear) || original.academicYear,
          module: bulkEditModule.trim() || original.module,
          course: bulkEditCourse.trim() || original.course,
          examYear: bulkEditExamYear.trim() || original.examYear,
          sessionType: (bulkEditSessionType as "Normal" | "Rattrapage") || original.sessionType
        };

        await uploadQuestion(updated);
        updatedCount++;
      }

      setBulkEditSuccess(`Successfully updated ${updatedCount} questions in database!`);
      setSelectedQuestionIds([]);
      setBulkEditModule("");
      setBulkEditCourse("");
      setBulkEditExamYear("");
      setBulkEditSessionType("");
      setBulkEditAcademicYear("");
    } catch (err: any) {
      setBulkEditError(err.message || "Failed to apply bulk updates.");
    } finally {
      setIsParsing(false);
    }
  };

  // Handle single choice input update
  const handleChoiceChange = (idx: number, val: string) => {
    const updated = [...choices];
    updated[idx] = val;
    setChoices(updated);
  };

  // Submit manual QCM
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Validate
    if (!module.trim() || !course.trim() || !text.trim() || !explanation.trim() || !examYear.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (choices.some(choice => !choice.trim())) {
      setErrorMsg("All 5 choice options (A to E) must be fully specified.");
      return;
    }

    const finalId = id.trim() || generateRandomId();
    const finalCorrectAnswers = correctAnswers.length > 0 ? correctAnswers : [correctAnswer];
    const finalCorrectAnswer = finalCorrectAnswers[0];

    const newQuestion: Question = {
      id: finalId,
      academicYear,
      unit: unit.trim() || undefined,
      module: module.trim(),
      course: course.trim(),
      text: text.trim(),
      choices: choices.map(c => c.trim()),
      correctAnswer: finalCorrectAnswer,
      correctAnswers: finalCorrectAnswers,
      explanation: explanation.trim(),
      examYear: examYear.trim(),
      sessionType
    };

    try {
      await uploadQuestion(newQuestion);
      setSuccessMsg(`QCM Question loaded and active in curriculum! ID: ${finalId}`);
      
      // Reset form (except structural tags for faster repetitive entries)
      setId("");
      setText("");
      setChoices(["", "", "", "", ""]);
      setCorrectAnswer(0);
      setCorrectAnswers([0]);
      setExplanation("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load question onto Firestore.");
    }
  };

  // Bulk Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonInput(text);
        setBulkError("");
      } catch (err) {
        setBulkError("Could not read uploaded file.");
      }
    };
    reader.readAsText(file);
  };

  // Validate Bulk Input schema
  const validateAndUploadBulk = async () => {
    setBulkError("");
    setBulkSuccess("");

    if (!jsonInput.trim()) {
      setBulkError("Please paste JSON content or upload a file first.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const items: Question[] = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setBulkError("The JSON document contains an empty array.");
        return;
      }

      // Schema Check
      const validYears = ALL_ACADEMIC_YEARS;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const indexLabel = items.length > 1 ? `at index ${i}` : "";

        if (!item.module || typeof item.module !== "string") {
          throw new Error(`Invalid 'module' ${indexLabel}. Must be a valid string.`);
        }
        if (!item.course || typeof item.course !== "string") {
          throw new Error(`Invalid 'course' ${indexLabel}. Must be a valid string.`);
        }
        if (!item.text || typeof item.text !== "string") {
          throw new Error(`Invalid 'text' ${indexLabel}. Must be a valid string.`);
        }
        if (item.explanation === undefined || item.explanation === null || typeof item.explanation !== "string" || !item.explanation.trim()) {
          item.explanation = "No official explanation provided.";
        }
        if (!item.examYear) {
          throw new Error(`Invalid 'examYear' ${indexLabel}. Must be specified.`);
        }
        if (!validYears.includes(item.academicYear)) {
          throw new Error(`Invalid 'academicYear' ${indexLabel}. Must be one of: ${validYears.join(", ")}`);
        }
        if (!Array.isArray(item.choices) || item.choices.length !== 5) {
          throw new Error(`Invalid 'choices' array ${indexLabel}. Must contain exactly 5 answers.`);
        }
        const hasCorrectAnswers = Array.isArray(item.correctAnswers) && item.correctAnswers.length > 0;
        if (hasCorrectAnswers) {
          for (const ans of item.correctAnswers) {
            if (typeof ans !== "number" || ans < 0 || ans > 4) {
              throw new Error(`Invalid 'correctAnswers' element ${indexLabel}. Elements must be integers between 0 and 4 (representing choices A to E).`);
            }
          }
        } else {
          if (typeof item.correctAnswer !== "number" || item.correctAnswer < 0 || item.correctAnswer > 4) {
            throw new Error(`Invalid 'correctAnswer' index ${indexLabel}. Must be an integer between 0 and 4 (representing choices A to E) when 'correctAnswers' is not specified.`);
          }
        }
        if (item.sessionType !== "Normal" && item.sessionType !== "Rattrapage") {
          throw new Error(`Invalid 'sessionType' ${indexLabel}. Must be either 'Normal' or 'Rattrapage'.`);
        }
      }

      // Schema is valid. Trigger upload sequence
      let uploadedCount = 0;
      for (const item of items) {
        const finalId = item.id || `q_bulk_${item.module.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Math.floor(1000 + Math.random() * 9000)}`;
        const finalCorrectAnswers = Array.isArray(item.correctAnswers) && item.correctAnswers.length > 0
          ? item.correctAnswers
          : [item.correctAnswer];
        const finalCorrectAnswer = finalCorrectAnswers[0];

        const cleanedQuestion: Question = {
          ...item,
          id: finalId,
          correctAnswer: finalCorrectAnswer,
          correctAnswers: finalCorrectAnswers,
          unit: item.unit?.trim() || undefined
        };
        await uploadQuestion(cleanedQuestion);
        uploadedCount++;
      }

      setBulkSuccess(`Successfully validated and synchronized ${uploadedCount} custom QCM questions to Firestore!`);
      setJsonInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setBulkError(err instanceof Error ? err.message : "JSON syntax violation or structural invalidity.");
    }
  };

  const sampleTemplate = `[
  {
    "academicYear": "Year 3",
    "unit": "Systemic Pathology",
    "module": "Cardiology",
    "course": "Heart Failure",
    "text": "A 64-year-old male presents with severe progressive dyspnea and bilateral ankle swelling...",
    "choices": [
      "Furosemide",
      "Lisinopril",
      "Metoprolol succinate",
      "Spironolactone",
      "Digoxin"
    ],
    "correctAnswer": 0,
    "explanation": "Loop diuretics (Furosemide) represent the first-line treatment to resolve acute hypervolemia symptoms...",
    "examYear": "2024",
    "sessionType": "Normal"
  }
]`;

  if (!isAuthorized) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 max-w-md mx-auto shadow-sm space-y-6" id="admin-auth-panel">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-extrabold text-slate-950 text-lg sm:text-xl">Academy Admin Area</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the clinical administrator passkey to design, upload, and update QCM curricula.
          </p>
        </div>

        <form onSubmit={handleAuthorize} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter admin passkey..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-slate-50 text-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-indigo-500 font-mono text-center">
              💡 Bypassed testing key is <span className="underline font-bold">admin</span>
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-xs text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold shadow-md transition"
          >
            Authorize Session
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6" id="admin-main-panel">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="font-sans font-extrabold text-slate-950 text-lg">Curriculum Director Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500">Design active curriculum paths and live QCM banks in clinical databases.</p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-mono uppercase tracking-wider transition"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 pb-px gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("single");
            setSuccessMsg("");
            setErrorMsg("");
          }}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
            activeTab === "single"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual QCM Creator</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("bulk");
            setBulkError("");
            setBulkSuccess("");
          }}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
            activeTab === "bulk"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Bulk JSON Uploader</span>
        </button>

        <button
          onClick={() => setActiveTab("manage")}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
            activeTab === "manage"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Manage Uploaded QCMs ({customQuestions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("ai");
            setAiError("");
            setAiSuccess("");
          }}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
            activeTab === "ai"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>AI Autoclassifier Parser</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("admins");
            setAdminError("");
            setAdminSuccess("");
          }}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
            activeTab === "admins"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Manage Admins</span>
        </button>
      </div>

      {/* Panel Inner Content */}
      <AnimatePresence mode="wait">
        {activeTab === "single" && (
          <motion.form
            key="single-creator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateQuestion}
            className="space-y-6"
          >
            {/* General Feedback */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Categorization Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {ALL_ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Unit (Optional)</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., Pathology"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Module *</label>
                <input
                  type="text"
                  required
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  placeholder="e.g., Cardiology"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course / Topic *</label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., Valvular disease"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Exam Year *</label>
                <input
                  type="text"
                  required
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  placeholder="e.g., 2024"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Session Type *</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as "Normal" | "Rattrapage")}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="Rattrapage">Rattrapage</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Clinical Vignette / Question Body *</label>
                <span className="text-[10px] text-slate-400 font-mono">Supports markdown</span>
              </div>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="A 52-year-old male presents with acute onset chest pain..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/20 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Choices Options */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Choice Options (Exactly 5 Options) *</label>
              
              <div className="space-y-2">
                {choices.map((choice, idx) => {
                  const label = String.fromCharCode(65 + idx); // A, B, C, D, E
                  return (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-slate-100 text-slate-600 rounded-md flex items-center justify-center font-bold text-xs shrink-0">{label}</span>
                      <input
                        type="text"
                        required
                        value={choice}
                        onChange={(e) => handleChoiceChange(idx, e.target.value)}
                        placeholder={`Option ${label}`}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Correct Choice Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Correct Answer Choices (Select all that apply for QCM)*
                </label>
                <div className="flex flex-wrap gap-2">
                  {["A", "B", "C", "D", "E"].map((label, idx) => {
                    const isSelected = correctAnswers.includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            if (correctAnswers.length > 1) {
                              setCorrectAnswers(correctAnswers.filter((c) => c !== idx));
                            }
                          } else {
                            setCorrectAnswers([...correctAnswers, idx].sort());
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-100"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Option {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Custom Document ID (Optional)</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Will auto-generate if blank"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Explanation & Clinical Pathology Rationale *</label>
              <textarea
                required
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Loop diuretics inhibit the Na-K-2Cl cotransporter in the thick ascending limb of Henle..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/20 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Action button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold shadow-md shadow-indigo-100 transition"
            >
              Publish QCM to Firestore
            </button>
          </motion.form>
        )}

        {activeTab === "bulk" && (
          <motion.div
            key="bulk-uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Bulk Feedback */}
            {bulkSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{bulkSuccess}</span>
              </div>
            )}
            {bulkError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-semibold leading-none">Validation Error</p>
                  <p className="mt-1 font-mono text-[11px] bg-red-100/50 p-2 rounded border border-red-200/50">{bulkError}</p>
                </div>
              </div>
            )}

            {/* Drag & Drop File Loader */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">1. Drag / Upload QCM JSON File</h4>
                  <p className="text-[11px] text-slate-400">Import structured arrays directly to database.</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/30 hover:bg-slate-50/80 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 select-none"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-600">Click to upload JSON file</span>
                    <p className="text-[10px] text-slate-400 mt-1">Accepts valid single object or array of objects</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">2. Or Paste Raw JSON Text String</label>
                    <button
                      onClick={() => setJsonInput("")}
                      className="text-[10px] text-red-500 hover:underline font-mono"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={`Paste JSON here...\nE.g.: ${sampleTemplate.slice(0, 100)}...`}
                    className="w-full p-3 border border-slate-200 rounded-xl text-[11px] font-mono bg-slate-900 text-slate-200 leading-normal"
                  />
                </div>
              </div>

              {/* JSON Template Guide */}
              <div className="space-y-4">
                <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Schema Blueprint Validation</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Your JSON file or string must follow this exact structure. Note that <code className="font-mono bg-slate-200 px-1 rounded">correctAnswer</code> is a 0-based index (<code className="font-mono text-slate-600">0=A, 1=B, 2=C, 3=D, 4=E</code>).
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 select-none">Schema Guide</div>
                  <pre className="p-4 bg-slate-950 text-emerald-400 border border-slate-900 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto max-h-[360px]">
                    {sampleTemplate}
                  </pre>
                </div>
              </div>
            </div>

            {/* Validation Action */}
            <button
              onClick={validateAndUploadBulk}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono uppercase tracking-widest font-semibold shadow-md transition"
            >
              Verify Blueprint & Upload to Firestore
            </button>
          </motion.div>
        )}

        {activeTab === "manage" && (
          <motion.div
            key="manage-custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>{editSuccessMsg}</span>
                <button onClick={() => setEditSuccessMsg("")} className="text-emerald-500 font-bold hover:underline">Dismiss</button>
              </div>
            )}
            {editErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center justify-between">
                <span>{editErrorMsg}</span>
                <button onClick={() => setEditErrorMsg("")} className="text-red-500 font-bold hover:underline">Dismiss</button>
              </div>
            )}
            {bulkEditSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>{bulkEditSuccess}</span>
                <button onClick={() => setBulkEditSuccess("")} className="text-emerald-500 font-bold hover:underline">Dismiss</button>
              </div>
            )}
            {bulkEditError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center justify-between">
                <span>{bulkEditError}</span>
                <button onClick={() => setBulkEditError("")} className="text-red-500 font-bold hover:underline">Dismiss</button>
              </div>
            )}

            {customQuestions.length === 0 ? (
              <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-100 rounded-2xl">
                <FileJson className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-sans font-bold text-slate-700 text-sm">No Custom QCMs Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You haven't uploaded any custom questions to Firestore yet. Use the Manual Creator, Bulk Uploader, or AI Autoclassifier tabs above to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-indigo-900 block">Total Custom Questions Synced:</span>
                    <span className="text-[11px] text-slate-500 block">Manage individual records or utilize bulk re-classification actions.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-full font-mono">{customQuestions.length}</span>
                    <button
                      onClick={() => {
                        setBulkEditEnabled(!bulkEditEnabled);
                        setSelectedQuestionIds([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                        bulkEditEnabled 
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200" 
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {bulkEditEnabled ? "Disable Bulk Edit" : "Bulk Edit Course Types"}
                    </button>
                  </div>
                </div>

                {/* Bulk Edit Panel */}
                {bulkEditEnabled && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>🛠️ Bulk Edit Toolboard</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {selectedQuestionIds.length} Selected
                        </span>
                      </span>
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-[10px] text-indigo-600 hover:underline font-mono"
                      >
                        {selectedQuestionIds.length === customQuestions.length ? "Deselect All" : "Select All Custom Questions"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Academic Year</label>
                        <select
                          value={bulkEditAcademicYear}
                          onChange={(e) => setBulkEditAcademicYear(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Keep Original</option>
                          {ALL_ACADEMIC_YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course Type (Module)</label>
                        <input
                          type="text"
                          value={bulkEditModule}
                          onChange={(e) => setBulkEditModule(e.target.value)}
                          placeholder="Keep Original"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course/Topic</label>
                        <input
                          type="text"
                          value={bulkEditCourse}
                          onChange={(e) => setBulkEditCourse(e.target.value)}
                          placeholder="Keep Original"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Exam Year</label>
                        <input
                          type="text"
                          value={bulkEditExamYear}
                          onChange={(e) => setBulkEditExamYear(e.target.value)}
                          placeholder="Keep Original"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Session Type</label>
                        <select
                          value={bulkEditSessionType}
                          onChange={(e) => setBulkEditSessionType(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Keep Original</option>
                          <option value="Normal">Normal</option>
                          <option value="Rattrapage">Rattrapage</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleApplyBulkEdit}
                        disabled={selectedQuestionIds.length === 0}
                        className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest font-semibold shadow transition flex items-center gap-1.5 ${
                          selectedQuestionIds.length === 0 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Apply edits to {selectedQuestionIds.length} QCMs
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Custom QCMs */}
                <div className="divide-y divide-slate-150 border border-slate-200 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto bg-white shadow-sm">
                  {customQuestions.map((q, index) => {
                    const isEditing = editingQuestionId === q.id;
                    const isSelected = selectedQuestionIds.includes(q.id);

                    return (
                      <div 
                        key={q.id} 
                        className={`p-4 transition flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
                          isSelected ? "bg-indigo-50/30" : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Left checkbox for bulk action */}
                        {bulkEditEnabled && !isEditing && (
                          <div className="flex items-center pr-1 shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectQuestion(q.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Middle QCM Info / Edit Form */}
                        {isEditing ? (
                          <div className="flex-1 space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Academic Year</label>
                                <select
                                  value={editAcademicYear}
                                  onChange={(e) => setEditAcademicYear(e.target.value as AcademicYear)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                >
                                  {ALL_ACADEMIC_YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course Type (Module)</label>
                                <input
                                  type="text"
                                  value={editModule}
                                  onChange={(e) => setEditModule(e.target.value)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course / Topic</label>
                                <input
                                  type="text"
                                  value={editCourse}
                                  onChange={(e) => setEditCourse(e.target.value)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Exam Year</label>
                                <input
                                  type="text"
                                  value={editExamYear}
                                  onChange={(e) => setEditExamYear(e.target.value)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Session Type</label>
                                <select
                                  value={editSessionType}
                                  onChange={(e) => setEditSessionType(e.target.value as "Normal" | "Rattrapage")}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                >
                                  <option value="Normal">Normal</option>
                                  <option value="Rattrapage">Rattrapage</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-mono"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(q)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-mono flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{q.academicYear}</span>
                              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{q.module}</span>
                              <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={q.course}>{q.course}</span>
                              <span className="text-[10px] font-mono text-slate-400">Exam: {q.examYear} ({q.sessionType})</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">{q.text}</p>
                            <p className="text-[10px] text-emerald-600 font-mono">
                              ✓ Correct Choice(s): {
                                q.correctAnswers && q.correctAnswers.length > 0
                                  ? q.correctAnswers.map((idx: number) => `Option ${String.fromCharCode(65 + idx)}`).join(", ")
                                  : `Option ${String.fromCharCode(65 + (q.correctAnswer ?? 0))}`
                              }
                            </p>
                          </div>
                        )}

                        {/* Right side individual action buttons */}
                        {!isEditing && (
                          <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center pt-2 md:pt-0">
                            <button
                              onClick={() => handleStartEdit(q)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Course Type / Metadata"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to permanently delete this custom QCM question from Firestore?")) {
                                  await deleteQuestion(q.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai-parser"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {aiSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                <span>{aiSuccess}</span>
              </div>
            )}
            {aiError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-xs text-red-800">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Raw Input Upload and Paste */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">1. Raw Document Text Source</h4>
                  <p className="text-[11px] text-slate-400">Upload a past exam paper, clinical worksheet, or text file.</p>
                </div>

                <div 
                  onClick={() => aiFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/30 hover:bg-slate-50/80 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 select-none"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-600">Click to upload raw .txt file</span>
                    <p className="text-[10px] text-slate-400 mt-1">Reads and extracts text from any file size</p>
                  </div>
                  <input
                    ref={aiFileInputRef}
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleAiTextFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">2. Or Paste Unstructured QCM Text String</label>
                    <button
                      onClick={() => setAiRawText("")}
                      className="text-[10px] text-red-500 hover:underline font-mono"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder={`Paste unstructured QCMs text here...\n\nExample:\nQ1: What is the first line treatment for acute asthma exacerbation?\nA) Oral corticosteroids\nB) Inhaled SABA\nC) IV Magnesium Sulfate\nD) Oral antibiotics\nE) Inhaled ipratropium\nAnswer: B`}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-sans bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                {/* Optional Target Metadata Overrides */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAiOverrides}
                      onChange={(e) => setUseAiOverrides(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>🎯 Enforce Target Year & Session Overrides</span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Check this if you want to explicitly override the Academic Year, Exam Year, Session Type, Course Type (Module) or Course/Topic Name for ALL parsed questions in this document.
                  </p>

                  {useAiOverrides && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in border-t border-slate-200">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Academic Year</label>
                        <select
                          value={aiOverrideAcademicYear}
                          onChange={(e) => setAiOverrideAcademicYear(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Auto-Detect</option>
                          {ALL_ACADEMIC_YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Exam Year</label>
                        <input
                          type="text"
                          value={aiOverrideExamYear}
                          onChange={(e) => setAiOverrideExamYear(e.target.value)}
                          placeholder="e.g. 2026"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Session Type</label>
                        <select
                          value={aiOverrideSessionType}
                          onChange={(e) => setAiOverrideSessionType(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Auto-Detect</option>
                          <option value="Normal">Normal</option>
                          <option value="Rattrapage">Rattrapage</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Course Type (Module)</label>
                        <input
                          type="text"
                          value={aiOverrideModule}
                          onChange={(e) => setAiOverrideModule(e.target.value)}
                          placeholder="e.g. Microbiology"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Specific Course / Topic Name</label>
                        <input
                          type="text"
                          value={aiOverrideCourse}
                          onChange={(e) => setAiOverrideCourse(e.target.value)}
                          placeholder="e.g. Syphilis"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAiParseText}
                  disabled={isParsing || !aiRawText.trim()}
                  className={`w-full py-3 rounded-xl text-xs font-mono uppercase tracking-widest font-semibold shadow-md transition flex items-center justify-center gap-2 ${
                    isParsing || !aiRawText.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isParsing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      Analyzing & Categorizing Medical QCMs...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Autoclassify & Build QCMs
                    </>
                  )}
                </button>
              </div>

              {/* Instructions and Guidelines */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini AI Autoclassifier Engine</span>
                  </h4>
                  <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                    <p>
                      This intelligence layer reads unstructured clinical notes or questions and maps them dynamically to our official 6-year medical curriculum:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
                      <li><strong className="text-slate-700">Years 1 & 2:</strong> Basic sciences (Anatomy, Histology, Physiology, Biochem)</li>
                      <li><strong className="text-slate-700">Year 3:</strong> General Pathology, Semiology, Pharmacology, Microbiology</li>
                      <li><strong className="text-slate-700">Years 4 & 5:</strong> Specialized Organ Systems (Cardiology, Neurology, Pediatrics)</li>
                      <li><strong className="text-slate-700">Year 6:</strong> Therapeutics, Emergencies, Forensic, Clinical Surgery</li>
                    </ul>
                    <p>
                      The model also automatically computes the correct answer if not provided, designs high-yield diagnostic explanations, and assigns cohesive Module and Course descriptors.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-2">
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Pro-Tips for Perfect Extraction:</h5>
                  <ul className="list-decimal pl-4 text-[11px] text-slate-500 space-y-1 leading-relaxed">
                    <li>Include headers or text references like "2023 exam" or "Rattrapage" if you want precise year classification.</li>
                    <li>If the correct option is known, indicate it clearly (e.g. "Answer: B" or prefix the correct choice with an asterisk "*").</li>
                    <li>You can upload long documents — our server-side API handles extensive payloads.</li>
                  </ul>
                </div>

                {/* Custom Curriculum Courses list (Dynamic Guidance) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ListFilter className="w-4 h-4 text-indigo-500" />
                      <span>🎓 Known Course Names List (Auto-Detection)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Add official course and module names below. When you parse raw text, the AI will use this list to perfectly map questions to your specific academic modules.
                    </p>
                  </div>

                  {/* Add Course Form */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Add Course Reference
                    </span>

                    {courseError && (
                      <span className="text-[10px] text-red-500 block">{courseError}</span>
                    )}
                    {courseSuccess && (
                      <span className="text-[10px] text-emerald-600 block">{courseSuccess}</span>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">Academic Year</label>
                        <select
                          value={courseInputYear}
                          onChange={(e) => setCourseInputYear(e.target.value as AcademicYear)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          {ALL_ACADEMIC_YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">Module Name</label>
                        <input
                          type="text"
                          value={courseInputModule}
                          onChange={(e) => setCourseInputModule(e.target.value)}
                          placeholder="e.g. Cardiology, Pulmonology"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">Course / Topic Name</label>
                        <input
                          type="text"
                          value={courseInputName}
                          onChange={(e) => setCourseInputName(e.target.value)}
                          placeholder="e.g. Heart Failure, Asthma"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setCourseError("");
                        setCourseSuccess("");
                        if (!courseInputModule.trim() || !courseInputName.trim()) {
                          setCourseError("Please fill out both Module Name and Course Name.");
                          return;
                        }
                        setIsAddingCourse(true);
                        try {
                          const id = `course_${Date.now()}`;
                          await addKnownCourse({
                            id,
                            academicYear: courseInputYear,
                            module: courseInputModule.trim(),
                            course: courseInputName.trim(),
                            addedAt: new Date().toISOString()
                          });
                          setCourseSuccess(`Successfully registered "${courseInputName.trim()}"!`);
                          setCourseInputName("");
                        } catch (err: any) {
                          setCourseError(err.message || "Failed to save course.");
                        } finally {
                          setIsAddingCourse(false);
                        }
                      }}
                      disabled={isAddingCourse}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Course to AI Guidance List
                    </button>
                  </div>

                  {/* Course List Catalog */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Registered Curriculum ({knownCourses.length})
                      </span>
                    </div>

                    {knownCourses.length === 0 ? (
                      <div className="text-center p-4 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <p className="text-[10px] text-slate-400">
                          No custom course references added yet.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                        {knownCourses.map((c) => (
                          <div key={c.id} className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-[11px] group">
                            <div className="space-y-0.5 max-w-[85%]">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1 text-[8px] font-mono bg-indigo-50 text-indigo-700 font-bold rounded uppercase">
                                  {c.academicYear}
                                </span>
                                <span className="font-semibold text-slate-700 truncate block">
                                  {c.course}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Module: {c.module}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to remove "${c.course}"?`)) {
                                  try {
                                    await deleteKnownCourse(c.id);
                                  } catch (err) {
                                    console.error("Failed to delete known course:", err);
                                  }
                                }
                              }}
                              className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 transition duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Course Reference"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Parsed Preview Section */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-indigo-900 block">AI Classified QCM Results:</span>
                    <span className="text-[11px] text-slate-500 block">Review and edit before saving directly to database.</span>
                  </div>
                  <button
                    onClick={uploadParsedQuestions}
                    disabled={isParsing}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Commit {parsedQuestions.length} QCMs to Firestore
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {parsedQuestions.map((q, qIdx) => (
                    <div key={q.id} className="bg-white border border-slate-150 rounded-xl p-5 space-y-3 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{q.academicYear}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">{q.module}</span>
                          <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold">{q.course}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Exam: {q.examYear} ({q.sessionType})</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Question {qIdx + 1}</span>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.text}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pl-2">
                        {q.choices.map((choice, cIdx) => {
                          const isCorrect = q.correctAnswers && q.correctAnswers.length > 0 
                            ? q.correctAnswers.includes(cIdx) 
                            : cIdx === q.correctAnswer;
                          return (
                            <div 
                              key={cIdx} 
                              className={`p-2 rounded-lg text-xs flex items-center gap-2 border transition ${
                                isCorrect 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-medium" 
                                  : "bg-slate-50/50 border-slate-100 text-slate-600"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                isCorrect 
                                  ? "bg-emerald-505 bg-emerald-500 text-white" 
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {String.fromCharCode(65 + cIdx)}
                              </span>
                              <span>{choice}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Clinical Explanation Rationale</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">"{q.explanation}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={uploadParsedQuestions}
                    disabled={isParsing}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono uppercase tracking-widest font-semibold shadow-md transition flex-row items-center justify-center gap-2 flex"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Commit {parsedQuestions.length} QCMs to Firestore
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "admins" && (
          <motion.div
            key="manage-admins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            {adminSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                <span>{adminSuccess}</span>
              </div>
            )}
            {adminError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-xs text-red-800 animate-fade-in">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600" />
                <span>{adminError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Admin Form */}
              <div className="bg-[#FAF9F6]/50 dark:bg-[#171A22]/20 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#7D8C61] dark:text-[#8CA365]" />
                    <span>Authorize New Admin User</span>
                  </h4>
                  <p className="text-[10px] text-[#7A756D] dark:text-[#8C929D] font-sans">
                    Enter the email address of the user you wish to grant administrative privileges to.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-[#7A756D] dark:text-[#8C929D] uppercase font-bold">User Email Address</label>
                    <input
                      type="email"
                      value={adminInputEmail}
                      onChange={(e) => setAdminInputEmail(e.target.value)}
                      placeholder="e.g. student@example.com"
                      className="w-full p-2.5 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl text-xs bg-white dark:bg-[#0D0E12] text-[#423F3A] dark:text-[#FAF9F6] focus:ring-1 focus:ring-[#7D8C61] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setAdminError("");
                      setAdminSuccess("");
                      if (!adminInputEmail.trim() || !adminInputEmail.includes("@")) {
                        setAdminError("Please enter a valid email address.");
                        return;
                      }
                      setIsAddingAdmin(true);
                      try {
                        await addAdminEmail(adminInputEmail.trim());
                        setAdminSuccess(`Successfully granted admin privileges to "${adminInputEmail.trim()}"!`);
                        setAdminInputEmail("");
                      } catch (err: any) {
                        setAdminError(err.message || "Failed to grant admin privileges.");
                      } finally {
                        setIsAddingAdmin(false);
                      }
                    }}
                    disabled={isAddingAdmin}
                    className="w-full py-2.5 bg-[#7D8C61] hover:bg-[#8A9A5B] text-white rounded-xl text-[10px] font-bold uppercase font-mono tracking-wider transition flex items-center justify-center gap-1.5"
                  >
                    {isAddingAdmin ? (
                      <span className="flex items-center gap-1.5">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-slate-400 border-t-white rounded-full" />
                        Authorizing...
                      </span>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Grant Admin Privileges
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Authorized Admins List */}
              <div className="bg-[#FAF9F6]/50 dark:bg-[#171A22]/20 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#7D8C61] dark:text-[#8CA365]" />
                    <span>Authorized Admins list</span>
                  </h4>
                  <p className="text-[10px] text-[#7A756D] dark:text-[#8C929D] font-sans">
                    These accounts have full read/write access to curriculum editing, parser engines, and system-wide databases.
                  </p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl divide-y divide-[#E6E2D8]/50 dark:divide-[#1B1E26]/50">
                  {/* Hardcoded Bootstrapped Admins */}
                  <div className="p-3 bg-white/40 dark:bg-[#0D0E12]/40 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#423F3A] dark:text-[#FAF9F6] block">aniswalid511@gmail.com</span>
                      <span className="text-[9px] text-[#7D8C61] dark:text-[#8CA365] font-mono font-bold uppercase bg-[#7D8C61]/10 px-1.5 py-0.5 rounded">System Creator</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/40 dark:bg-[#0D0E12]/40 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#423F3A] dark:text-[#FAF9F6] block">anislekehel4@gmail.com</span>
                      <span className="text-[9px] text-[#7D8C61] dark:text-[#8CA365] font-mono font-bold uppercase bg-[#7D8C61]/10 px-1.5 py-0.5 rounded">System Creator</span>
                    </div>
                  </div>

                  {/* Dynamically added admins */}
                  {adminEmails.filter(e => e !== "aniswalid511@gmail.com" && e !== "anislekehel4@gmail.com").map((email) => (
                    <div key={email} className="p-3 hover:bg-white/40 dark:hover:bg-[#0D0E12]/40 flex items-center justify-between text-[11px] group">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#423F3A] dark:text-[#FAF9F6] block">{email}</span>
                        <span className="text-[9px] text-[#7D8C61] dark:text-[#8CA365] font-mono font-bold uppercase bg-[#7D8C61]/10 px-1.5 py-0.5 rounded">App Admin</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to revoke admin privileges for "${email}"?`)) {
                            try {
                              await removeAdminEmail(email);
                            } catch (err) {
                              console.error("Failed to revoke admin privileges:", err);
                            }
                          }
                        }}
                        className="text-[#9A9489] hover:text-red-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1B1E26] transition duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Revoke Privileges"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
