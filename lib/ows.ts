/**
 * lib/ows.ts
 * OWS (Open Wallet Standard) integration — server-side only.
 * Token is read from env and never exposed to the client.
 */

const OWS_BASE_URL = "https://api.openwallet.sh";
const OWS_TOKEN = process.env.OWS_TOKEN!;
const OWS_WALLET_ADDRESS = process.env.OWS_WALLET_ADDRESS!;

export interface OWSSignPayload {
  from: string;
  to: string;
  amount: number;
  currency: string;
  memo?: string;
}

export interface OWSSignResponse {
  success: boolean;
  txHash?: string;
  signedAt?: string;
  error?: string;
  mock?: boolean;
}

/**
 * Signs and broadcasts a micro-payment via OWS /v1/sign endpoint.
 * Falls back to a mock response if the API is unreachable (demo mode).
 */
export async function owsSign(payload: OWSSignPayload): Promise<OWSSignResponse> {
  if (!OWS_TOKEN || !OWS_WALLET_ADDRESS) {
    throw new Error("OWS environment variables are not configured.");
  }

  const body = {
    from: OWS_WALLET_ADDRESS,
    to: payload.to,
    amount: payload.amount,
    currency: payload.currency,
    memo: payload.memo ?? "SmartWallet micro-tip",
  };

  try {
    const res = await fetch(`${OWS_BASE_URL}/v1/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OWS_TOKEN}`,
      },
      body: JSON.stringify(body),
      // 8-second timeout so the UI doesn't hang
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown error");
      console.warn(`[OWS] API responded ${res.status}: ${errText}`);
      // Fall through to mock
      return mockOWSResponse(payload);
    }

    const data = await res.json();
    return {
      success: true,
      txHash: data.txHash ?? data.tx_hash ?? data.hash,
      signedAt: data.signedAt ?? data.signed_at ?? new Date().toISOString(),
    };
  } catch (err) {
    // Network error or timeout → use mock so demo always works
    console.warn("[OWS] API unreachable, using mock response:", err);
    return mockOWSResponse(payload);
  }
}

/**
 * Generates a deterministic-looking mock transaction hash for demo purposes.
 */
function mockOWSResponse(payload: OWSSignPayload): OWSSignResponse {
  const randomHex = () =>
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  const txHash = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;

  return {
    success: true,
    txHash,
    signedAt: new Date().toISOString(),
    mock: true,
  };
}

/**
 * Returns the configured wallet address (used in API routes to set `from`).
 */
export function getWalletAddress(): string {
  return OWS_WALLET_ADDRESS;
}
