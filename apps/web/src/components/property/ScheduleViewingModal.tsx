"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

export function ScheduleViewingModal({
  open,
  onClose,
  propertyId,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
}) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!date) {
      toast.error("Pick a date and time");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/viewings", { propertyId, proposedAt: new Date(date).toISOString(), message: message || undefined });
      toast.success("Viewing requested — the host will confirm shortly");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't request viewing");
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
                <CalendarClock className="h-5 w-5 text-ember-400" />
                <h3 className="font-display text-lg font-semibold">Schedule a viewing</h3>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="field-label">Preferred date & time</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="input mb-4" />

            <label className="field-label">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Anything the host should know?"
              className="input mb-4 resize-none"
            />

            <button onClick={submit} disabled={submitting} className="btn-primary w-full">
              {submitting ? "Requesting…" : "Request viewing"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
