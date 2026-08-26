"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, CalendarClock, Flag, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@/lib/utils";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ScheduleViewingModal } from "./ScheduleViewingModal";
import { ReportModal } from "./ReportModal";

export interface AgentInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  whatsapp: string | null;
  phone: string | null;
  verificationStatus: string;
  _count: { properties: number; agentFollowers: number };
}

const ROLE_LABEL: Record<string, string> = { OWNER: "Property Owner", AGENT: "Agent", COMPANY: "Agency", ADMIN: "VEYORA Team", USER: "User" };

export function ContactAgentCard({
  agent,
  company,
  propertyId,
  propertyTitle,
}: {
  agent: AgentInfo;
  company: { id: string; name: string; slug: string; logoUrl: string | null; verificationStatus: string } | null;
  propertyId: string;
  propertyTitle: string;
}) {
  const { user, isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [viewingOpen, setViewingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const isSelf = user?.id === agent.id;

  async function handleMessage() {
    if (!isAuthenticated) return router.push("/login");
    setMessaging(true);
    try {
      const res = await api.post<{ id: string }>("/api/conversations", {
        recipientId: agent.id,
        propertyId,
        text: `Hi! I'm interested in "${propertyTitle}". Is it still available?`,
      });
      router.push(`/messages?c=${res.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start conversation");
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <Link href={`/agents/${agent.id}`} className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-lg font-semibold">
          {agent.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.avatarUrl} alt={agent.name} className="h-full w-full object-cover" />
          ) : (
            initials(agent.name)
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-display font-semibold text-white">
            {agent.name}
            {agent.verificationStatus === "VERIFIED" && <BadgeCheck className="h-4 w-4 shrink-0 text-aurora-400" />}
          </p>
          <p className="text-xs text-white/50">
            {ROLE_LABEL[agent.role]} · {agent._count.properties} listings · {agent._count.agentFollowers} followers
          </p>
        </div>
      </Link>

      {company && (
        <Link href={`/companies/${company.slug}`} className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06]">
          Listed via <span className="font-semibold text-white/80">{company.name}</span>
          {company.verificationStatus === "VERIFIED" && <BadgeCheck className="h-3.5 w-3.5 text-aurora-400" />}
        </Link>
      )}

      {agent.bio && <p className="mt-3 line-clamp-3 text-sm text-white/55">{agent.bio}</p>}

      {!isSelf && (
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={handleMessage} disabled={messaging} className="btn-primary w-full !py-2.5 text-sm">
            <MessageCircle className="h-4 w-4" /> Message
          </button>
          <div className="grid grid-cols-2 gap-2">
            {agent.whatsapp && (
              <a
                href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in "${propertyTitle}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !py-2.5 text-sm"
              >
                WhatsApp
              </a>
            )}
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="btn-secondary !py-2.5 text-sm">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
          </div>
          <button onClick={() => setViewingOpen(true)} className="btn-secondary w-full !py-2.5 text-sm">
            <CalendarClock className="h-4 w-4" /> Schedule a viewing
          </button>
        </div>
      )}

      <button onClick={() => setReportOpen(true)} className="mt-4 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60">
        <Flag className="h-3 w-3" /> Report this listing
      </button>

      <ScheduleViewingModal open={viewingOpen} onClose={() => setViewingOpen(false)} propertyId={propertyId} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} propertyId={propertyId} />
    </div>
  );
}
