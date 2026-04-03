/**
 * lib/content.ts
 * Mock content cards for demo purposes.
 */

export interface ContentCard {
  id: string;
  title: string;
  description: string;
  author: string;
  authorHandle: string;
  creatorAddress: string;
  category: string;
  readTime: number; // minutes
  likes: number;
}

export const MOCK_CONTENT: ContentCard[] = [
  {
    id: "content_001",
    title: "Zero-Knowledge Proofs: A Practical Introduction",
    description:
      "Deep dive into zk-SNARKs and how they power privacy-preserving transactions on modern blockchains. Includes working Circom examples.",
    author: "Selim Akar",
    authorHandle: "@selimakar",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    category: "Cryptography",
    readTime: 12,
    likes: 847,
  },
  {
    id: "content_002",
    title: "Building AI Agents That Actually Ship",
    description:
      "Lessons learned from deploying 14 autonomous agents in production. What breaks, what scales, and the patterns that survive contact with reality.",
    author: "Lena Müller",
    authorHandle: "@lenabuilds",
    creatorAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    category: "AI Engineering",
    readTime: 8,
    likes: 2301,
  },
  {
    id: "content_003",
    title: "The Open Wallet Standard and the Future of Value Transfer",
    description:
      "How OWS is redefining micropayments for the creator economy — from tipping protocols to programmable money streams.",
    author: "Kai Tanaka",
    authorHandle: "@kaitanaka",
    creatorAddress: "0xdeadbeef1234567890abcdef1234567890abcdef",
    category: "Web3",
    readTime: 6,
    likes: 512,
  },
];
