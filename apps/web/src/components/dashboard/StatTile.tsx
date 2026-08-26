import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  icon: Icon,
  accent = "ember",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "ember" | "aurora";
}) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent === "ember" ? "bg-ember-500/15" : "bg-aurora-500/15"}`}>
          <Icon className={`h-4.5 w-4.5 ${accent === "ember" ? "text-ember-400" : "text-aurora-400"}`} />
        </div>
      </div>
      <p className="font-display text-2xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/45">{label}</p>
    </div>
  );
}
