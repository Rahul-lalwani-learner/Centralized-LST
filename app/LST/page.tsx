'use client'

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Navigation from "../components/Navigation";

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
                        setMessage(`🎉 Success! RSOL tokens have been minted to your wallet! Mint TX: ${mintEvent.mintTx!.slice(0, 8)}...`);
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
    }, [pendingTxSignature]);

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
            const targetWallet = new PublicKey(process.env.NEXT_PUBLIC_WALLET_PUBLIC_KEY || '');
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            // Create transfer transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: targetWallet,
                    lamports,
                })
            );

            // Get recent blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await wallet.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            
            console.log('Transaction sent with signature:', signature);
            setMessage(`✅ Transaction successful! Signature: ${signature.slice(0, 8)}...`);
            
            // Show minting message immediately and start polling
            setTimeout(() => {
                setMessage(`🪙 Minting RSOL tokens for you... This may take a few moments.`);
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
            setIsStaking(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            <div className="container mx-auto px-4 py-16">
                {!wallet.connected ? (
                    <div style={{
                    maxWidth: '400px',
                    margin: '40px auto',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    background: '#fff',
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    textAlign: 'center'
                    }}>
                    <h2 style={{ marginBottom: '16px', color: '#333' }}>Connect Wallet</h2>
                    <p style={{ color: '#555' }}>
                        Connect your wallet first, then you can stake your SOL.
                    </p>
                    </div>
                ) : (
                    <div style={{
                        maxWidth: '400px',
                        margin: '40px auto',
                        padding: '32px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        background: '#fff',
                        fontFamily: 'Segoe UI, Arial, sans-serif'
                    }}>
                        <h2 style={{ marginBottom: '24px', color: '#333' }}>Stake SOL for RSOL</h2>
                        
                        {message && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                background: message.includes('failed') ? '#fee2e2' : '#dcfce7',
                                color: message.includes('failed') ? '#dc2626' : '#166534',
                                fontSize: '14px'
                            }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleStaking}>
                            <label htmlFor="sol-amount" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>
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
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '2px solid #d1d5db',
                                    backgroundColor: '#ffffff',
                                    color: '#111827',
                                    marginBottom: '20px',
                                    fontSize: '16px',
                                    opacity: isStaking ? 0.6 : 1,
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            <button
                                type="submit"
                                disabled={isStaking}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: isStaking ? '#9ca3af' : '#6366f1',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: isStaking ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {isStaking ? 'Staking...' : 'Stake SOL'}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>How it works:</h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                                1. Send SOL to our staking contract<br/>
                                2. Receive RSOL tokens 1:1<br/>
                                3. RSOL represents your staked SOL<br/>
                                4. Earn staking rewards over time
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}