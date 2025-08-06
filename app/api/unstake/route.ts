import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  createBurnInstruction,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';
import { decode as bs58Decode } from 'bs58';

interface UnstakeRequest {
  walletAddress: string;
  rsolAmount: number; // in token units (with decimals)
  ratio: number; // ratio to calculate SOL return
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🔥 [${requestId}] Unstake request received at ${new Date().toISOString()}`);
  
  try {
    // Validate environment variables
    if (!process.env.WALLET_PUBLIC_KEY || !process.env.WALLET_PRIVATE_KEY || !process.env.TOKEN_MINT_ADDRESS) {
      console.error(`❌ [${requestId}] Missing required environment variables`);
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error',
        requestId 
      }, { status: 500 });
    }

    const body: UnstakeRequest = await request.json();
    console.log(`📦 [${requestId}] Unstake request:`, body);

    const { walletAddress, rsolAmount, ratio } = body;

    // Validate request data
    if (!walletAddress || !rsolAmount || !ratio || rsolAmount <= 0 || ratio <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request data: walletAddress, rsolAmount, and ratio are required',
        requestId 
      }, { status: 400 });
    }

    // Calculate SOL to return based on ratio
    const solToReturn = Math.floor(rsolAmount / ratio);
    
    console.log(`🔢 [${requestId}] Calculation: ${rsolAmount / 1e9} RSOL ÷ ${ratio}x = ${solToReturn / 1e9} SOL`);

    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    // Create keypair from private key
    const wallet = Keypair.fromSecretKey(bs58Decode(process.env.WALLET_PRIVATE_KEY!));
    const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS || '');
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
    let userTokenAccount;
    try {
      userTokenAccount = await getAccount(connection, userTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
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

    // Check if we have enough SOL to return
    const walletBalance = await connection.getBalance(wallet.publicKey);
    console.log(`💰 [${requestId}] Platform wallet balance: ${walletBalance / 1e9} SOL`);
    
    if (walletBalance < solToReturn + 5000000) { // 0.005 SOL for transaction fees
      return NextResponse.json({ 
        success: false, 
        error: 'Platform has insufficient SOL balance for this unstaking request',
        requestId 
      }, { status: 500 });
    }

    // Create the unstake transaction
    const transaction = new Transaction();

    // 1. Burn the RSOL tokens
    console.log(`🔥 [${requestId}] Adding burn instruction for ${rsolAmount / 1e9} RSOL tokens...`);
    const burnInstruction = createBurnInstruction(
      userTokenAddress, // account
      mintAddress, // mint
      userPublicKey, // owner
      rsolAmount, // amount
      [], // multiSigners
      TOKEN_2022_PROGRAM_ID // programId
    );
    transaction.add(burnInstruction);

    // 2. Transfer SOL back to user
    console.log(`💸 [${requestId}] Adding SOL transfer instruction for ${solToReturn / 1e9} SOL...`);
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

    // Estimate transaction fee
    const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage());
    console.log(`💰 [${requestId}] Estimated transaction fee: ${(feeEstimate?.value || 0) / 1e9} SOL`);

    // Sign and send transaction
    transaction.sign(wallet);
    const unstakeTx = await connection.sendRawTransaction(transaction.serialize());

    console.log(`🎉 [${requestId}] Successfully processed unstaking`);
    console.log(`🔥 [${requestId}] Burned: ${rsolAmount / 1e9} RSOL tokens`);
    console.log(`💸 [${requestId}] Returned: ${solToReturn / 1e9} SOL`);
    console.log(`📝 [${requestId}] Transaction signature: ${unstakeTx}`);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return NextResponse.json({ 
      success: true, 
      message: 'Unstaking completed successfully',
      transactionSignature: unstakeTx,
      rsolBurned: rsolAmount / 1e9,
      solReturned: solToReturn / 1e9,
      ratio: ratio,
      requestId,
      processingTimeMs: processingTime
    });

  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.error(`💥 [${requestId}] Unstaking error after ${processingTime}ms:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process unstaking request',
      requestId,
      processingTimeMs: processingTime
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`🏥 Unstake API health check requested at ${timestamp}`);
  
  return NextResponse.json({ 
    status: 'Unstake API endpoint is running',
    timestamp,
    environment: {
      hasWalletPublicKey: !!process.env.WALLET_PUBLIC_KEY,
      hasWalletPrivateKey: !!process.env.WALLET_PRIVATE_KEY,
      hasTokenMintAddress: !!process.env.TOKEN_MINT_ADDRESS,
      hasAlchemyEndpoint: !!process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT
    }
  });
}
