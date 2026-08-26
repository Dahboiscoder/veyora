"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { initials, cn } from "@/lib/utils";

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
}

function Stars({ rating, onChange }: { rating: number; onChange?: (n: number) => void }) {
  return (
    <div className={cn("flex", onChange ? "-m-1.5" : "gap-0.5")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(!onChange ? "cursor-default" : "grid h-9 w-9 place-items-center")}
        >
          <Star className={cn("h-4 w-4", n <= rating ? "fill-ember-400 text-ember-400" : "text-white/20")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ propertyId, initialReviews }: { propertyId: string; initialReviews: ReviewData[] }) {
  const { user, isAuthenticated } = useCurrentUser();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  async function submit() {
    setSubmitting(true);
    try {
      const review = await api.post<ReviewData>("/api/reviews", { propertyId, rating, comment: comment || undefined });
      setReviews((prev) => [{ ...review, author: { id: user!.id, name: user!.name, avatarUrl: user!.avatarUrl } }, ...prev]);
      setComment("");
      setFormOpen(false);
      toast.success("Review posted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't post review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-white">Reviews</h2>
          {avgRating !== null && (
            <span className="flex items-center gap-1 text-sm text-white/60">
              <Star className="h-4 w-4 fill-ember-400 text-ember-400" /> {avgRating.toFixed(1)} ({reviews.length})
            </span>
          )}
        </div>
        {isAuthenticated && !formOpen && (
          <button onClick={() => setFormOpen(true)} className="btn-ghost text-sm">
            Write a review
          </button>
        )}
      </div>

      {formOpen && (
        <div className="glass-card mb-5 p-4">
          <p className="field-label">Your rating</p>
          <Stars rating={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            className="input mt-3 resize-none"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={submit} disabled={submitting} className="btn-primary !py-2 text-sm">
              {submitting ? "Posting…" : "Post review"}
            </button>
            <button onClick={() => setFormOpen(false)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-white/40">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 border-b border-white/5 pb-4 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                {review.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.author.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  initials(review.author.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{review.author.name}</p>
                  <p className="shrink-0 text-xs text-white/35">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                </div>
                <Stars rating={review.rating} />
                {review.comment && <p className="mt-1.5 text-sm text-white/60">{review.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
