/**
 * lib/store.ts
 * In-memory state management for weekly spending limits and transaction log.
 * Uses a module-level singleton that persists across requests within a single
 * Next.js server process (resets on cold start / deploy — acceptable for demo).
 */

export interface Transaction {
  id: string;
  contentId: string;
  contentTitle: string;
  creatorAddress: string;
  amount: number;
  currency: string;
  status: "approved" | "blocked";
  txHash?: string;
  mock?: boolean;
  timestamp: string;
}

interface SpendingState {
  weeklyTotal: number;
  weekStart: number; // timestamp when current week began
  transactions: Transaction[];
}

// Module-level singleton
const state: SpendingState = {
  weeklyTotal: 0,
  weekStart: getWeekStart(),
  transactions: [],
};

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/**
 * Resets the weekly counter if we've crossed into a new week.
 */
function maybeResetWeek(): void {
  const currentWeekStart = getWeekStart();
  if (currentWeekStart > state.weekStart) {
    state.weeklyTotal = 0;
    state.weekStart = currentWeekStart;
  }
}

/**
 * Returns the current weekly spend total (resets if new week).
 */
export function getWeeklyTotal(): number {
  maybeResetWeek();
  return state.weeklyTotal;
}

/**
 * Adds an amount to the weekly spend total.
 */
export function addToWeeklyTotal(amount: number): void {
  maybeResetWeek();
  state.weeklyTotal = Math.round((state.weeklyTotal + amount) * 1000) / 1000;
}

/**
 * Appends a transaction to the log (most recent first, capped at 50).
 */
export function addTransaction(tx: Transaction): void {
  state.transactions.unshift(tx);
  if (state.transactions.length > 50) {
    state.transactions.pop();
  }
}

/**
 * Returns a copy of the transaction list.
 */
export function getTransactions(): Transaction[] {
  maybeResetWeek();
  return [...state.transactions];
}

/**
 * Checks whether adding `amount` would exceed the weekly limit.
 */
export function wouldExceedLimit(amount: number): boolean {
  const limit = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");
  maybeResetWeek();
  return state.weeklyTotal + amount > limit;
}

/**
 * Generates a simple unique ID.
 */
export function generateId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
