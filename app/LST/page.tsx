'use client'

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Navigation from "../components/Navigation";

export default function LST(){
    const {connection} = useConnection(); 
    const wallet = useWallet();
    const [amount, setAmount] = useState('');
    const [isStaking, setIsStaking] = useState(false);
    const [message, setMessage] = useState('');

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
            
            // Confirm transaction
            await connection.confirmTransaction(signature, 'confirmed');

            setMessage(`Successfully staked ${amount} SOL! Transaction: ${signature.slice(0, 8)}...`);
            setAmount('');
            
            // You could also call your backend here to immediately process the transaction
            // instead of waiting for the webhook
            
        } catch (error) {
            console.error('Staking error:', error);
            setMessage('Staking failed. Please try again.');
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
                                    border: '1px solid #ccc',
                                    marginBottom: '20px',
                                    fontSize: '16px',
                                    opacity: isStaking ? 0.6 : 1
                                }}
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