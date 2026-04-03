const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

async function redisCommand(command: unknown[]): Promise<unknown> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = await res.json();
  return data.result;
}

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
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return `week:${start.getTime()}`;
}

export async function getWeeklyTotal(): Promise<number> {
  const val = await redisCommand(["GET", getWeekKey()]);
  return val ? parseFloat(val as string) : 0;
}

export async function addToWeeklyTotal(amount: number): Promise<void> {
  const key = getWeekKey();
  await redisCommand(["INCRBYFLOAT", key, amount.toString()]);
  await redisCommand(["EXPIRE", key, "604800"]);
}

export async function wouldExceedLimit(amount: number): Promise<boolean> {
  const limit = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");
  const total = await getWeeklyTotal();
  return total + amount > limit;
}

export async function addTransaction(tx: Transaction): Promise<void> {
  await redisCommand(["LPUSH", "transactions", JSON.stringify(tx)]);
  await redisCommand(["LTRIM", "transactions", "0", "49"]);
}

export async function getTransactions(): Promise<Transaction[]> {
  const items = await redisCommand(["LRANGE", "transactions", "0", "49"]) as string[];
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => typeof item === "string" ? JSON.parse(item) : item);
}

export function generateId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
