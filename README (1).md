# SmartWallet Agent

> AI-powered micropayment & spending guard — built on Open Wallet Standard

SmartWallet Agent is a dual-purpose AI wallet agent: it automatically tips content creators when you like their work, and blocks your own transactions when you exceed your weekly spending limit. The private key never leaves your vault — OWS handles every signature.

---

## The Problem

Two unsolved problems in crypto UX today:

1. **Creators don't get paid for good content.** Tipping is manual, friction-heavy, and almost never happens.
2. **AI agents are dangerous with money.** If an AI agent has access to your private key, it has access to everything.

SmartWallet Agent solves both — with one OWS-powered flow.

---

## How It Works

```
User likes content
      ↓
AI agent checks weekly spending total
      ↓
Under limit?  → OWS signs transaction → $0.01 USDC sent to creator  ✅
Over limit?   → OWS refuses to sign  → Transaction blocked           🚫
      ↓
Private key never exposed at any point
```

### Two Rules, One Agent

| Rule | Trigger | Action |
|---|---|---|
| **Tip rule** | Content receives a like | AI sends $0.01 USDC to creator via OWS |
| **Guard rule** | Weekly spend exceeds $50 | AI refuses to sign — transaction blocked |

---

## Why OWS?

Traditional AI agent approach:
```
AI agent → reads .env → gets private key → signs anything
```

SmartWallet Agent with OWS:
```
AI agent → sends sign request → OWS checks policy → signs only if rules pass
```

The private key stays in the local vault. The agent token (`ows_key_...`) can only trigger signing — it cannot extract the key. This is exactly what OWS was built for.

---

## Demo

1. Open the app — weekly budget tracker shows `$0.00 / $50`
2. Click the like button on any content card
3. AI agent fires → OWS signs → `+$0.01` appears in transaction log
4. Keep liking until the $50 limit is hit
5. Next like attempt → AI blocks it → red animation → `0 blocked` counter increments

---

## Tech Stack

- **Next.js 14** (App Router)
- **Open Wallet Standard (OWS)** — signing & key management
- **Tailwind CSS** — UI
- **TypeScript** — throughout

### Key Files

```
lib/ows.ts          → OWS API integration (sign endpoint)
lib/store.ts        → In-memory weekly spend tracker
app/api/like/       → Core logic: limit check → OWS sign → log
app/api/transactions/ → Transaction history endpoint
app/components/     → SpendingHeader, ContentCard, TransactionLog
```

---

## Setup

```bash
# 1. Install OWS CLI
npm install -g @open-wallet-standard/core

# 2. Create wallet & agent key
ows wallet create --name smartwallet-agent
ows key create --name smartwallet-agent --wallet smartwallet-agent

# 3. Add to .env.local
OWS_TOKEN=your_token_here
OWS_WALLET_ADDRESS=your_address_here
NEXT_PUBLIC_WEEKLY_LIMIT=50
NEXT_PUBLIC_TIP_AMOUNT=0.01

# 4. Run
npm install
npm run dev
```

---

## Security Model

- OWS token lives only in `.env.local` — never sent to the client
- All OWS calls go through Next.js API routes (server-side only)
- Agent can request signatures, but cannot extract the private key
- Weekly limit is enforced before any sign request is made

---

## What's Next

- Real USDC transfers on Base or Arbitrum
- Per-creator tip limits
- Telegram notifications when limit is approaching
- Multi-wallet support for team budgets

---

Built for the **OWS Hackathon 2026** · Powered by [Open Wallet Standard](https://openwallet.sh)
