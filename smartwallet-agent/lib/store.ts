import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

function getWeekKey(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return `week:${start.getTime()}`;
}

export async function getWeeklyTotal(): Promise<number> {
  const val = await redis.get<number>(getWeekKey());
  return val ?? 0;
}

export async function addToWeeklyTotal(amount: number): Promise<void> {
  const key = getWeekKey();
  await redis.incrbyfloat(key, amount);
  await redis.expire(key, 60 * 60 * 24 * 7);
}

export async function wouldExceedLimit(amount: number): Promise<boolean> {
  const limit = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");
  const total = await getWeeklyTotal();
  return total + amount > limit;
}

export async function addTransaction(tx: Transaction): Promise<void> {
  await redis.lpush("transactions", JSON.stringify(tx));
  await redis.ltrim("transactions", 0, 49);
}

export async function getTransactions(): Promise<Transaction[]> {
  const items = await redis.lrange<string>("transactions", 0, 49);
  return items.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
}

export function generateId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
