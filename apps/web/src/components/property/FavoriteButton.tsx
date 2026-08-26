"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className,
  size = "md",
}: {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Log in to save properties");
      router.push("/login");
      return;
    }
    if (pending) return;
    setPending(true);
    const next = !favorited;
    setFavorited(next); // optimistic
    try {
      const res = await api.post<{ favorited: boolean }>(`/api/properties/${propertyId}/favorite`);
      setFavorited(res.favorited);
    } catch (err) {
      setFavorited(!next);
      toast.error(err instanceof ApiError ? err.message : "Couldn't update favorites");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={favorited ? "Remove from saved" : "Save property"}
      aria-pressed={favorited}
      className={cn(
        "grid place-items-center rounded-full glass transition-transform hover:scale-110 active:scale-95",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className
      )}
    >
      <Heart
        className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", favorited ? "fill-ember-500 text-ember-500" : "text-white")}
      />
    </button>
  );
}
