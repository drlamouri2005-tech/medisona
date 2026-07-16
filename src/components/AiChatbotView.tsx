import React, { useState, useEffect, useRef } from "react";
import { Question } from "../types";
import { 
  Sparkles, 
  Send, 
  UploadCloud, 
  MessageSquare, 
  AlertCircle, 
  FileText, 
  Trash2, 
  HelpCircle, 
  Image as ImageIcon, 
  Loader2, 
  Paperclip, 
  X, 
  BrainCircuit,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollReveal, Magnetic, FloatingCard } from "./EliteInteractions";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiChatbotViewProps {
  prefilledQuestion?: Question | null;
  onClearQuestion: () => void;
}

export const AiChatbotView: React.FC<AiChatbotViewProps> = ({
  prefilledQuestion,
  onClearQuestion
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I am medisona, your private clinical tutor. I specialize in medical curriculum mastery, pathophysiology, and diagnostic reasoning. \n\nFeel free to upload your lecture slides, medical PDFs, images, or ask questions about clinical cases. How can I guide your medical reasoning today?"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Document context states
  const [documentName, setDocumentName] = useState<string>("");
  const [documentText, setDocumentText] = useState<string>("");
  const [pastedText, setPastedText] = useState<string>("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load prefilled question on mount/update
  useEffect(() => {
    if (prefilledQuestion) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `I've loaded your clinical question regarding "${prefilledQuestion.course}" in the ${prefilledQuestion.module} module. Ask me to break down the pathophysiology, explain why the correct choice is correct, or clarify any specific clinical traps in this question.`
        }
      ]);
    }
  }, [prefilledQuestion]);

  // Base64 helper
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Main file processor
  const processUploadedFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isImg = file.type.startsWith("image/") || 
                  lowerName.endsWith(".png") || 
                  lowerName.endsWith(".jpg") || 
                  lowerName.endsWith(".jpeg") || 
                  lowerName.endsWith(".webp") ||
                  lowerName.endsWith(".gif");
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");

    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const base64Data = await getBase64(file);

      if (isImg) {
        setAttachedFile({
          name: file.name,
          mimeType: file.type || "image/jpeg",
          data: base64Data
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Attached image: "${file.name}". You can now type your question, and medisona will inspect the visual diagnostic features alongside your text query.`
          }
        ]);
      } else if (isPdf) {
        setAttachedFile({
          name: file.name,
          mimeType: "application/pdf",
          data: base64Data
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Attached study document: "${file.name}". I will index and search this PDF for your queries. Ask me to summarize its key highlights or explain specific pages.`
          }
        ]);
      } else {
        setDocumentName(file.name);
        const res = await fetch("/api/parse-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to extract text from file");

        setDocumentText(data.text);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Successfully indexed: "${file.name}" (${Math.round(data.text.length / 1024)} KB of raw clinical data). Ask me any concept questions, and I will strictly align my answers with this slide material.`
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse study document. Please verify the format.");
      if (!isImg && !isPdf) {
        setDocumentName("");
        setDocumentText("");
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearDocument = () => {
    setDocumentName("");
    setDocumentText("");
  };

  // Sending requests to proxy API
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !prefilledQuestion && !attachedFile) return;

    setErrorMsg(null);
    let userDisplayMessage = textToSend;
    if (attachedFile && !textToSend.trim()) {
      userDisplayMessage = `[Attached: ${attachedFile.name}]`;
    }

    const userMsg: Message = { role: "user", text: userDisplayMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const fileToSend = attachedFile;
    setAttachedFile(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: textToSend || `Please analyze this attached ${fileToSend?.mimeType.startsWith("image/") ? "image" : "document"}.`,
          chatHistory: messages,
          documentText: documentText || pastedText || undefined,
          file: fileToSend || undefined,
          questionContext: prefilledQuestion ? {
            text: prefilledQuestion.text,
            choices: prefilledQuestion.choices,
            correctAnswer: prefilledQuestion.correctAnswer,
            correctAnswers: prefilledQuestion.correctAnswers,
            explanation: prefilledQuestion.explanation
          } : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Tutor server connection timed out.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.text }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Tutor failed to formulate response. Check API key settings.");
      if (fileToSend) setAttachedFile(fileToSend);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="ai-chat-view">
      
      {/* Sidebar: Premium Document context config */}
      <ScrollReveal className="lg:col-span-1 space-y-6" delay={0.05}>
        <FloatingCard className="p-6 space-y-5" delay={0.1}>
          <div className="border-b border-[#E6E2D8]/60 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#7D8C61] medical-icon-rotate" />
              <h3 className="font-serif font-bold text-[#423F3A] text-sm tracking-wide">
                Document Context
              </h3>
            </div>
            <p className="text-[#7A756D] text-[11px] leading-relaxed mt-1">
              Feed private clinical guidelines, slides, or images directly to the chatbot's active reasoning cycle.
            </p>
          </div>

          {/* Upload Dropzone Area */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="space-y-3"
          >
            {isExtracting ? (
              <div className="border border-dashed border-[#7D8C61] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#7D8C61]/5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#7D8C61]/10 flex items-center justify-center mb-3">
                  <Loader2 className="animate-spin text-[#7D8C61] w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#423F3A]">Processing Material...</span>
                <span className="text-[10px] text-[#7A756D] mt-1.5 leading-relaxed">
                  Extracting medical definitions & structures natively
                </span>
              </div>
            ) : documentName ? (
              <div className="p-4 bg-[#7D8C61]/5 border border-[#7D8C61]/25 rounded-2xl flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <FileText className="text-[#7D8C61] w-5 h-5 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#423F3A] truncate">{documentName}</p>
                    <p className="text-[10px] font-mono text-[#7A756D] mt-0.5">
                      {Math.round(documentText.length / 1024)} KB Indexed
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearDocument}
                  className="text-[#9A9489] hover:text-[#C58B74] p-1 rounded-lg hover:bg-white transition cursor-pointer"
                  title="Clear document context"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`border border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none ${
                dragActive 
                  ? "border-[#7D8C61] bg-[#7D8C61]/10 scale-95" 
                  : "border-[#D0C9BC] hover:border-[#7D8C61] bg-[#FAF9F6]/40 hover:bg-white"
              }`}>
                <UploadCloud className="text-[#9A9489] w-7 h-7 mb-2.5" />
                <span className="text-xs font-bold text-[#423F3A] block">Add Custom Lecture Context</span>
                <span className="text-[10px] text-[#7A756D] mt-1 leading-relaxed block">
                  Drag & drop or select PDF, Word, JPEG, PNG, TXT
                </span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Paste sliding paragraphs text box */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#7A756D] uppercase tracking-wider block">Or Paste Slide Passages:</span>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste specific anatomical notes, patient charts, or study guides..."
              rows={4}
              className="w-full p-3 text-xs border border-[#E6E2D8] rounded-xl bg-[#FAF9F6]/40 focus:bg-white transition resize-none text-[#423F3A] focus:ring-1 focus:ring-[#7D8C61]"
            />
            {pastedText && (
              <button
                onClick={() => setPastedText("")}
                className="text-[9px] font-mono text-[#C58B74] hover:underline block font-semibold transition cursor-pointer"
              >
                Clear Pasted Text
              </button>
            )}
          </div>
        </FloatingCard>

        {/* Floating Question context capsule */}
        {prefilledQuestion && (
          <FloatingCard className="p-5 space-y-3.5" delay={0.25}>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#7D8C61]/10 text-[#7D8C61] text-[9px] font-mono rounded tracking-wider uppercase font-extrabold">
                Active QCM Loaded
              </span>
            </div>
            <div className="text-xs text-[#5C5852] space-y-2">
              <p className="font-serif leading-relaxed line-clamp-3 italic">"{prefilledQuestion.text}"</p>
              <p className="text-[9px] font-mono text-[#9A9489] uppercase tracking-wide">
                {prefilledQuestion.module} • {prefilledQuestion.course}
              </p>
            </div>
            <button
              onClick={onClearQuestion}
              className="w-full py-2 border border-[#C58B74]/35 text-[#C58B74] hover:bg-[#C58B74]/5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer font-bold"
            >
              Disconnect Question
            </button>
          </FloatingCard>
        )}
      </ScrollReveal>

      {/* Main column: Chat conversation window */}
      <ScrollReveal className="lg:col-span-3 flex flex-col h-[620px] bg-white border border-[#E6E2D8] rounded-[1.5rem] shadow-[0_15px_45px_rgba(125,140,97,0.03)] overflow-hidden" delay={0.15}>
        
        {/* Chat window Header */}
        <div className="border-b border-[#E6E2D8]/60 px-6 py-4 bg-[#FAF9F6]/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#7D8C61] flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#423F3A] text-sm tracking-wide">Clinical Study Assistant</h3>
              <p className="text-[#7D8C61] text-[9px] font-mono flex items-center gap-1.5 uppercase font-bold tracking-wider mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#7D8C61] rounded-full animate-pulse"></span>
                TUTOR IS SYNCHRONIZED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-mono text-[#9A9489] uppercase">Gemini medical reasoning</span>
          </div>
        </div>

        {/* Conversations overflow lists */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAF9F6]/20">
          {messages.map((m, idx) => {
            const isAI = m.role === "model";
            return (
              <div
                key={idx}
                className={`flex ${isAI ? "justify-start" : "justify-end"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.25rem] p-4 text-sm font-sans leading-relaxed select-text shadow-sm border ${
                    isAI
                      ? "bg-white border-[#E6E2D8] text-[#423F3A] rounded-tl-none"
                      : "bg-[#7D8C61] text-white border-[#7D8C61] rounded-tr-none shadow-[#7D8C61]/10"
                  }`}
                >
                  {isAI && (
                    <div className="flex items-center space-x-1.5 text-[#7D8C61] font-mono text-[9px] uppercase font-bold mb-2 pb-1 border-b border-[#E6E2D8]/40">
                      <Sparkles className="w-3.5 h-3.5" /> 
                      <span>OSSBOR NFHMOK AI TUTOR</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-xs sm:text-sm">{m.text}</p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#E6E2D8] rounded-[1.25rem] rounded-tl-none p-4 text-[#7A756D] text-xs font-mono flex items-center space-x-3.5 shadow-sm">
                <div className="flex space-x-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-[#7D8C61] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#7D8C61] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#7D8C61] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span>Tutor is formulating physiological advice...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 border border-[#C58B74]/30 bg-[#C58B74]/5 text-[#C58B74] rounded-2xl flex items-start gap-3 text-xs">
              <AlertCircle className="text-[#C58B74] w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-[10px]">Tutor Connection Issue</p>
                <p className="font-sans text-[#7A756D] leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Suggested Quick Carousel Actions */}
        <div className="px-6 py-3 bg-[#FAF9F6]/80 border-t border-[#E6E2D8]/60 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none select-none">
          <span className="text-[9px] font-mono text-[#9A9489] uppercase tracking-wider mr-1.5 shrink-0">Quick Prompts:</span>
          {prefilledQuestion ? (
            <>
              <button
                onClick={() => triggerQuickPrompt("Please break down the clinical diagnostic pearls of this question.")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                Explain vignette
              </button>
              <button
                onClick={() => triggerQuickPrompt("Why is the designated correct answer option physiologically appropriate here?")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                Justify core choice
              </button>
              <button
                onClick={() => triggerQuickPrompt("Let's review the physiology and discuss why other options are incorrect.")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                Discuss incorrect options
              </button>
            </>
          ) : documentText ? (
            <>
              <button
                onClick={() => triggerQuickPrompt("Please summarize the main clinical concepts, high-yield points and takeaways in this study document.")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                Summarize Notes
              </button>
              <button
                onClick={() => triggerQuickPrompt("Based strictly on this indexed study context, write 3 customized mock QCM clinical vignettes for me.")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                Generate 3 QCMs on Notes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => triggerQuickPrompt("Explain the classic pathophysiology and SAD triad in Aortic Stenosis.")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                SAD Triad
              </button>
              <button
                onClick={() => triggerQuickPrompt("What is the primary action and target channel of antidiuretic hormone (ADH) in the kidney?")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                ADH Channels
              </button>
              <button
                onClick={() => triggerQuickPrompt("What are the classic diagnostic markers and criteria for Systemic Lupus Erythematosus (SLE)?")}
                className="px-3.5 py-1.5 text-[10px] font-mono text-[#7D8C61] bg-white hover:bg-[#7D8C61]/5 rounded-full border border-[#E6E2D8] hover:border-[#7D8C61]/35 transition-all shrink-0 cursor-pointer font-bold"
              >
                SLE Markers
              </button>
            </>
          )}
        </div>

        {/* Attached Capsule preview directly above chat input */}
        {attachedFile && (
          <div className="px-6 py-2 bg-[#7D8C61]/5 border-t border-[#7D8C61]/20 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 border border-[#7D8C61]/20 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0">
                {attachedFile.mimeType.startsWith("image/") ? (
                  <img
                    src={`data:${attachedFile.mimeType};base64,${attachedFile.data}`}
                    alt="Clinical attachment preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-[#7D8C61] animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#423F3A] line-clamp-1">{attachedFile.name}</p>
                <p className="text-[9px] font-mono text-[#7A756D] uppercase tracking-wider mt-0.5">
                  {attachedFile.mimeType === "application/pdf" ? "PDF Material" : "Visual Diagnostic Image"} • READY TO SUBMIT
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-[#9A9489] hover:text-[#C58B74] p-1.5 hover:bg-[#7D8C61]/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4 text-[#C58B74]" />
            </button>
          </div>
        )}

        {/* Chat input box layout */}
        <div className="p-4 border-t border-[#E6E2D8]/60 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center space-x-3"
          >
            {/* Minimalist Clip Icon inside the chat bar */}
            <Magnetic strength={0.2} range={45}>
              <label 
                className="p-3.5 rounded-xl border border-[#E6E2D8] hover:border-[#7D8C61] bg-[#FAF9F6] hover:bg-white text-[#7A756D] hover:text-[#7D8C61] cursor-pointer transition-all flex items-center justify-center shrink-0"
                title="Attach study slides or PDF (Max 10MB)"
              >
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </Magnetic>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                prefilledQuestion 
                  ? "Ask anything about this QCM (pathophysiology, choices)..." 
                  : "Ask medisona any clinical concept, drug mechanism, etc..."
              }
              className="flex-1 p-3.5 text-sm border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7D8C61] focus:border-[#7D8C61] bg-[#FAF9F6]/50 focus:bg-white transition-all text-[#423F3A] font-sans"
              disabled={isTyping}
            />
            
            <Magnetic strength={0.25} range={50}>
              <button
                type="submit"
                disabled={isTyping || (!input.trim() && !attachedFile)}
                className={`p-3.5 rounded-xl transition-all duration-250 shrink-0 cursor-pointer ${
                  (!input.trim() && !attachedFile) || isTyping
                    ? "bg-[#F2F0E9] text-[#9A9489] cursor-not-allowed"
                    : "bg-[#7D8C61] text-white hover:bg-[#8A9A5B] shadow-md shadow-[#7D8C61]/15"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </Magnetic>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
};
