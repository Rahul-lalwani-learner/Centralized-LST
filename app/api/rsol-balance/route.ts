import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }

    if (!process.env.TOKEN_MINT_ADDRESS) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token mint address not configured' 
      }, { status: 500 });
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS);
    const userPublicKey = new PublicKey(walletAddress);

    // Get user's RSOL token account
    const tokenAddress = await getAssociatedTokenAddress(
      mintAddress,
      userPublicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    try {
      const tokenAccount = await getAccount(connection, tokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      const balance = Number(tokenAccount.amount);
      
      console.log(`💰 RSOL Balance for ${walletAddress}: ${balance / 1e9} RSOL`);
      
      return NextResponse.json({ 
        success: true, 
        balance: balance,
        balanceInSOL: balance / 1e9,
        tokenAddress: tokenAddress.toString()
      });
    } catch {
      // Token account doesn't exist or has no balance
      console.log(`💰 No RSOL tokens found for ${walletAddress}`);
      return NextResponse.json({ 
        success: true, 
        balance: 0,
        balanceInSOL: 0,
        tokenAddress: tokenAddress.toString(),
        note: 'No RSOL token account found'
      });
    }

  } catch (error) {
    console.error('Error fetching RSOL balance:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch RSOL balance' 
    }, { status: 500 });
  }
}
