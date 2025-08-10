'use client'

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import Navigation from "../components/Navigation";
import SOL_to_RSOL from "../components/SOL_to_RSOL";

interface WebhookEvent {
  id: string;
  timestamp: string;
  type: 'incoming' | 'processing' | 'completed' | 'error';
  data: Record<string, unknown>;
  requestId?: string;
  signature?: string;
  amount?: number;
  recipient?: string;
  mintTx?: string;
  processingTime?: number;
  error?: string;
}

export default function LST(){
    const {connection} = useConnection(); 
    const wallet = useWallet();
    const [amount, setAmount] = useState('');
    const [isStaking, setIsStaking] = useState(false);
    const [message, setMessage] = useState('');
    const [pendingTxSignature, setPendingTxSignature] = useState<string | null>(null);
    const [currentYield, setCurrentYield] = useState(0);
    const [currentRatio, setCurrentRatio] = useState(1.0);
    const [expectedRSOL, setExpectedRSOL] = useState(0);

    // Handle yield changes from the SOL_to_RSOL component
    const handleYieldChange = (yieldPercent: number, rsolAmount: number) => {
        setCurrentYield(yieldPercent);
        const ratio = 1 + yieldPercent / 100;
        setCurrentRatio(ratio);
        setExpectedRSOL(rsolAmount);
    };

    // Update expected RSOL when amount changes
    useEffect(() => {
        if (parseFloat(amount) > 0) {
            const newExpectedRSOL = parseFloat(amount) * currentRatio;
            console.log(`📊 Amount changed: ${amount} SOL × ${currentRatio.toFixed(3)} = ${newExpectedRSOL.toFixed(6)} RSOL`);
            setExpectedRSOL(newExpectedRSOL);
        } else {
            setExpectedRSOL(0);
        }
    }, [amount, currentRatio]);

    // Poll for webhook events to detect when RSOL tokens are minted
    useEffect(() => {
        if (!pendingTxSignature) return;

        const pollForMinting = async () => {
            try {
                const response = await fetch('/api/webhook-events');
                const data = await response.json();
                
                if (data.success && data.events) {
                    // Look for a completed minting event with our transaction signature
                    const mintEvent = data.events.find((event: WebhookEvent) => 
                        event.signature === pendingTxSignature && 
                        event.type === 'completed' && 
                        event.mintTx
                    );
                    
                    if (mintEvent) {
                        // Calculate the actual RSOL amount from the mint event data or use expected
                        const actualRSOL = mintEvent.data && typeof mintEvent.data === 'object' && 'tokensToMint' in mintEvent.data 
                            ? (mintEvent.data as { tokensToMint: number }).tokensToMint 
                            : expectedRSOL;
                        
                        console.log(`🎉 Mint success detected! Expected: ${expectedRSOL.toFixed(6)}, Actual: ${actualRSOL}`);
                        
                        setMessage(`🎉 Success! ${actualRSOL.toFixed(6)} RSOL tokens have been minted to your wallet at ${currentRatio.toFixed(3)}x ratio! Mint TX: ${mintEvent.mintTx!.slice(0, 8)}...`);
                        setPendingTxSignature(null);
                        return;
                    }
                    
                    // Check for error events
                    const errorEvent = data.events.find((event: WebhookEvent) => 
                        event.signature === pendingTxSignature && 
                        event.type === 'error'
                    );
                    
                    if (errorEvent) {
                        setMessage(`❌ Token minting failed: ${errorEvent.error || 'Unknown error'}`);
                        setPendingTxSignature(null);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error polling for minting status:', error);
            }
        };

        const interval = setInterval(pollForMinting, 3000); // Poll every 3 seconds
        
        // Stop polling after 2 minutes
        const timeout = setTimeout(() => {
            setMessage(`⏰ Minting is taking longer than expected. Please check your wallet or the monitor page.`);
            setPendingTxSignature(null);
            clearInterval(interval);
        }, 120000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [pendingTxSignature, currentRatio, expectedRSOL]);

    async function handleStaking(e: React.FormEvent) {
        e.preventDefault();
        
        if (!wallet.publicKey || !wallet.signTransaction) {
            setMessage('Please connect your wallet first');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setMessage('Please enter a valid amount');
            return;
        }

        setIsStaking(true);
        setMessage('');

        try {
            // Add small delay to avoid rapid successive transactions
            console.log('⏳ Adding 500ms delay to avoid transaction conflicts...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Store the stake request with ratio before sending transaction
            console.log(`📋 Storing stake request: ${wallet.publicKey.toString()}, yield: ${currentYield.toFixed(2)}%, amount: ${parseFloat(amount)}`);
            console.log(`📊 Expected RSOL calculation: ${parseFloat(amount)} SOL × ${currentRatio.toFixed(3)} = ${expectedRSOL.toFixed(6)} RSOL`);
            
            const stakeResponse = await fetch('/api/stake-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: wallet.publicKey.toString(),
                    yield: currentYield,
                    solAmount: parseFloat(amount)
                }),
            });

            const stakeResult = await stakeResponse.json();
            console.log('Stake request response:', stakeResult);

            if (!stakeResponse.ok) {
                throw new Error(`Failed to store stake request: ${stakeResult.error || 'Unknown error'}`);
            }

            console.log('✅ Stake request stored successfully, proceeding with transaction...');

            const targetWallet = new PublicKey(process.env.NEXT_PUBLIC_WALLET_PUBLIC_KEY || '');
            const lamports = parseFloat(amount) * 1000000000; // LAMPORTS_PER_SOL = 1e9

            // Get recent blockhash FIRST to ensure freshness
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
            console.log('🔗 Got fresh blockhash:', blockhash.slice(0, 8), 'Valid until block:', lastValidBlockHeight);
            
            // Create transfer transaction with unique memo to avoid duplicate issues
            const transaction = new Transaction();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;
            
            // Add unique memo to ensure transaction uniqueness (include blockhash for extra uniqueness)
            const uniqueMemo = `stake-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${blockhash.slice(-8)}`;
            console.log('📝 Adding unique memo to stake transaction:', uniqueMemo);
            
            const { TransactionInstruction } = await import('@solana/web3.js');
            const memoInstruction = new TransactionInstruction({
                keys: [],
                programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                data: Buffer.from(uniqueMemo, 'utf-8'),
            });
            transaction.add(memoInstruction);
            
            // Add the SOL transfer instruction
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: targetWallet,
                    lamports,
                })
            );

            // Sign and send transaction with retry logic
            const signedTransaction = await wallet.signTransaction(transaction);
            
            // Send with aggressive cache-busting options
            const signature = await connection.sendRawTransaction(
                signedTransaction.serialize(),
                {
                    skipPreflight: true, // Skip preflight to avoid cached simulation
                    preflightCommitment: 'finalized', // Use finalized for fresh data
                    maxRetries: 5 // More retries for better reliability
                }
            );
            
            console.log('Transaction sent with signature:', signature);
            
            // Wait for initial confirmation to avoid rapid successive transactions
            try {
                await connection.confirmTransaction(signature, 'processed');
                console.log('Transaction confirmed as processed');
            } catch (confirmError) {
                console.log('Transaction confirmation failed, but continuing:', confirmError);
            }
            
            setMessage(`✅ Transaction successful! Signature: ${signature.slice(0, 8)}...`);
            
            // Show minting message immediately and start polling
            setTimeout(() => {
                console.log(`🪙 About to show minting message. Expected RSOL: ${expectedRSOL.toFixed(6)}, Ratio: ${currentRatio.toFixed(3)}`);
                setMessage(`🪙 Minting ${expectedRSOL.toFixed(6)} RSOL tokens at ${currentRatio.toFixed(3)}x ratio for you... This may take a few moments.`);
                setPendingTxSignature(signature); // Start polling for webhook events
            }, 2000);
            
            setAmount('');
            
        } catch (error) {
            console.error('Staking error:', error);
            if (error instanceof Error) {
                if (error.message.includes('User rejected')) {
                    setMessage('Transaction was cancelled.');
                } else if (error.message.includes('insufficient funds')) {
                    setMessage('Insufficient SOL balance for this transaction.');
                } else if (error.message.includes('expired') || error.message.includes('timeout')) {
                    setMessage('Transaction timed out, but may still succeed. Check your wallet for updates.');
                } else {
                    setMessage(`Staking failed: ${error.message}`);
                }
            } else {
                setMessage('Staking failed. Please try again.');
            }
        } finally {
            // Add small delay before re-enabling to prevent rapid successive transactions
            setTimeout(() => {
                setIsStaking(false);
            }, 1000);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            <div className="container mx-auto px-4 py-16">
                {!wallet.connected ? (
                    <div className="max-w-md mx-auto mt-10 p-8 rounded-xl shadow-lg bg-white text-center">
                        <h2 className="mb-4 text-gray-800 text-xl font-semibold">Connect Wallet</h2>
                        <p className="text-gray-600">
                            Connect your wallet first, then you can stake your SOL.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto mt-10 p-8 rounded-xl shadow-lg bg-white">
                        <h2 className="mb-6 text-gray-800 text-xl font-semibold">Stake SOL for RSOL</h2>
                        
                        {/* SOL to RSOL Ratio Component */}
                        <SOL_to_RSOL 
                            solAmount={parseFloat(amount) || 0} 
                            onYieldChange={handleYieldChange}
                        />
                        
                        {message && (
                            <div className={`p-3 rounded-md mb-5 text-sm ${
                                message.includes('failed') || message.includes('❌') 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleStaking}>
                            <label htmlFor="sol-amount" className="block mb-2 text-gray-600">
                                Amount in SOL
                            </label>
                            <input
                                id="sol-amount"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter SOL you want to stake"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                disabled={isStaking}
                                className={`w-full p-3 rounded-md border-2 border-gray-300 bg-white text-gray-900 mb-5 text-base outline-none transition-colors focus:border-indigo-500 ${
                                    isStaking ? 'opacity-60' : ''
                                }`}
                            />
                            <button
                                type="submit"
                                disabled={isStaking || !amount || parseFloat(amount) <= 0}
                                className={`w-full p-3 rounded-md border-none text-white font-semibold text-base transition-colors ${
                                    isStaking || !amount || parseFloat(amount) <= 0
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-500 hover:bg-indigo-600 cursor-pointer'
                                }`}
                            >
                                {isStaking ? 'Staking...' : `Stake ${amount || '0'} SOL → Get ${expectedRSOL.toFixed(6)} RSOL (${currentRatio.toFixed(3)}x)`}
                            </button>
                        </form>
                        
                        <div className="mt-5 p-3 bg-gray-100 rounded-md">
                            <h4 className="mb-2 text-gray-700 text-sm font-medium">How it works:</h4>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                1. Adjust the ratio slider to select your conversion rate<br/>
                                2. Send SOL to our staking contract<br/>
                                3. Receive RSOL tokens based on your selected ratio<br/>
                                4. RSOL represents your staked SOL and earns rewards
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}