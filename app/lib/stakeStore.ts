// Simple in-memory store for pending stake requests
interface StakeRequest {
  walletAddress: string;
  ratio: number;
  timestamp: number;
  solAmount: number;
  expectedRSOL: number;
}

const pendingStakes = new Map<string, StakeRequest>();

export function addStakeRequest(walletAddress: string, ratio: number, solAmount: number) {
  const expectedRSOL = solAmount * ratio;
  const stakeRequest: StakeRequest = {
    walletAddress,
    ratio,
    timestamp: Date.now(),
    solAmount,
    expectedRSOL
  };
  
  // Use wallet address as key since we expect one stake at a time per wallet
  pendingStakes.set(walletAddress, stakeRequest);
  
  // Clean up old requests (older than 10 minutes)
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  for (const [key, request] of pendingStakes.entries()) {
    if (request.timestamp < tenMinutesAgo) {
      pendingStakes.delete(key);
    }
  }
  
  return stakeRequest;
}

export function getStakeRequest(walletAddress: string): StakeRequest | undefined {
  const request = pendingStakes.get(walletAddress);
  
  // Remove if older than 10 minutes
  if (request && request.timestamp < Date.now() - (10 * 60 * 1000)) {
    pendingStakes.delete(walletAddress);
    return undefined;
  }
  
  return request;
}

export function removeStakeRequest(walletAddress: string): void {
  pendingStakes.delete(walletAddress);
}

export function getAllPendingStakes(): StakeRequest[] {
  return Array.from(pendingStakes.values());
}
