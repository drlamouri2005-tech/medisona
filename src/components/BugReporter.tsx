import React, { useState, useEffect } from "react";
import { useStudent } from "./StudentContext";
import { AlertTriangle, Send, Check, ShieldAlert } from "lucide-react";

interface BugReporterProps {
  prefilledQuestionId?: string | null;
  prefilledQuestionText?: string | null;
  onClearPrefills: () => void;
}

export const BugReporter: React.FC<BugReporterProps> = ({
  prefilledQuestionId,
  prefilledQuestionText,
  onClearPrefills
}) => {
  const { student, submitBugReport } = useStudent();
  const [qId, setQId] = useState<string>("");
  const [issueType, setIssueType] = useState<string>("Scientific error in explanation");
  const [details, setDetails] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (prefilledQuestionId) {
      setQId(prefilledQuestionId);
    }
  }, [prefilledQuestionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setIsSubmitting(true);
    const fullTextContext = prefilledQuestionText || "General Platform Inquiry";
    const structuredDetails = `[Category: ${issueType}] ${details}`;

    await submitBugReport(qId || "General", fullTextContext, structuredDetails);

    setIsSubmitting(false);
    setIsSuccess(true);
    setDetails("");
    setQId("");
    onClearPrefills();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-left" id="bug-reporter-view">
      {/* Header */}
      <div className="bg-white border border-[#E6E2D8] rounded-[1.75rem] p-6 sm:p-8 shadow-sm space-y-2">
        <h2 className="text-2xl font-serif font-bold text-[#423F3A] flex items-center gap-2.5">
          <AlertTriangle className="text-[#C58B74] w-5.5 h-5.5" /> Clinical Error Signal
        </h2>
        <p className="text-[#7A756D] text-sm font-sans leading-relaxed">
          Spotted a scientific error, diagnostic typo, or structural issue? Flag it immediately for peer-clinical supervisor review.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white border border-[#E6E2D8] rounded-[2rem] p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 bg-[#7D8C61]/10 text-[#7D8C61] rounded-full flex items-center justify-center mx-auto border border-[#7D8C61]/20">
            <Check className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif font-bold text-[#423F3A] text-lg">Report Logged Successfully</h3>
            <p className="text-xs text-[#7A756D] max-w-sm mx-auto leading-relaxed font-sans">
              Thank you! Our clinical advisory board will audit this vignette against official medical guidelines and apply the correction shortly.
            </p>
          </div>
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-3.5 bg-[#7D8C61] hover:bg-[#8A9A5B] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition cursor-pointer"
          >
            Log Another Signal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E6E2D8] rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Prefill Alert banner */}
          {prefilledQuestionId && (
            <div className="p-4 bg-[#FAF9F6] border border-[#E6E2D8] text-[#423F3A] rounded-xl text-xs flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#7D8C61] shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-bold uppercase tracking-wider text-[10px] text-[#7A756D]">Linked Vignette Context</p>
                <p className="text-[10px] text-[#7D8C61] font-mono">ID: {prefilledQuestionId}</p>
                <p className="italic text-[#5C5852] line-clamp-2">"{prefilledQuestionText}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setQId("");
                    onClearPrefills();
                  }}
                  className="text-[10px] underline font-bold text-[#C58B74] hover:text-[#c4694b] block mt-1 cursor-pointer"
                >
                  Clear question linkage
                </button>
              </div>
            </div>
          )}

          {/* Question Link input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">Vignette ID / Reference</label>
            <input
              type="text"
              value={qId}
              onChange={(e) => setQId(e.target.value)}
              placeholder="e.g., q_y3_cardio_1"
              className="w-full p-3.5 text-sm border border-[#E6E2D8] rounded-xl bg-[#FAF9F6]/30 focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] focus:outline-none"
              disabled={isSubmitting || prefilledQuestionId !== null}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">Scientific Category</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-3.5 text-sm border border-[#E6E2D8] rounded-xl bg-[#FAF9F6]/30 focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] focus:outline-none cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="Scientific error in explanation">Scientific error in rationale (Outdated guideline)</option>
              <option value="Incorrect correct-choice designation">Incorrect correct choice mapping</option>
              <option value="Typographical / Translation issue">Typographic / grammar slip</option>
              <option value="Clinical vignette ambiguity">Clinical vignette layout ambiguity</option>
              <option value="Technical UI / Canvas failure">Technical platform feedback</option>
            </select>
          </div>

          {/* Details input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">Rationale Discrepancy details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Cite guidelines when possible (e.g., 'ESC guidelines dictate ACEi/ARB first line but explanation mentions beta-blockers...')"
              rows={5}
              className="w-full p-4 text-sm border border-[#E6E2D8] rounded-xl bg-[#FAF9F6]/30 focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] focus:outline-none resize-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !details.trim()}
            className={`w-full py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting || !details.trim()
                ? "bg-[#F2F0E9] text-[#9A9489] cursor-not-allowed"
                : "bg-[#423F3A] hover:bg-[#5C5852] text-white shadow-md shadow-[#423F3A]/10"
            }`}
          >
            {isSubmitting ? "Logging Ticket..." : <><Send className="w-3.5 h-3.5" /> Submit for Clinical Audit</>}
          </button>
        </form>
      )}
    </div>
  );
};
