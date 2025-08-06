import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
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
    let userTokenBalance = 0;
    try {
      const userTokenAccount = await getAccount(connection, userTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      userTokenBalance = Number(userTokenAccount.amount);
      console.log(`💰 [${requestId}] User token balance: ${userTokenBalance / 1e9} RSOL`);
    } catch {
      console.log(`💰 [${requestId}] No RSOL token account found for user: ${walletAddress}`);
      return NextResponse.json({ 
        success: false, 
        error: 'No RSOL tokens found or account does not exist',
        requestId 
      }, { status: 400 });
    }
    
    if (userTokenBalance < rsolAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient RSOL balance. Required: ${rsolAmount / 1e9}, Available: ${userTokenBalance / 1e9}`,
        requestId 
      }, { status: 400 });
    }

    // Create burn transaction for user to sign
    const transaction = new Transaction();

    // Add a unique memo to ensure transaction uniqueness
    const uniqueMemo = `unstake-${requestId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    console.log(`📝 [${requestId}] Adding unique memo: ${uniqueMemo}`);
    
    // Create memo instruction to make transaction unique
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(uniqueMemo, 'utf-8'),
    });
    transaction.add(memoInstruction);

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
