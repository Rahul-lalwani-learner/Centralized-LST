import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  mintTo
} from '@solana/spl-token';

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
  try {
    // Validate that we have the required environment variables
    if (!process.env.WALLET_PUBLIC_KEY || !process.env.WALLET_PRIVATE_KEY || !process.env.TOKEN_MINT_ADDRESS) {
      console.error('Missing required environment variables');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const body: WebhookData[] = await request.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Validate webhook data structure
    if (!Array.isArray(body) || body.length === 0) {
      console.error('Invalid webhook data: not an array or empty');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid webhook data format' 
      }, { status: 400 });
    }

    // Process each transaction in the webhook
    const results = [];
    for (const transaction of body) {
      try {
        const result = await processTransaction(transaction);
        results.push(result);
      } catch (error) {
        console.error('Error processing individual transaction:', error);
        results.push({ 
          success: false, 
          signature: transaction.signature,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      processedTransactions: results.length,
      results
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process webhook'
    }, { status: 500 });
  }
}

async function processTransaction(transaction: WebhookData) {
  const targetWallet = process.env.WALLET_PUBLIC_KEY;
  
  if (!targetWallet) {
    throw new Error('WALLET_PUBLIC_KEY not found in environment variables');
  }

  // Validate transaction structure
  if (!transaction.nativeTransfers || !Array.isArray(transaction.nativeTransfers)) {
    console.log('Transaction has no native transfers');
    return { success: false, reason: 'No native transfers' };
  }

  // Check if this transaction involves our wallet receiving SOL
  const relevantTransfer = transaction.nativeTransfers.find(
    transfer => transfer.toUserAccount === targetWallet && transfer.amount > 0
  );

  if (!relevantTransfer) {
    console.log('Transaction does not involve SOL transfer to our wallet');
    return { success: false, reason: 'Not relevant to our wallet' };
  }

  console.log(`Processing SOL transfer of ${relevantTransfer.amount / 1e9} SOL to our wallet`);

  // Mint equivalent RSOL tokens to the sender
  const mintResult = await mintRSOLTokens(
    relevantTransfer.fromUserAccount,
    relevantTransfer.amount,
    transaction.signature
  );

  return {
    success: true,
    solAmount: relevantTransfer.amount,
    recipient: relevantTransfer.fromUserAccount,
    mintTransaction: mintResult
  };
}

async function mintRSOLTokens(recipientAddress: string, solAmount: number, txSignature: string) {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '',
      'confirmed'
    );

    // Validate that we have the private key
    if (!process.env.WALLET_PRIVATE_KEY) {
      throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
    }

    // Create keypair from private key
    const privateKeyArray = JSON.parse(`[${process.env.WALLET_PRIVATE_KEY}]`);
    const wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

    const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS || '');
    const recipientPublicKey = new PublicKey(recipientAddress);

    console.log('Minting RSOL tokens...');
    console.log('Mint address:', mintAddress.toString());
    console.log('Recipient:', recipientAddress);
    console.log('Amount (lamports):', solAmount);

    // Get or create associated token account for the recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      recipientPublicKey
    );

    console.log('Recipient token account:', recipientTokenAccount.address.toString());

    // Mint tokens (1:1 ratio with SOL, but in token decimals)
    // Assuming your token has 9 decimals like SOL
    const tokensToMint = solAmount; // 1:1 ratio

    const mintTx = await mintTo(
      connection,
      wallet,
      mintAddress,
      recipientTokenAccount.address,
      wallet.publicKey,
      tokensToMint
    );

    console.log(`Successfully minted ${tokensToMint / 1e9} RSOL tokens`);
    console.log('Mint transaction:', mintTx);

    // Log the transaction for tracking
    await logTransaction({
      originalTxSignature: txSignature,
      mintTxSignature: mintTx,
      recipientAddress,
      solAmount,
      rsolAmount: tokensToMint,
      timestamp: new Date().toISOString()
    });

    return mintTx;

  } catch (error) {
    console.error('Error minting RSOL tokens:', error);
    throw error;
  }
}

async function logTransaction(transactionData: TransactionLog) {
  // For now, just log to console
  // In production, you'd want to store this in a database
  console.log('Transaction logged:', transactionData);
  
  // You can implement database storage here
  // For example, using Prisma, MongoDB, or any other database
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is running',
    timestamp: new Date().toISOString()
  });
}
