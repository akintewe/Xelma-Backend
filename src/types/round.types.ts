import { Request } from "express";
import { UserRole } from "@prisma/client";

export enum GameMode {
  UP_DOWN = 0,
  LEGENDS = 1,
}

export interface PriceRange {
  min: number;
  max: number;
  [key: string]: unknown;
}

export interface RoundPriceRange extends PriceRange {
  pool: number;
}

export interface UserPriceRange extends PriceRange {}

export function isRoundPriceRange(value: unknown): value is RoundPriceRange {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.min === "number" &&
    typeof obj.max === "number" &&
    typeof obj.pool === "number" &&
    obj.min < obj.max
  );
}

export function isUserPriceRange(value: unknown): value is UserPriceRange {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.min === "number" &&
    typeof obj.max === "number" &&
    obj.min < obj.max
  );
}

export function isRoundPriceRangeArray(value: unknown): value is RoundPriceRange[] {
  return Array.isArray(value) && value.every(isRoundPriceRange);
}

export enum RoundStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  CANCELLED = "CANCELLED",
}

export enum RoundLifecycleOutcome {
  UPDATED = "updated",
  ALREADY_LOCKED = "already_locked",
  ALREADY_RESOLVED = "already_resolved",
  NO_OP = "no_op",
}

export enum BetSide {
  UP = "up",
  DOWN = "down",
}

export interface StartRoundRequestBody {
  startPrice: string;
  durationLedgers: number;
  mode: GameMode;
  priceRanges?: { min: number; max: number }[];
}

export interface StartRoundResponse {
  roundId: string;
  startPrice: bigint;
  endLedger: number;
  mode: GameMode;
  createdAt: string;
}

export interface SubmitPredictionRequestBody {
  roundId: string;
  side?: BetSide;
  priceRange?: { min: number; max: number };
  amount: number;
  mode: GameMode;
}

export interface SubmitPredictionResponse {
  predictionId: string;
  roundId: string;
  side: BetSide;
  amount: number;
  txHash: string;
}

export interface ResolveRoundRequestBody {
  roundId: string;
  finalPrice: string;
  mode: GameMode;
}

export interface ResolveRoundResponse {
  roundId: string;
  outcome: BetSide | null;
  winningRange?: { min: number; max: number } | null;
  winnersCount: number;
  losersCount: number;
  txHash: string;
}

export interface ActiveRoundResponse {
  roundId: string;
  startPrice: bigint;
  poolUp: bigint;
  poolDown: bigint;
  endLedger: number;
  mode: GameMode;
}

export interface RoundRequest extends Request {
  user?: {
    userId: string;
    walletAddress: string;
    role: UserRole;
  };
}
