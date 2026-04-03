"use client";

import { useEffect, useRef } from "react";
import type { Transaction } from "@/lib/store";

interface TransactionLogProps {
  transactions: Transaction[];
}

function shortHash(hash: string | undefined): string {
  if (!hash) return "—";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function TransactionLog({ transactions }: TransactionLogProps) {
  const prevLengthRef = useRef(transactions.length);
  const newCount = transactions.length - prevLengthRef.current;
  useEffect(() => {
    prevLengthRef.current = transactions.length;
  }, [transactions.length]);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono-custom text-xs uppercase tracking-widest text-muted">
            Transaction Log
          </span>
        </div>
        <span className="font-mono-custom text-xs text-muted">
          {transactions.length} event{transactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Transactions */}
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-mono-custom text-xs text-muted/50">
              No transactions yet. Tip some content!
            </p>
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                idx < newCount ? "animate-slide-in" : ""
              } ${
                tx.status === "blocked"
                  ? "bg-danger/3 hover:bg-danger/5"
                  : "hover:bg-white/2"
              }`}
            >
              {/* Status dot */}
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  tx.status === "approved" ? "bg-accent" : "bg-danger"
                }`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text truncate leading-none mb-0.5">
                  {tx.contentTitle}
                </p>
                <p className="font-mono-custom text-[10px] text-muted/70 truncate">
                  {tx.status === "blocked" ? (
                    <span className="text-danger/70">blocked · limit reached</span>
                  ) : (
                    <>
                      {shortHash(tx.txHash)}
                      {tx.mock && (
                        <span className="ml-1 text-muted/40">[mock]</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={`font-mono-custom text-xs font-semibold ${
                    tx.status === "approved" ? "text-accent" : "text-danger"
                  }`}
                >
                  {tx.status === "blocked" ? "—" : `+$${tx.amount.toFixed(2)}`}
                </p>
                <p className="font-mono-custom text-[10px] text-muted/50 mt-0.5">
                  {timeAgo(tx.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer summary */}
      {transactions.length > 0 && (
        <div className="px-5 py-2 border-t border-border bg-bg/50 flex items-center justify-between">
          <span className="font-mono-custom text-[10px] text-muted/50">
            {transactions.filter((t) => t.status === "approved").length} approved ·{" "}
            {transactions.filter((t) => t.status === "blocked").length} blocked
          </span>
          <span className="font-mono-custom text-[10px] text-accent/70">
            total: $
            {transactions
              .filter((t) => t.status === "approved")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}{" "}
            USDC
          </span>
        </div>
      )}
    </div>
  );
}
