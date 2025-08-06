import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { decode as bs58Decode } from 'bs58';

interface ConfirmUnstakeRequest {
  walletAddress: string;
  burnTxSignature: string;
  rsolAmount: number;
  ratio: number;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n✅ [${requestId}] Confirm unstake request received at ${new Date().toISOString()}`);
  
  try {
    if (!process.env.WALLET_PUBLIC_KEY || !process.env.WALLET_PRIVATE_KEY) {
      console.error(`❌ [${requestId}] Missing wallet environment variables`);
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error',
        requestId 
      }, { status: 500 });
    }

    const body: ConfirmUnstakeRequest = await request.json();
    console.log(`📦 [${requestId}] Confirm unstake request:`, body);

    const { walletAddress, burnTxSignature, rsolAmount, ratio } = body;

    // Validate request data
    if (!walletAddress || !burnTxSignature || !rsolAmount || !ratio) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields',
        requestId 
      }, { status: 400 });
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    // Verify the burn transaction was successful
    console.log(`🔍 [${requestId}] Verifying burn transaction: ${burnTxSignature}`);
    try {
      const burnTxInfo = await connection.getTransaction(burnTxSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!burnTxInfo || burnTxInfo.meta?.err) {
        return NextResponse.json({ 
          success: false, 
          error: 'Burn transaction failed or not found',
          requestId 
        }, { status: 400 });
      }

      console.log(`✅ [${requestId}] Burn transaction verified successfully`);
    } catch (error) {
      console.error(`❌ [${requestId}] Error verifying burn transaction:`, error);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not verify burn transaction',
        requestId 
      }, { status: 400 });
    }

    // Calculate SOL to return
    const solToReturn = Math.floor(rsolAmount / ratio);
    console.log(`🔢 [${requestId}] Sending ${solToReturn / 1e9} SOL for ${rsolAmount / 1e9} RSOL at ${ratio}x ratio`);

    // Create keypair from private key
    const wallet = Keypair.fromSecretKey(bs58Decode(process.env.WALLET_PRIVATE_KEY!));
    const userPublicKey = new PublicKey(walletAddress);

    // Check platform wallet balance
    const walletBalance = await connection.getBalance(wallet.publicKey);
    console.log(`💰 [${requestId}] Platform wallet balance: ${walletBalance / 1e9} SOL`);
    
    if (walletBalance < solToReturn + 5000000) { // 0.005 SOL for transaction fees
      return NextResponse.json({ 
        success: false, 
        error: 'Platform has insufficient SOL balance for this unstaking request',
        requestId 
      }, { status: 500 });
    }

    // Create SOL transfer transaction
    const transaction = new Transaction();
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: userPublicKey,
      lamports: solToReturn,
    });
    transaction.add(transferInstruction);

    // Get recent blockhash and send transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    transaction.sign(wallet);
    const transferTx = await connection.sendRawTransaction(transaction.serialize());

    console.log(`🎉 [${requestId}] Successfully processed unstaking`);
    console.log(`🔥 [${requestId}] Confirmed burn: ${rsolAmount / 1e9} RSOL (tx: ${burnTxSignature})`);
    console.log(`💸 [${requestId}] Sent: ${solToReturn / 1e9} SOL (tx: ${transferTx})`);

    return NextResponse.json({ 
      success: true, 
      message: 'Unstaking completed successfully',
      burnTxSignature,
      transferTxSignature: transferTx,
      rsolBurned: rsolAmount / 1e9,
      solReturned: solToReturn / 1e9,
      ratio: ratio,
      requestId
    });

  } catch (error) {
    console.error(`💥 [${requestId}] Confirm unstake error:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process unstaking confirmation',
      requestId
    }, { status: 500 });
  }
}
