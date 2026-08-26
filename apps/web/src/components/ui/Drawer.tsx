"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "right" | "bottom";
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={side === "right" ? { x: "100%" } : { y: "100%" }}
            animate={side === "right" ? { x: 0 } : { y: 0 }}
            exit={side === "right" ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className={
              side === "right"
                ? "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-void-950 p-6 shadow-2xl"
                : "fixed inset-x-0 bottom-0 z-[70] flex max-h-[85svh] flex-col rounded-t-3xl bg-void-950 p-6 shadow-2xl"
            }
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
