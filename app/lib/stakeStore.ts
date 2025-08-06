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
  
  console.log(`📋 [STORE] Added stake request for ${walletAddress}:`, {
    ratio: ratio.toFixed(3),
    solAmount,
    expectedRSOL: expectedRSOL.toFixed(6),
    timestamp: new Date(stakeRequest.timestamp).toISOString()
  });
  console.log(`📊 [STORE] Total pending requests: ${pendingStakes.size}`);
  
  // Clean up old requests (older than 10 minutes)
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  for (const [key, request] of pendingStakes.entries()) {
    if (request.timestamp < tenMinutesAgo) {
      console.log(`🗑️ [STORE] Cleaning up old request for ${key}`);
      pendingStakes.delete(key);
    }
  }
  
  return stakeRequest;
}

export function getStakeRequest(walletAddress: string): StakeRequest | undefined {
  console.log(`🔍 [STORE] Looking for stake request for ${walletAddress}`);
  console.log(`📊 [STORE] Current pending requests: ${pendingStakes.size}`);
  
  // Debug: log all pending requests
  for (const [key, request] of pendingStakes.entries()) {
    console.log(`   - ${key}: ratio ${request.ratio.toFixed(3)}, ${request.solAmount} SOL, age: ${(Date.now() - request.timestamp) / 1000}s`);
  }
  
  const request = pendingStakes.get(walletAddress);
  
  if (!request) {
    console.log(`❌ [STORE] No request found for ${walletAddress}`);
    return undefined;
  }
  
  // Remove if older than 10 minutes
  if (request.timestamp < Date.now() - (10 * 60 * 1000)) {
    console.log(`⏰ [STORE] Request for ${walletAddress} is too old (${(Date.now() - request.timestamp) / 1000}s), removing`);
    pendingStakes.delete(walletAddress);
    return undefined;
  }
  
  console.log(`✅ [STORE] Found valid request for ${walletAddress}:`, {
    ratio: request.ratio.toFixed(3),
    solAmount: request.solAmount,
    expectedRSOL: request.expectedRSOL.toFixed(6),
    age: `${(Date.now() - request.timestamp) / 1000}s`
  });
  
  return request;
}

export function removeStakeRequest(walletAddress: string): void {
  console.log(`🗑️ [STORE] Removing stake request for ${walletAddress}`);
  const existed = pendingStakes.delete(walletAddress);
  console.log(`📊 [STORE] Request ${existed ? 'successfully removed' : 'was not found'}. Remaining requests: ${pendingStakes.size}`);
}

export function getAllPendingStakes(): StakeRequest[] {
  return Array.from(pendingStakes.values());
}
