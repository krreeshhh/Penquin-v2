"use client";

import { useState } from "react";
import { MailPlus, MailX, Plus, AlertCircle, X, Lightbulb, Heart, MessageCircle, ChevronLeft } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

const FEEDBACK_OPTIONS = [
  { id: 'submit_link', label: 'Submit link', icon: Plus, color: 'text-purple-400' },
  { id: 'update_link', label: 'Update link', icon: AlertCircle, color: 'text-red-400' },
  { id: 'report_link', label: 'Report bad / dead link', icon: X, color: 'text-red-500' },
  { id: 'suggest_edit', label: 'Suggest edit', icon: Lightbulb, color: 'text-yellow-400' },
  { id: 'love_wiki', label: 'Love the wiki', icon: Heart, color: 'text-pink-400' },
  { id: 'something_else', label: 'Something else', icon: MessageCircle, color: 'text-white' },
];

export function SectionFeedback({ sectionId, sectionTitle, children }: { sectionId: string; sectionTitle: string; children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setFeedbackText("");
    setErrorMsg(null);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => {
        setSelectedType(null);
        setFeedbackText("");
        setErrorMsg(null);
      }, 300); // Wait for exit animation
    } else {
      setIsOpen(true);
    }
  };

  const handleFeedback = async () => {
    if (!selectedType) return;
    if (!feedbackText.trim()) {
      setErrorMsg("Please write something before sending.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        pageUrl: window.location.href,
        pageTitle: document.title,
        sectionId,
        sectionTitle,
        sectionUrl: sectionId ? `${window.location.href.split('#')[0]}#${sectionId}` : window.location.href,
        type: selectedType,
        text: feedbackText,
      };

      // 12-second timeout — races against the Firebase write
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 12_000)
      );

      // Save to Firebase (with timeout)
      await Promise.race([
        addDoc(collection(db, "feedbacks"), {
          ...payload,
          timestamp: serverTimestamp(),
        }),
        timeout,
      ]);

      // Notify Discord in the background — failure won't block the UX
      fetch("/api/feedback-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {}); // silent — Discord is best-effort

      setSubmitted(true);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "TIMEOUT") {
        setErrorMsg("Request timed out. Please check your connection and try again.");
      } else {
        console.error("Error adding document: ", error);
        setErrorMsg("Failed to send. Adblocker might be blocking the connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = selectedType ? FEEDBACK_OPTIONS.find(o => o.id === selectedType) : null;

  return (
    <>
      <span className="relative">
        {children}
        <button
          onClick={handleToggle}
          aria-label="Give feedback on this section"
          className={`inline-flex h-[38px] w-10 align-middle ml-2 items-center justify-center rounded-lg border bg-[var(--vp-c-bg-soft)] text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] hover:bg-[var(--vp-c-bg-mute)] transition-all ${isOpen ? 'border-[var(--vp-c-brand-1)] text-[var(--vp-c-brand-1)]' : 'border-[var(--vp-c-divider)]'}`}
        >
          {isOpen ? <MailX className="h-5 w-5" /> : <MailPlus className="h-5 w-5" />}
        </button>
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full overflow-hidden"
          >
            <motion.div layout className="w-full mt-4 rounded-2xl border border-[var(--vp-c-divider)] bg-[#0a0a0a] p-5 sm:p-6 shadow-md cursor-default text-base font-normal">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                    className="py-3 px-1"
                  >
                    <span
                      className="text-[15px] font-bold text-white"
                    >
                      Thanks for your feedback!
                    </span>
                  </motion.div>
                ) : selectedOption ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 font-sans text-left"
                  >
                    <p className="text-[13px] font-medium text-[var(--vp-c-text-2)]">
                      Let us know how helpful this section is. - We appreciate your support 🙏
                    </p>
                    <div className="flex items-center gap-2.5 text-[22px] font-bold text-white tracking-tight">
                      <selectedOption.icon className={`h-7 w-7 ${selectedOption.color} stroke-[2.5px]`} />
                      <span>{selectedOption.label}</span>
                    </div>
                    <textarea 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tip: Did you know that starring our GitHub repo doubles the chances that your feedback will be read?"
                      className="w-full h-24 bg-[#0a0a0a] border border-[var(--vp-c-divider)] rounded-lg p-3 focus:outline-none focus:border-[var(--vp-c-brand-1)] focus:ring-1 focus:ring-[var(--vp-c-brand-1)] transition-all resize-none placeholder:text-[var(--vp-c-text-3)]"
                      style={{
                        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                        fontSize: "16px",
                        fontWeight: 400,
                        color: "#E3E2E6",
                      }}
                    />
                    <p className="text-[13px] text-[var(--vp-c-text-2)]">
                      If you want a reply to your feedback, feel free to mention a contact in the message or join our <a href="#" className="text-[var(--vp-c-brand-1)] hover:underline transition-colors">Discord</a>.
                    </p>
                    {errorMsg && (
                      <p className="text-[13px] font-medium text-red-400 mt-1">
                        {errorMsg}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <button 
                        onClick={() => setSelectedType(null)}
                        className="p-2.5 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] hover:bg-[var(--vp-c-bg-mute)] transition-colors text-[var(--vp-c-text-2)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleFeedback}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--vp-c-bg-soft)] border border-[var(--vp-c-divider)] text-[14px] text-[var(--vp-c-text-1)] font-medium hover:bg-[var(--vp-c-bg-mute)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Sending..." : "Send Feedback 📥"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 font-sans text-left"
                  >
                    <h4 className="text-[17px] font-semibold text-white tracking-tight">What do you think about this section?</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {FEEDBACK_OPTIONS.map((option) => (
                        <FeedbackBtn 
                          key={option.id}
                          icon={<option.icon className={`h-4 w-4 ${option.color}`} />} 
                          label={option.label} 
                          onClick={() => handleSelectType(option.id)} 
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FeedbackBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--vp-c-divider)] bg-transparent px-3 py-2 text-[14px] font-medium text-[var(--vp-c-text-1)] hover:bg-white/5 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
