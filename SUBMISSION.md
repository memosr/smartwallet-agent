# SmartWallet Agent — Hackathon Submission

## One-liner
An AI wallet agent that automatically tips content creators and blocks your own overspending — without ever touching your private key.

## The Problem
AI agents and private keys are a dangerous combination. Today, most agent setups require dropping a private key into an .env file — giving the AI unlimited access to your funds. Meanwhile, creator tipping remains entirely manual and rarely happens.

## The Solution
SmartWallet Agent uses OWS to give an AI agent exactly the right amount of wallet access — no more, no less.

Two rules govern the agent:
- **Tip rule:** When a user likes a piece of content, the AI automatically sends $0.01 USDC to the creator via OWS — no manual action required.
- **Guard rule:** If the user's weekly spending exceeds $50, the AI refuses to sign any further transactions and blocks the request.

The private key never leaves the local OWS vault. The agent holds only a scoped API key that can request signatures — it cannot extract, export, or misuse the key.

## Why It's Different
Most hackathon projects demonstrate AI *doing* something with a wallet. SmartWallet Agent demonstrates AI *being constrained* by a wallet. The guard rule — where the AI refuses its own user's request — is the core demo moment. It shows OWS not as a convenience layer, but as a trust boundary.

## OWS Integration
- Wallet and agent key created via OWS CLI
- All signing requests go through `POST /v1/sign` with `Authorization: Bearer {OWS_TOKEN}`
- Token is server-side only — never exposed to the frontend
- Policy enforcement happens before the sign request is made

## Track
AI Agents · Security · Creator Economy

## Links
- GitHub: [repo link]
- Demo video: [video link]
- Live demo: http://localhost:3000
