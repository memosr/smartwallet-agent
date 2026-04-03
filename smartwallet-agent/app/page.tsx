"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SpendingHeader } from "./components/SpendingHeader";
import { ContentCardComponent } from "./components/ContentCard";
import { TransactionLog } from "./components/TransactionLog";
import { MOCK_CONTENT } from "@/lib/content";
import type { Transaction } from "@/lib/store";

const WEEKLY_LIMIT = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");
const POLL_INTERVAL = 4000; // ms

export default function Home() {
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLimitReached = weeklyTotal >= WEEKLY_LIMIT;

  // Fetch state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) return;
      const data = await res.json();
      setWeeklyTotal(data.weeklyTotal ?? 0);
      setTransactions(data.transactions ?? []);
      setLastUpdated(new Date());
    } catch {
      // silent fail — user still sees cached state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchState();
    pollRef.current = setInterval(fetchState, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchState]);

  // Handle like → micro-payment
  const handleLike = useCallback(
    async (contentId: string, contentTitle: string, creatorAddress: string) => {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, contentTitle, creatorAddress }),
      });

      const data = await res.json();

      if (res.status === 403) {
        // Optimistically update total to limit so UI reflects blocked state
        setWeeklyTotal(WEEKLY_LIMIT);
        await fetchState();
        const err = new Error("weekly_limit_exceeded");
        err.message = "weekly_limit_exceeded";
        throw err;
      }

      if (!res.ok) {
        throw new Error(data.message ?? "Payment failed");
      }

      // Optimistic update
      setWeeklyTotal(data.weeklyTotal ?? weeklyTotal);
      // Refresh full state
      await fetchState();
    },
    [fetchState, weeklyTotal]
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/2 rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path d="M1 4.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 2H3.25A2.25 2.25 0 001 4.25zM1 7.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 5H3.25A2.25 2.25 0 001 7.25zM7 8a1 1 0 011 1 2 2 0 104 0 1 1 0 011-1h3.75A2.25 2.25 0 0119 10.25v5.5A2.25 2.25 0 0116.75 18H3.25A2.25 2.25 0 011 15.75v-5.5A2.25 2.25 0 013.25 8H7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-mono-custom text-sm font-semibold text-text leading-none">
                SmartWallet
              </h1>
              <p className="font-mono-custom text-[10px] text-muted leading-none mt-0.5">
                agent / v1.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* OWS badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono-custom text-[10px] text-muted">OWS</span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  loading ? "bg-yellow-400 animate-pulse" : "bg-accent animate-pulse"
                }`}
              />
              <span className="font-mono-custom text-[10px] text-muted">
                {loading ? "syncing" : "live"}
              </span>
            </div>
          </div>
        </header>

        {/* ── Spending Header ─────────────────────────────────── */}
        <SpendingHeader
          weeklyTotal={weeklyTotal}
          limit={WEEKLY_LIMIT}
          isLimitReached={isLimitReached}
        />

        {/* ── Section label ───────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-custom text-xs text-muted uppercase tracking-widest">
            Featured Content
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono-custom text-[10px] text-muted/50">
            tap ♥ to tip $0.01
          </span>
        </div>

        {/* ── Content Cards ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-8">
          {MOCK_CONTENT.map((card) => (
            <ContentCardComponent
              key={card.id}
              card={card}
              disabled={isLimitReached}
              onLike={handleLike}
            />
          ))}
        </div>

        {/* ── Transaction Log ─────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-custom text-xs text-muted uppercase tracking-widest">
            Transaction Log
          </span>
          <div className="flex-1 h-px bg-border" />
          {lastUpdated && (
            <span className="font-mono-custom text-[10px] text-muted/40">
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <TransactionLog transactions={transactions} />

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono-custom text-[10px] text-muted/40 text-center sm:text-left">
            Powered by{" "}
            <span className="text-accent/50">Open Wallet Standard</span> ·
            Payments settled on-chain
          </div>
          <div className="font-mono-custom text-[10px] text-muted/30">
            {process.env.NEXT_PUBLIC_WEEKLY_LIMIT &&
              `Weekly limit: $${process.env.NEXT_PUBLIC_WEEKLY_LIMIT}`}
          </div>
        </footer>
      </div>
    </div>
  );
}
