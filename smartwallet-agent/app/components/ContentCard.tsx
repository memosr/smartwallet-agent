"use client";

import { useState, useCallback, useRef } from "react";
import type { ContentCard } from "@/lib/content";

interface ContentCardProps {
  card: ContentCard;
  disabled: boolean;
  onLike: (contentId: string, contentTitle: string, creatorAddress: string) => Promise<void>;
}

export function ContentCardComponent({ card, disabled, onLike }: ContentCardProps) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"idle" | "success" | "blocked" | "error">("idle");
  const [localLikes, setLocalLikes] = useState(card.likes);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLike = useCallback(async () => {
    if (loading || liked || disabled) return;

    setLoading(true);
    try {
      await onLike(card.id, card.title, card.creatorAddress);
      setLiked(true);
      setLocalLikes((n) => n + 1);
      setState("success");

      // Trigger green flash
      if (cardRef.current) {
        cardRef.current.classList.add("animate-flash");
        timeoutRef.current = setTimeout(() => {
          cardRef.current?.classList.remove("animate-flash");
          setState("idle");
        }, 700);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "weekly_limit_exceeded") {
        setState("blocked");
        if (cardRef.current) {
          cardRef.current.classList.add("animate-shake");
          timeoutRef.current = setTimeout(() => {
            cardRef.current?.classList.remove("animate-shake");
          }, 500);
        }
      } else {
        setState("error");
        timeoutRef.current = setTimeout(() => setState("idle"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [card, disabled, liked, loading, onLike]);

  const categoryColors: Record<string, string> = {
    Cryptography: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    "AI Engineering": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Web3: "text-accent bg-accent/10 border-accent/20",
  };
  const catStyle = categoryColors[card.category] ?? "text-muted bg-surface border-border";

  return (
    <div
      ref={cardRef}
      className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
        state === "success"
          ? "border-accent/60 bg-surface"
          : state === "blocked"
          ? "border-danger/60 bg-surface"
          : "border-border bg-surface hover:border-border/80"
      }`}
    >
      {/* Top accent line */}
      <div
        className={`h-0.5 w-full ${
          state === "success"
            ? "bg-gradient-to-r from-accent via-accent/50 to-transparent"
            : state === "blocked"
            ? "bg-gradient-to-r from-danger via-danger/50 to-transparent"
            : liked
            ? "bg-gradient-to-r from-accent/40 to-transparent"
            : "bg-gradient-to-r from-border to-transparent"
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`font-mono-custom text-[11px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${catStyle}`}
          >
            {card.category}
          </span>
          <span className="font-mono-custom text-xs text-muted whitespace-nowrap">
            {card.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h2 className="font-sans text-base font-semibold leading-snug text-text mb-2">
          {card.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed mb-4">{card.description}</p>

        {/* Author + Actions */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="font-mono-custom text-[10px] text-accent font-bold">
                {card.author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-text leading-none">{card.author}</p>
              <p className="font-mono-custom text-[10px] text-muted leading-none mt-0.5">
                {card.authorHandle}
              </p>
            </div>
          </div>

          {/* Like button */}
          <div className="flex items-center gap-2">
            {/* Micro-payment badge */}
            <span className="font-mono-custom text-[10px] text-muted/60 hidden sm:block">
              $0.01 USDC
            </span>

            <button
              onClick={handleLike}
              disabled={disabled || liked || loading}
              aria-label={liked ? "Already tipped" : disabled ? "Weekly limit reached" : "Send tip"}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                font-mono-custom transition-all duration-200 select-none
                ${
                  disabled && !liked
                    ? "border border-danger/30 text-danger/50 bg-danger/5 cursor-not-allowed"
                    : liked
                    ? "border border-accent/40 text-accent/70 bg-accent/5 cursor-default"
                    : loading
                    ? "border border-border text-muted bg-surface cursor-wait"
                    : "border border-border text-muted bg-surface hover:border-accent/50 hover:text-accent hover:bg-accent/5 active:scale-95 cursor-pointer"
                }
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span>Signing…</span>
                </>
              ) : liked ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Tipped</span>
                </>
              ) : disabled ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Blocked</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17H8.073a2 2 0 01-1.997-1.858l-.267-3.414A3.5 3.5 0 015 9V7a1 1 0 011-1h3.818a1 1 0 00.949-.684L11 3z" />
                  </svg>
                  <span>{localLikes.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* State feedback overlay */}
      {(state === "success" || state === "blocked" || state === "error") && (
        <div
          className={`absolute bottom-0 left-0 right-0 py-1.5 text-center font-mono-custom text-[11px] font-medium animate-fade-up ${
            state === "success"
              ? "bg-accent/15 text-accent border-t border-accent/20"
              : state === "blocked"
              ? "bg-danger/15 text-danger border-t border-danger/20"
              : "bg-yellow-400/15 text-yellow-400 border-t border-yellow-400/20"
          }`}
        >
          {state === "success" && "✓ $0.01 USDC sent via OWS"}
          {state === "blocked" && "⚡ Payment blocked — weekly limit reached"}
          {state === "error" && "⚠ Payment failed — try again"}
        </div>
      )}
    </div>
  );
}
