import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  createBurnInstruction,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';

interface PrepareUnstakeRequest {
  walletAddress: string;
  rsolAmount: number; // in token units (with decimals)
  ratio: number; // ratio to calculate SOL return
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🔥 [${requestId}] Prepare unstake request received at ${new Date().toISOString()}`);
  
  try {
    if (!process.env.TOKEN_MINT_ADDRESS) {
      console.error(`❌ [${requestId}] Missing TOKEN_MINT_ADDRESS`);
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error',
        requestId 
      }, { status: 500 });
    }

    const body: PrepareUnstakeRequest = await request.json();
    console.log(`📦 [${requestId}] Prepare unstake request:`, body);

    const { walletAddress, rsolAmount, ratio } = body;

    // Validate request data
    if (!walletAddress || !rsolAmount || !ratio || rsolAmount <= 0 || ratio <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request data: walletAddress, rsolAmount, and ratio are required',
        requestId 
      }, { status: 400 });
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS);
    const userPublicKey = new PublicKey(walletAddress);

    // Get user's token account
    const userTokenAddress = await getAssociatedTokenAddress(
      mintAddress,
      userPublicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(`🔍 [${requestId}] User token account: ${userTokenAddress.toString()}`);

    // Check if user has enough RSOL tokens
    try {
      const userTokenAccount = await getAccount(connection, userTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      console.log(`💰 [${requestId}] User token balance: ${Number(userTokenAccount.amount) / 1e9} RSOL`);
      
      if (Number(userTokenAccount.amount) < rsolAmount) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient RSOL balance. Required: ${rsolAmount / 1e9}, Available: ${Number(userTokenAccount.amount) / 1e9}`,
          requestId 
        }, { status: 400 });
      }
    } catch (error) {
      console.error(`❌ [${requestId}] Error getting user token account:`, error);
      return NextResponse.json({ 
        success: false, 
        error: 'User does not have RSOL tokens or token account not found',
        requestId 
      }, { status: 400 });
    }

    // Create burn transaction for user to sign
    const transaction = new Transaction();

    console.log(`🔥 [${requestId}] Creating burn instruction for ${rsolAmount / 1e9} RSOL tokens...`);
    const burnInstruction = createBurnInstruction(
      userTokenAddress, // account
      mintAddress, // mint
      userPublicKey, // owner
      rsolAmount, // amount
      [], // multiSigners
      TOKEN_2022_PROGRAM_ID // programId
    );
    transaction.add(burnInstruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    // Calculate SOL to return
    const solToReturn = Math.floor(rsolAmount / ratio);
    
    console.log(`🔢 [${requestId}] Calculation: ${rsolAmount / 1e9} RSOL ÷ ${ratio}x = ${solToReturn / 1e9} SOL`);

    // Serialize transaction for user to sign
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');

    return NextResponse.json({ 
      success: true, 
      message: 'Burn transaction prepared',
      transaction: serializedTransaction,
      rsolToBurn: rsolAmount / 1e9,
      solToReceive: solToReturn / 1e9,
      ratio: ratio,
      requestId
    });

  } catch (error) {
    console.error(`💥 [${requestId}] Prepare unstake error:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to prepare unstake transaction',
      requestId
    }, { status: 500 });
  }
}
