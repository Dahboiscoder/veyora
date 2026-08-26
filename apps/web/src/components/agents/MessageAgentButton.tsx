"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function MessageAgentButton({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { user, isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [sending, setSending] = useState(false);

  if (user?.id === agentId) return null;

  async function startConversation() {
    if (!isAuthenticated) return router.push("/login");
    setSending(true);
    try {
      const res = await api.post<{ id: string }>("/api/conversations", {
        recipientId: agentId,
        text: `Hi ${agentName.split(" ")[0]}, I'd like to get in touch.`,
      });
      router.push(`/messages?c=${res.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start conversation");
    } finally {
      setSending(false);
    }
  }

  return (
    <button onClick={startConversation} disabled={sending} className="btn-primary mt-10 !px-5 !py-2.5 text-sm">
      <MessageCircle className="h-4 w-4" /> Message {agentName.split(" ")[0]}
    </button>
  );
}
