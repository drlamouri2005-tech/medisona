import React, { useState, useEffect } from "react";
import { useStudent } from "./StudentContext";
import { Question } from "../types";
import { doesQuestionMatchCourse } from "../lib/courseMatcher";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, AlertTriangle, RefreshCw, MessageSquare, Sparkles, Cpu, Loader2, Bookmark } from "lucide-react";
import { ScrollReveal, Magnetic } from "./EliteInteractions";
import ReactMarkdown from "react-markdown";

interface QcmEngineProps {
  sessionConfig: {
    mode: "normal" | "exam";
    courses?: string[];
    examYear?: string;
    initialIndex?: number;
    filterType?: "incorrect" | "flagged" | "favorites";
    limit?: number;
  };
  onClose: (lastIndex?: number) => void;
  onNavigateToBugs: (qId: string, qText: string) => void;
  onNavigateToChat: (q: Question) => void;
}

export const QcmEngine: React.FC<QcmEngineProps> = ({
  sessionConfig,
  onClose,
  onNavigateToBugs,
  onNavigateToChat
}) => {
  const { student, progress, submitAnswer, allQuestions, resetSessionProgress } = useStudent();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Track selected choices for the current question
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  // Track whether "Show Answer" has been clicked for the current question
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  // Track which question IDs are currently being retried in this session
  const [retriedQuestions, setRetriedQuestions] = useState<Record<string, boolean>>({});

  // SocratesMD AI Explanation states
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  // Trigger state to reactive-render flagged updates
  const [flaggedTrigger, setFlaggedTrigger] = useState<boolean>(false);

  // Clear states when question changes
  useEffect(() => {
    setLoadingExplanation(false);
    setExplanationError(null);
  }, [currentIndex]);

  const handleGenerateAiExplanation = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || aiExplanations[currentQ.id]) return;
    setLoadingExplanation(true);
    setExplanationError(null);
    try {
      const response = await fetch("/api/explain-qcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: currentQ.text,
          choices: currentQ.choices,
          correctAnswers: currentQ.correctAnswers || (currentQ.correctAnswer !== undefined ? [currentQ.correctAnswer] : []),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate proof. Server returned status " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiExplanations(prev => ({
        ...prev,
        [currentQ.id]: data.explanation
      }));
    } catch (err: any) {
      console.error(err);
      setExplanationError(err.message || "An unexpected error occurred while communicating with the AI.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Auto-generate AI clinical proof and distractors refutations as soon as revealed
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (isRevealed && currentQ && !aiExplanations[currentQ.id] && !loadingExplanation && !explanationError) {
      handleGenerateAiExplanation();
    }
  }, [isRevealed, currentIndex, questions, aiExplanations, loadingExplanation, explanationError]);

  // Custom markdown renderers for exquisite responsive medical board design
  const markdownRenderers = {
    h1: ({ children }: any) => <h1 className="text-sm font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] mt-4 mb-2 uppercase tracking-wide border-b border-[#E6E2D8] dark:border-[#1B1E26] pb-1">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xs sm:text-sm font-serif font-bold text-[#423F3A] dark:text-[#FAF9F6] mt-3.5 mb-1.5">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xs font-sans font-bold text-[#423F3A] dark:text-[#FAF9F6] mt-2 mb-1">{children}</h3>,
    p: ({ children }: any) => <p className="text-xs sm:text-sm text-[#5C5852] dark:text-[#8C929D] leading-relaxed mb-2.5">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-3 text-xs sm:text-sm text-[#5C5852] dark:text-[#8C929D] space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-3 text-xs sm:text-sm text-[#5C5852] dark:text-[#8C929D] space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-xs sm:text-sm leading-relaxed">{children}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-[#423F3A] dark:text-[#FAF9F6]">{children}</strong>,
    code: ({ children }: any) => <code className="px-1.5 py-0.5 bg-[#FAF9F6] dark:bg-[#171A22] border border-[#E6E2D8] dark:border-[#1B1E26] text-[#C58B74] font-mono text-[11px] rounded">{children}</code>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-[#7D8C61] dark:border-[#8CA365] pl-4 italic my-3 text-xs sm:text-sm text-[#7A756D] dark:text-[#8C929D]/80">{children}</blockquote>
  };

  // Keep track of the session's unique identifier to prevent resetting the user's progress
  // when the database updates (such as answering a question and updating streak/progress).
  const sessionKey = JSON.stringify({
    mode: sessionConfig.mode,
    courses: sessionConfig.courses,
    examYear: sessionConfig.examYear,
    academicYear: student?.academicYear
  });
  const lastSessionKeyRef = React.useRef<string>("");

  // Compile session questions based on configuration
  useEffect(() => {
    if (!student) return;

    // First filter to only display questions assigned strictly to their academic year
    let compiled = student.academicYear === "Residanat"
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

    if (sessionConfig.mode === "exam" && sessionConfig.examYear) {
      // Compile ALL questions tagged with that specific year across ALL modules
      compiled = compiled.filter((q) => q.examYear === sessionConfig.examYear);
    } else if (sessionConfig.mode === "normal" && sessionConfig.courses && sessionConfig.courses.length > 0) {
      // Filter by custom selected courses using advanced keyword matching
      compiled = compiled.filter((q) => {
        return sessionConfig.courses!.some((selectedCourse) =>
          doesQuestionMatchCourse(q.course, selectedCourse)
        );
      });
    }

    // Support custom filters
    if (sessionConfig.filterType === "incorrect") {
      compiled = compiled.filter((q) => {
        const ans = progress?.answers[q.id];
        return ans !== undefined && !ans.correct;
      });
    } else if (sessionConfig.filterType === "flagged" || sessionConfig.filterType === "favorites") {
      const flaggedStr = localStorage.getItem(`med_flagged_qs_${student.id}`) || "[]";
      try {
        const flaggedIds = JSON.parse(flaggedStr) as string[];
        compiled = compiled.filter((q) => flaggedIds.includes(q.id));
      } catch (e) {
        console.error("Failed to parse flagged QCMs", e);
      }
    }

    if (sessionConfig.limit && sessionConfig.limit > 0) {
      compiled = compiled.slice(0, sessionConfig.limit);
    }

    setQuestions(compiled);

    // Only reset state if this is actually a new session, preventing forced return to question 1
    if (lastSessionKeyRef.current !== sessionKey) {
      lastSessionKeyRef.current = sessionKey;
      
      const sortedCourses = sessionConfig.courses ? [...sessionConfig.courses].sort().join(",") : "";
      const sessionIndexKey = `med_session_idx_${student.id}_${sessionConfig.mode}_${sessionConfig.examYear || ""}_${sortedCourses}`;
      const savedIndexStr = localStorage.getItem(sessionIndexKey);
      let savedIndex = savedIndexStr ? parseInt(savedIndexStr, 10) : 0;
      if (isNaN(savedIndex) || savedIndex < 0 || savedIndex >= compiled.length) {
        savedIndex = 0;
      }

      const startIdx = sessionConfig.initialIndex !== undefined ? sessionConfig.initialIndex : savedIndex;
      const safeIdx = startIdx < compiled.length ? startIdx : 0;
      setCurrentIndex(safeIdx);
      setSelectedChoices([]);
      setIsRevealed(false);
      setRetriedQuestions({});
    }
  }, [sessionKey, student?.academicYear, allQuestions, flaggedTrigger, progress]);

  // Save active session progress to localStorage on change
  useEffect(() => {
    if (questions.length > 0 && student) {
      const activeSessionData = {
        mode: sessionConfig.mode,
        courses: sessionConfig.courses,
        examYear: sessionConfig.examYear,
        initialIndex: currentIndex,
      };
      localStorage.setItem("med_active_session", JSON.stringify(activeSessionData));

      // Save index per specific session
      const sortedCourses = sessionConfig.courses ? [...sessionConfig.courses].sort().join(",") : "";
      const sessionIndexKey = `med_session_idx_${student.id}_${sessionConfig.mode}_${sessionConfig.examYear || ""}_${sortedCourses}`;
      localStorage.setItem(sessionIndexKey, currentIndex.toString());
    }
  }, [currentIndex, questions, sessionConfig, student]);

  // Sync state when current index changes
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];

    if (retriedQuestions[currentQ.id]) {
      setSelectedChoices([]);
      setIsRevealed(false);
      return;
    }

    const pastAnswer = progress?.answers[currentQ.id];

    if (pastAnswer) {
      if (pastAnswer.selectedChoices && pastAnswer.selectedChoices.length > 0) {
        setSelectedChoices(pastAnswer.selectedChoices);
      } else if (pastAnswer.selectedChoice !== undefined && pastAnswer.selectedChoice !== null) {
        setSelectedChoices([pastAnswer.selectedChoice]);
      } else {
        setSelectedChoices([]);
      }
      setIsRevealed(true);
    } else {
      setSelectedChoices([]);
      setIsRevealed(false);
    }
  }, [currentIndex, questions, progress, retriedQuestions]);

  if (questions.length === 0) {
    return (
      <div className="bg-white border border-[#E6E2D8] rounded-[2rem] p-8 text-center space-y-5 max-w-lg mx-auto shadow-sm">
        <HelpCircle className="w-12 h-12 text-[#9A9489]/50 mx-auto" />
        <h3 className="font-serif font-bold text-[#423F3A] text-lg">No Questions Compiled</h3>
        <p className="text-sm text-[#7A756D] leading-relaxed font-sans">
          There are no QCMs matched with your active selection for this year's curriculum. Please adjust your criteria.
        </p>
        <button
          onClick={() => onClose()}
          className="px-6 py-3 bg-[#7D8C61] hover:bg-[#8A9A5B] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-bold shadow-md shadow-[#7D8C61]/10 transition-all cursor-pointer"
        >
          Return to Navigation
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  
  // Resolve correct answers (supporting both legacy correctAnswer and correctAnswers array)
  const correctAnswersList = currentQ.correctAnswers && currentQ.correctAnswers.length > 0
    ? currentQ.correctAnswers
    : currentQ.correctAnswer !== undefined ? [currentQ.correctAnswer] : [];

  const isMultiChoice = correctAnswersList.length > 1;

  // Question is correct if and only if selectedChoices match correctAnswersList exactly
  const isCorrect = selectedChoices.length === correctAnswersList.length &&
    selectedChoices.every((choice) => correctAnswersList.includes(choice));

  const letterMap = ["A", "B", "C", "D", "E"];

  const handleSelectChoice = (idx: number) => {
    if (isRevealed) return; // Locked once shown
    if (isMultiChoice) {
      if (selectedChoices.includes(idx)) {
        setSelectedChoices(selectedChoices.filter((c) => c !== idx));
      } else {
        setSelectedChoices([...selectedChoices, idx]);
      }
    } else {
      setSelectedChoices([idx]);
    }
  };

  const handleRevealAnswer = async () => {
    if (selectedChoices.length === 0 || isRevealed) return;
    setIsRevealed(true);
    setRetriedQuestions((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    await submitAnswer(currentQ.id, selectedChoices, isCorrect);
  };

  const handleNext = async () => {
    if (!isRevealed && selectedChoices.length > 0) {
      setIsRevealed(true);
      setRetriedQuestions((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
      await submitAnswer(currentQ.id, selectedChoices, isCorrect);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Reset or retry a question
  const handleRetryQuestion = () => {
    setRetriedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    setSelectedChoices([]);
    setIsRevealed(false);
  };

  return (
    <div className="space-y-6" id="qcm-engine-layout">
      {/* Session Header */}
      <ScrollReveal delay={0} yOffset={10}>
        <div className="bg-white border border-[#E6E2D8] rounded-[1.75rem] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-block px-2.5 py-0.5 bg-[#7D8C61]/10 text-[#7D8C61] text-[9px] font-mono rounded uppercase tracking-wider font-bold border border-[#7D8C61]/20">
              {sessionConfig.mode === "exam" ? `${sessionConfig.examYear} Board Exam Mode` : "Custom Practice Session"}
            </span>
            <h2 className="font-serif font-bold text-[#423F3A] text-base sm:text-lg">
              {sessionConfig.mode === "exam" ? `${sessionConfig.examYear} Exam Papers` : `Practice: ${sessionConfig.courses?.join(", ")}`}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <p className="text-[10px] text-[#7A756D] uppercase">Syllabus Progress</p>
              <p className="text-xs font-bold text-[#423F3A]">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to restart this practice session from the beginning?")) {
                    const sortedCourses = sessionConfig.courses ? [...sessionConfig.courses].sort().join(",") : "";
                    const sessionIndexKey = `med_session_idx_${student?.id}_${sessionConfig.mode}_${sessionConfig.examYear || ""}_${sortedCourses}`;
                    localStorage.removeItem(sessionIndexKey);
                    
                    try {
                      const saved = localStorage.getItem("med_active_session");
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed.mode === sessionConfig.mode && parsed.examYear === sessionConfig.examYear) {
                          localStorage.removeItem("med_active_session");
                        }
                      }
                    } catch (e) {
                      console.error(e);
                    }

                    // Reset session index and states
                    setCurrentIndex(0);
                    setSelectedChoices([]);
                    setIsRevealed(false);
                    setRetriedQuestions({});

                    // Reset all question progress for questions in this session
                    if (questions.length > 0) {
                      try {
                        await resetSessionProgress(questions.map((q) => q.id));
                      } catch (error) {
                        console.error("Failed to clear session progress:", error);
                      }
                    }
                  }
                }}
                className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-mono rounded-xl transition cursor-pointer font-bold dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/10"
              >
                Reset Session
              </button>
              <Magnetic strength={0.15} range={35}>
                <button
                  onClick={() => onClose(currentIndex)}
                  className="px-4 py-2 border border-[#E6E2D8] text-[#7A756D] hover:text-[#423F3A] hover:bg-[#FAF9F6] text-xs font-mono rounded-xl transition cursor-pointer"
                >
                  Exit Terminal
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Progress Bar & Main Card Container */}
      <ScrollReveal delay={0.1} yOffset={15}>
        <div className="w-full bg-[#E6E2D8] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#7D8C61] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Main QCM Body */}
        <div className="bg-white border border-[#E6E2D8] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6 mt-6">
        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E2D8]/50 pb-4 text-[10px] font-mono text-[#7A756D]">
          <span className="bg-[#FAF9F6] border border-[#E6E2D8] px-2.5 py-1 rounded-lg">
            Module: {currentQ.module}
          </span>
          <span className="bg-[#FAF9F6] border border-[#E6E2D8] px-2.5 py-1 rounded-lg">
            Course: {currentQ.course}
          </span>
          <span className="bg-[#FAF9F6] border border-[#E6E2D8] px-2.5 py-1 rounded-lg">
            Paper: {currentQ.examYear}
          </span>
          <span className="bg-[#FAF9F6] border border-[#E6E2D8] px-2.5 py-1 rounded-lg">
            Session: {currentQ.sessionType}
          </span>
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
            isMultiChoice ? "bg-[#C58B74]/15 text-[#C58B74] border border-[#C58B74]/30" : "bg-[#7D8C61]/15 text-[#7D8C61] border border-[#7D8C61]/30"
          }`}>
            {isMultiChoice ? "QCM (Multiple)" : "QCS (Single Choice)"}
          </span>
          {currentQ.is_residanat_origin && student?.academicYear !== "Residanat" && (
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 animate-pulse">
              🔥 Asked in Residanat
            </span>
          )}
        </div>

        {/* Clinical Vignette (Question Text) */}
        <div className="space-y-3 text-left">
          <h3 className="font-mono font-bold text-[#7A756D] text-[10px] uppercase tracking-widest">Clinical Vignette</h3>
          <p className="text-[#423F3A] font-serif text-base sm:text-lg leading-relaxed select-text font-medium">
            {currentQ.text}
          </p>
        </div>

        {/* Choices A to E */}
        <div className="space-y-3" id="qcm-choices">
          {currentQ.choices.map((choice, idx) => {
            const letter = letterMap[idx];
            const isSelected = selectedChoices.includes(idx);
            const isCorrectChoice = correctAnswersList.includes(idx);

            // Highlight rules customized for soft healthcare palette
            let choiceClass = "border-[#E6E2D8] hover:border-[#7D8C61] bg-white text-[#423F3A] hover:bg-[#FAF9F6]/20";
            let circleClass = "border-[#E6E2D8] bg-[#FAF9F6] text-[#7A756D]";

            if (isRevealed) {
              if (isCorrectChoice) {
                choiceClass = "border-[#7D8C61] bg-[#7D8C61]/5 text-[#423F3A] shadow-sm";
                circleClass = "border-[#7D8C61] bg-[#7D8C61] text-white font-bold";
              } else if (isSelected) {
                choiceClass = "border-[#C58B74] bg-[#C58B74]/5 text-[#423F3A] shadow-sm";
                circleClass = "border-[#C58B74] bg-[#C58B74] text-white font-bold";
              } else {
                choiceClass = "border-[#E6E2D8]/60 bg-[#FAF9F6]/10 text-[#9A9489] opacity-50";
                circleClass = "border-[#E6E2D8] bg-[#FAF9F6] text-[#9A9489]";
              }
            } else if (isSelected) {
              choiceClass = "border-[#7D8C61] bg-[#7D8C61]/5 text-[#423F3A] ring-2 ring-[#7D8C61]/10";
              circleClass = "border-[#7D8C61] bg-[#7D8C61] text-white font-bold";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectChoice(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-4 sm:p-5 border rounded-2xl flex items-center space-x-4 transition-all duration-200 select-none cursor-pointer ${choiceClass}`}
              >
                <span className={`w-8 h-8 rounded-xl border flex items-center justify-center font-mono text-sm shrink-0 font-bold transition-all ${circleClass}`}>
                  {letter}
                </span>
                <span className="text-xs sm:text-sm font-sans leading-relaxed">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E6E2D8]/50 pt-5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isRevealed ? (
              <Magnetic strength={selectedChoices.length === 0 ? 0 : 0.2} range={selectedChoices.length === 0 ? 0 : 45}>
                <button
                  onClick={handleRevealAnswer}
                  disabled={selectedChoices.length === 0}
                  className={`px-6 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-200 font-bold cursor-pointer ${
                    selectedChoices.length === 0
                      ? "bg-[#F2F0E9] text-[#9A9489] cursor-not-allowed"
                      : "bg-[#7D8C61] hover:bg-[#8A9A5B] text-white shadow-md shadow-[#7D8C61]/15"
                  }`}
                >
                  Submit & Reveal
                </button>
              </Magnetic>
            ) : (
              <Magnetic strength={0.15} range={35}>
                <button
                  onClick={handleRetryQuestion}
                  className="px-4 py-3 border border-[#E6E2D8] hover:bg-[#FAF9F6] text-[#423F3A] text-xs font-mono rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" /> Retry Vignette
                </button>
              </Magnetic>
            )}

            {/* AI Assistant Hook */}
            <Magnetic strength={0.2} range={40}>
              <button
                onClick={() => onNavigateToChat(currentQ)}
                className="px-4 py-3 border border-[#7D8C61]/20 hover:bg-[#7D8C61]/5 text-[#7D8C61] text-xs font-mono rounded-xl transition flex items-center gap-2 cursor-pointer font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Study with AI Tutor
              </button>
            </Magnetic>

            {/* Flag / Bookmark Toggle */}
            <Magnetic strength={0.15} range={30}>
              <button
                onClick={() => {
                  const flaggedStr = localStorage.getItem(`med_flagged_qs_${student?.id || "anonymous"}`) || "[]";
                  let flaggedIds: string[] = [];
                  try {
                    flaggedIds = JSON.parse(flaggedStr);
                  } catch (e) {
                    console.error(e);
                  }
                  if (flaggedIds.includes(currentQ.id)) {
                    flaggedIds = flaggedIds.filter(id => id !== currentQ.id);
                  } else {
                    flaggedIds.push(currentQ.id);
                  }
                  localStorage.setItem(`med_flagged_qs_${student?.id || "anonymous"}`, JSON.stringify(flaggedIds));
                  setFlaggedTrigger(prev => !prev);
                }}
                className="px-4 py-3 border border-[#E6E2D8] hover:bg-[#FAF9F6] text-[#423F3A] text-xs font-mono rounded-xl transition flex items-center gap-2 cursor-pointer font-bold"
              >
                <Bookmark className={`w-3.5 h-3.5 ${(() => {
                  const flaggedStr = localStorage.getItem(`med_flagged_qs_${student?.id || "anonymous"}`) || "[]";
                  try {
                    return (JSON.parse(flaggedStr) as string[]).includes(currentQ.id);
                  } catch (e) {
                    return false;
                  }
                })() ? "fill-[#C58B74] text-[#C58B74]" : "text-[#7A756D]"}`} />
                {(() => {
                  const flaggedStr = localStorage.getItem(`med_flagged_qs_${student?.id || "anonymous"}`) || "[]";
                  try {
                    return (JSON.parse(flaggedStr) as string[]).includes(currentQ.id) ? "Flagged" : "Flag QCM";
                  } catch (e) {
                    return "Flag QCM";
                  }
                })()}
              </button>
            </Magnetic>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Magnetic strength={0.15} range={30}>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-3 border rounded-xl transition-all cursor-pointer ${
                  currentIndex === 0
                    ? "border-[#E6E2D8]/60 text-[#9A9489] opacity-40 cursor-not-allowed"
                    : "border-[#E6E2D8] hover:bg-[#FAF9F6] text-[#423F3A]"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Magnetic>

            <Magnetic strength={0.15} range={30}>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className={`p-3 border rounded-xl transition-all cursor-pointer ${
                  currentIndex === questions.length - 1
                    ? "border-[#E6E2D8]/60 text-[#9A9489] opacity-40 cursor-not-allowed"
                    : "border-[#E6E2D8] hover:bg-[#FAF9F6] text-[#423F3A]"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </ScrollReveal>

      {/* Explanation Box (Visible ONLY after revealed) */}
      {isRevealed && (
        <ScrollReveal delay={0.05} yOffset={10}>
          <div
            className={`border rounded-[1.75rem] p-6 shadow-sm space-y-3.5 transition duration-300 text-left ${
              isCorrect
                ? "bg-[#7D8C61]/5 border-[#7D8C61]/30"
                : "bg-[#FAF9F6] border-[#E6E2D8]"
            }`}
            id="qcm-explanation-panel"
          >
            <div className="flex items-center justify-between border-b border-[#E6E2D8]/50 pb-2.5">
              <div className="flex items-center space-x-2">
                {isCorrect ? (
                  <CheckCircle2 className="text-[#7D8C61] w-5 h-5" />
                ) : (
                  <AlertTriangle className="text-[#C58B74] w-5 h-5" />
                )}
                <h4 className="font-mono font-bold text-[#423F3A] text-xs uppercase tracking-widest">
                  {isCorrect ? "Correct Diagnostic Pearl" : "Clinical Pathophysiology Rationale"}
                </h4>
              </div>
              <Magnetic strength={0.15} range={25}>
                <button
                  onClick={() => onNavigateToBugs(currentQ.id, currentQ.text)}
                  className="text-[9px] font-mono text-[#C58B74] hover:bg-[#C58B74]/5 border border-[#C58B74]/30 px-2 py-1 rounded transition cursor-pointer font-bold animate-pulse-slow"
                >
                  Report Vignette Issue
                </button>
              </Magnetic>
            </div>
            <p className="text-[#5C5852] font-sans text-xs sm:text-sm leading-relaxed select-text">
              {currentQ.explanation}
            </p>

            {/* SocratesMD AI Detailed Proof Panel */}
            <div className="mt-5 pt-4 border-t border-[#E6E2D8] dark:border-[#1B1E26]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="text-[#7D8C61] w-4 h-4" />
                  <span className="font-serif font-bold text-xs text-[#423F3A] dark:text-[#FAF9F6]">SocratesMD AI Pathology & Distractor Proofs</span>
                </div>
                {!aiExplanations[currentQ.id] && !loadingExplanation && (
                  <button
                    onClick={handleGenerateAiExplanation}
                    className="px-3.5 py-1.5 bg-[#7D8C61] hover:bg-[#8A9A5B] dark:bg-[#8CA365] dark:hover:bg-[#9CAE78] text-white text-xs font-mono rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-bold"
                  >
                    <Sparkles className="w-3 h-3" /> Generate AI Proof & Refutations
                  </button>
                )}
              </div>

              {loadingExplanation && (
                <div className="bg-[#FAF9F6]/50 dark:bg-[#171A22]/10 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl p-5 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="w-5 h-5 text-[#7D8C61] dark:text-[#8CA365] animate-spin" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono font-bold text-[#423F3A] dark:text-[#FAF9F6] animate-pulse">SOCRATESMD IS ANALYZING...</p>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#8C929D] font-sans">
                      Proving correct clinical options and debunking incorrect distractors...
                    </p>
                  </div>
                </div>
              )}

              {explanationError && (
                <div className="bg-red-50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 rounded-xl p-4 flex items-start space-x-3 text-left">
                  <AlertTriangle className="text-red-500 w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-red-800 dark:text-red-400">Failed to Generate Clinical Proof</p>
                    <p className="text-[11px] text-red-700 dark:text-red-300/80">{explanationError}</p>
                    <button
                      onClick={handleGenerateAiExplanation}
                      className="mt-1 text-xs font-bold text-[#7D8C61] dark:text-[#8CA365] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {aiExplanations[currentQ.id] && (
                <div className="bg-white dark:bg-[#171A22]/20 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-xl p-4 sm:p-5 text-left shadow-inner text-xs sm:text-sm leading-relaxed max-w-none">
                  <div className="markdown-body">
                    <ReactMarkdown components={markdownRenderers}>{aiExplanations[currentQ.id]}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};
