import type { InventoryItem } from "./db";

export const initialStock = 10;
export const buyerCount = 20;

export type PurchaseStatus = "purchased" | "sold-out" | "conflict" | "failed";

export interface PurchaseResult {
  buyerId: number;
  status: PurchaseStatus;
  attempts: number;
  observedStock?: number;
  finalStock?: number;
  message?: string;
}

export function createBuyerIds(): number[] {
  return Array.from({ length: buyerCount }, (_, index) => index + 1);
}

export function printSummary(results: PurchaseResult[], finalItem: InventoryItem): void {
  const purchased = countStatus(results, "purchased");
  const soldOut = countStatus(results, "sold-out");
  const conflicts = countStatus(results, "conflict");
  const failed = countStatus(results, "failed");
  const totalAttempts = results.reduce((sum, result) => sum + result.attempts, 0);
  const retriedAttempts = totalAttempts - results.length;

  console.log("");
  console.log("Summary:");
  console.table([
    { status: "purchased", count: purchased },
    { status: "sold-out", count: soldOut },
    { status: "conflict", count: conflicts },
    { status: "failed", count: failed },
  ]);
  console.log(`Total buyers: ${results.length}`);
  console.log(`Total attempts: ${totalAttempts}`);
  console.log(`Retried attempts: ${retriedAttempts}`);
  console.log(`Final stock: ${finalItem.stock}`);
  console.log(`Final version: ${finalItem.version}`);
}

function countStatus(results: PurchaseResult[], status: PurchaseStatus): number {
  return results.filter((result) => result.status === status).length;
}
