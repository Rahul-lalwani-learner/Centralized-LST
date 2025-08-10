import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { addWebhookEvent } from '../../lib/webhookStore';
import { getStakeRequest, removeStakeRequest } from '../../lib/stakeStore';
import { decode as bs58Decode } from 'bs58';

// Webhook data interfaces
interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: unknown[];
}

interface NativeTransfer {
  amount: number;
  fromUserAccount: string;
  toUserAccount: string;
}

interface WebhookData {
  accountData: AccountData[];
  description: string;
  events: Record<string, unknown>;
  fee: number;
  feePayer: string;
  instructions: unknown[];
  nativeTransfers: NativeTransfer[];
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: unknown[];
  transactionError: unknown;
  type: string;
}

interface TransactionLog {
  originalTxSignature: string;
  mintTxSignature: string;
  recipientAddress: string;
  solAmount: number;
  rsolAmount: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🚀 [${requestId}] Webhook POST request received at ${new Date().toISOString()}`);
  console.log(`📡 [${requestId}] Request URL: ${request.url}`);
  console.log(`🌐 [${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  // Log incoming webhook event
  addWebhookEvent({
    id: `incoming-${requestId}`,
    timestamp: new Date().toISOString(),
    type: 'incoming',
    data: { url: request.url, headers: Object.fromEntries(request.headers.entries()) },
    requestId
  });
  
  try {
    // Validate that we have the required environment variables
    if (!process.env.WALLET_PUBLIC_KEY || !process.env.WALLET_PRIVATE_KEY || !process.env.TOKEN_MINT_ADDRESS) {
      console.error(`❌ [${requestId}] Missing required environment variables`);
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error',
        requestId 
      }, { status: 500 });
    }

    const body: WebhookData[] = await request.json();
    console.log(`📦 [${requestId}] Received webhook data:`, JSON.stringify(body, null, 2));
    console.log(`📊 [${requestId}] Number of transactions: ${body.length}`);

    // Log processing start
    addWebhookEvent({
      id: `processing-${requestId}`,
      timestamp: new Date().toISOString(),
      type: 'processing',
      data: { transactionCount: body.length, transactions: body },
      requestId
    });

    // Validate webhook data structure
    if (!Array.isArray(body) || body.length === 0) {
      console.error(`❌ [${requestId}] Invalid webhook data: not an array or empty`);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid webhook data format',
        requestId 
      }, { status: 400 });
    }

    // Process each transaction in the webhook
    const results = [];
    for (let i = 0; i < body.length; i++) {
      const transaction = body[i];
      console.log(`\n🔄 [${requestId}] Processing transaction ${i + 1}/${body.length}`);
      console.log(`📋 [${requestId}] Transaction signature: ${transaction.signature}`);
      
      try {
        const result = await processTransaction(transaction, requestId);
        results.push(result);
        console.log(`✅ [${requestId}] Transaction ${i + 1} processed successfully:`, result);
      } catch (error) {
        console.error(`❌ [${requestId}] Error processing transaction ${i + 1}:`, error);
        
        // Log transaction processing error
        addWebhookEvent({
          id: `tx-error-${requestId}-${i}`,
          timestamp: new Date().toISOString(),
          type: 'error',
          data: { 
            action: 'process_transaction_failed',
            transactionSignature: transaction.signature,
            error: error instanceof Error ? error.message : 'Unknown transaction processing error'
          },
          requestId,
          signature: transaction.signature,
          error: error instanceof Error ? error.message : 'Unknown transaction processing error'
        });
        
        results.push({ 
          success: false, 
          signature: transaction.signature,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`\n🎉 [${requestId}] Webhook processing completed in ${processingTime}ms`);
    console.log(`📈 [${requestId}] Final results:`, results);

    // Log successful completion
    addWebhookEvent({
      id: `completed-${requestId}`,
      timestamp: new Date().toISOString(),
      type: 'completed',
      data: { results, processedTransactions: results.length },
      requestId,
      processingTime
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      processedTransactions: results.length,
      results,
      requestId,
      processingTimeMs: processingTime
    });
  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.error(`💥 [${requestId}] Webhook processing error after ${processingTime}ms:`, error);
    
    // Log error event
    addWebhookEvent({
      id: `error-${requestId}`,
      timestamp: new Date().toISOString(),
      type: 'error',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      requestId,
      processingTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process webhook',
      requestId,
      processingTimeMs: processingTime
    }, { status: 500 });
  }
}

async function processTransaction(transaction: WebhookData, requestId: string) {
  const targetWallet = process.env.WALLET_PUBLIC_KEY;
  
  console.log(`🔍 [${requestId}] Processing transaction for wallet: ${targetWallet}`);
  
  if (!targetWallet) {
    throw new Error('WALLET_PUBLIC_KEY not found in environment variables');
  }

  // Validate transaction structure
  if (!transaction.nativeTransfers || !Array.isArray(transaction.nativeTransfers)) {
    console.log(`⚠️ [${requestId}] Transaction has no native transfers`);
    return { success: false, reason: 'No native transfers' };
  }

  console.log(`📊 [${requestId}] Found ${transaction.nativeTransfers.length} native transfers`);
  transaction.nativeTransfers.forEach((transfer, index) => {
    console.log(`   Transfer ${index + 1}: ${transfer.fromUserAccount} → ${transfer.toUserAccount} (${transfer.amount / 1e9} SOL)`);
  });

  // Check if this transaction involves our wallet receiving SOL
  const relevantTransfer = transaction.nativeTransfers.find(
    transfer => transfer.toUserAccount === targetWallet && transfer.amount > 0
  );

  if (!relevantTransfer) {
    console.log(`⚠️ [${requestId}] Transaction does not involve SOL transfer to our wallet`);
    return { success: false, reason: 'Not relevant to our wallet' };
  }

  console.log(`✅ [${requestId}] Processing SOL transfer of ${relevantTransfer.amount / 1e9} SOL to our wallet`);
  console.log(`👤 [${requestId}] Sender: ${relevantTransfer.fromUserAccount}`);

  // Mint equivalent RSOL tokens to the sender
  const mintResult = await mintRSOLTokens(
    relevantTransfer.fromUserAccount,
    relevantTransfer.amount,
    transaction.signature,
    requestId
  );

  return {
    success: true,
    solAmount: relevantTransfer.amount,
    recipient: relevantTransfer.fromUserAccount,
    mintTransaction: mintResult
  };
}

async function mintRSOLTokens(recipientAddress: string, solAmount: number, txSignature: string, requestId: string) {
  try {
    console.log(`🪙 [${requestId}] Starting RSOL token minting process`);
    
    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    // Validate that we have the private key
    if (!process.env.WALLET_PRIVATE_KEY) {
      throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
    }

    // Create keypair from private key (typically base58 format for Solana)
    console.log(`🔐 [${requestId}] Private key length: ${process.env.WALLET_PRIVATE_KEY!.length}`);
    console.log(`🔐 [${requestId}] Private key first 10 chars: ${process.env.WALLET_PRIVATE_KEY!.substring(0, 10)}`);
    

    
    const wallet = Keypair.fromSecretKey(bs58Decode(process.env.WALLET_PRIVATE_KEY!));
    console.log(`✅ [${requestId}] Private key decoded as base58 successfully`);
   

    const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS || '');
    const recipientPublicKey = new PublicKey(recipientAddress);

    console.log(`🔧 [${requestId}] Minting configuration:`);
    console.log(`   Mint address: ${mintAddress.toString()}`);
    console.log(`   Recipient: ${recipientAddress}`);
    console.log(`   SOL Amount (lamports): ${solAmount}`);
    console.log(`   SOL Amount (SOL): ${solAmount / 1e9}`);

    // Get or create associated token account for the recipient
    console.log(`🔍 [${requestId}] Getting associated token address...`);
    const recipientTokenAddress = await getAssociatedTokenAddress(
      mintAddress,
      recipientPublicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(`📍 [${requestId}] Associated token address: ${recipientTokenAddress.toString()}`);

    // Check if the associated token account already exists
    let accountExists = false;
    try {
      await getAccount(connection, recipientTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      accountExists = true;
      console.log(`✅ [${requestId}] Associated token account already exists`);
    } catch {
      console.log(`🔧 [${requestId}] Associated token account does not exist, will create in transaction`);
    }

    // Create transaction with instructions
    const transaction = new Transaction();

    // Add create associated token account instruction if needed
    if (!accountExists) {
      console.log(`➕ [${requestId}] Adding create associated token account instruction for Token-2022`);
      
      // For Token-2022, we need to specify the program correctly
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        recipientTokenAddress, // associatedToken
        recipientPublicKey, // owner
        mintAddress, // mint
        TOKEN_2022_PROGRAM_ID, // programId for Token-2022
        ASSOCIATED_TOKEN_PROGRAM_ID // associatedTokenProgramId (this stays the same)
      );
      
      console.log(`🔧 [${requestId}] Token account instruction details:`, {
        payer: wallet.publicKey.toString(),
        associatedToken: recipientTokenAddress.toString(),
        owner: recipientPublicKey.toString(),
        mint: mintAddress.toString(),
        tokenProgram: TOKEN_2022_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString()
      });
      
      transaction.add(createAccountInstruction);
    }

    // Mint tokens (using stored ratio or 1:1 as fallback)
    // Add a small delay to ensure stake request is stored before webhook processing
    console.log(`⏳ [${requestId}] Adding 2 second delay to ensure stake request is stored...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the stored stake request for this user
    const stakeRequest = getStakeRequest(recipientAddress);
    let ratio = 1.0; // Default fallback
    
    if (stakeRequest) {
      ratio = stakeRequest.ratio;
      console.log(`🎯 [${requestId}] Found stored ratio: ${ratio.toFixed(3)}x for ${recipientAddress}`);
      // Remove the request after using it
      removeStakeRequest(recipientAddress);
    } else {
      console.log(`⚠️ [${requestId}] No stored ratio found for ${recipientAddress}, using default 1:1`);
    }
    
    const tokensToMint = Math.floor(solAmount / ratio); // Apply the ratio

    console.log(`⚡ [${requestId}] Adding mint instruction for ${tokensToMint / 1e9} RSOL tokens at ${ratio.toFixed(3)}x ratio...`);
    const mintInstruction = createMintToInstruction(
      mintAddress, // mint
      recipientTokenAddress, // destination
      wallet.publicKey, // authority
      tokensToMint, // amount
      [], // multisigners
      TOKEN_2022_PROGRAM_ID // programId
    );
    transaction.add(mintInstruction);

    // Get recent blockhash and send transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    transaction.sign(wallet);
    const mintTx = await connection.sendRawTransaction(transaction.serialize());

    console.log(`🎉 [${requestId}] Successfully minted ${tokensToMint / 1e9} RSOL tokens at ${ratio.toFixed(3)}x ratio`);
    console.log(`📝 [${requestId}] Mint transaction signature: ${mintTx}`);

    // Log successful minting
    addWebhookEvent({
      id: `mint-${requestId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'completed',
      data: { 
        action: 'mint_tokens',
        tokensToMint: tokensToMint / 1e9,
        ratio: ratio,
        recipientTokenAddress: recipientTokenAddress.toString()
      },
      requestId,
      signature: txSignature,
      amount: solAmount,
      recipient: recipientAddress,
      mintTx
    });

    // Log the transaction for tracking
    await logTransaction({
      originalTxSignature: txSignature,
      mintTxSignature: mintTx,
      recipientAddress,
      solAmount,
      rsolAmount: tokensToMint,
      timestamp: new Date().toISOString()
    }, requestId);

    return mintTx;

  } catch (error) {
    console.error(`💥 [${requestId}] Error minting RSOL tokens:`, error);
    
    // Log error event
    addWebhookEvent({
      id: `mint-error-${requestId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'error',
      data: { 
        action: 'mint_tokens_failed',
        error: error instanceof Error ? error.message : 'Unknown minting error',
        recipientAddress
      },
      requestId,
      signature: txSignature,
      amount: solAmount,
      recipient: recipientAddress,
      error: error instanceof Error ? error.message : 'Unknown minting error'
    });
    
    throw error;
  }
}

async function logTransaction(transactionData: TransactionLog, requestId: string) {
  // For now, just log to console
  // In production, you'd want to store this in a database
  console.log(`📋 [${requestId}] Transaction logged:`, transactionData);
  
  // You can implement database storage here
  // For example, using Prisma, MongoDB, or any other database
}

// Health check endpoint
export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`🏥 Health check requested at ${timestamp}`);
  
  return NextResponse.json({ 
    status: 'Webhook endpoint is running',
    timestamp,
    environment: {
      hasWalletPublicKey: !!process.env.WALLET_PUBLIC_KEY,
      hasWalletPrivateKey: !!process.env.WALLET_PRIVATE_KEY,
      hasTokenMintAddress: !!process.env.TOKEN_MINT_ADDRESS,
      hasAlchemyEndpoint: !!process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT
    }
  });
}
