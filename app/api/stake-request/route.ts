import { NextRequest, NextResponse } from 'next/server';
import { addStakeRequest } from '../../lib/stakeStore';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, yield: yieldPercent, solAmount } = await request.json();
    
    if (!walletAddress || yieldPercent === undefined || !solAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: walletAddress, yield, solAmount' 
      }, { status: 400 });
    }

  // Calculate ratio from yield
  const ratio = 1 + (yieldPercent / 100);

  // RSOL = SOL / (1 + yield/100)
  const rsolAmount = solAmount / ratio;
  const stakeRequest = addStakeRequest(walletAddress, ratio, rsolAmount);

  console.log(`📋 Stake request stored: ${walletAddress} - ${solAmount} SOL, ${rsolAmount} RSOL at ${ratio}x ratio (yield: ${yieldPercent}%)`);
    
    return NextResponse.json({ 
      success: true, 
      stakeRequest 
    });
  } catch (error) {
    console.error('Error storing stake request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to store stake request' 
    }, { status: 500 });
  }
}
