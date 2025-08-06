import { NextRequest, NextResponse } from 'next/server';
import { addStakeRequest } from '../../lib/stakeStore';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, ratio, solAmount } = await request.json();
    
    if (!walletAddress || !ratio || !solAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: walletAddress, ratio, solAmount' 
      }, { status: 400 });
    }

    const stakeRequest = addStakeRequest(walletAddress, ratio, solAmount);
    
    console.log(`📋 Stake request stored: ${walletAddress} - ${solAmount} SOL at ${ratio}x ratio`);
    
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
