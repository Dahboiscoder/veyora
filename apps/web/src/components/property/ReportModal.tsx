"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Flag } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";

const REASONS = [
  { value: "FRAUD", label: "This looks fraudulent" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "MISLEADING", label: "Misleading information" },
  { value: "SOLD_ALREADY", label: "Already sold / rented" },
  { value: "OFFENSIVE", label: "Offensive content" },
  { value: "WRONG_INFO", label: "Incorrect details" },
  { value: "OTHER", label: "Something else" },
];

export function ReportModal({ open, onClose, propertyId }: { open: boolean; onClose: () => void; propertyId: string }) {
  const [reason, setReason] = useState("FRAUD");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await api.post("/api/reports", { propertyId, reason, details: details || undefined });
      toast.success("Thanks — our team will review this listing");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-sm !bg-void-900 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-400" />
                <h3 className="font-display text-lg font-semibold">Report this listing</h3>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              {REASONS.map((r) => (
                <label key={r.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]">
                  <input type="radio" name="reason" checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-ember-500" />
                  <span className="text-sm text-white/80">{r.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Additional details (optional)"
              className="input mb-4 resize-none"
            />

            <button onClick={submit} disabled={submitting} className="btn-primary w-full !bg-red-500 !from-red-500 !to-red-500">
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
