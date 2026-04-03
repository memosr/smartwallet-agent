import { NextResponse } from "next/server";

export async function GET() {
  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!REDIS_URL || !REDIS_TOKEN) {
    return NextResponse.json({ error: "env vars missing", REDIS_URL: !!REDIS_URL, REDIS_TOKEN: !!REDIS_TOKEN });
  }

  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["LRANGE", "transactions", "0", "49"]),
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json({ status: res.status, data });
}
