'use client'

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import Navigation from "../components/Navigation";
import RSOL_to_SOL from "../components/RSOL_to_SOL";

export default function Unstake() {
    const wallet = useWallet();
    const [rsolAmount, setRsolAmount] = useState(0);
    const [isUnstaking, setIsUnstaking] = useState(false);
    const [message, setMessage] = useState('');
    const [currentRatio, setCurrentRatio] = useState(1.0);
    const [rsolBalance, setRsolBalance] = useState(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    // Handle ratio changes from the RSOL_to_SOL component
    const handleRatioChange = (ratio: number, calculatedSolAmount: number, rsolToUnstake: number) => {
        setCurrentRatio(ratio);
        // Note: We don't need to store calculatedSolAmount in state since it's computed
        setRsolAmount(rsolToUnstake);
    };

    // Fetch RSOL token balance
    const fetchRSOLBalance = useCallback(async () => {
        if (!wallet.publicKey) return;
        
        setIsLoadingBalance(true);
        try {
            const response = await fetch(`/api/rsol-balance?wallet=${wallet.publicKey.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                setRsolBalance(data.balance);
                console.log(`💰 RSOL Balance fetched: ${data.balanceInSOL} RSOL (${data.balance} lamports)`);
            } else {
                console.error('Failed to fetch RSOL balance:', data.error);
                setRsolBalance(0);
            }
        } catch (error) {
            console.error('Error fetching RSOL balance:', error);
            setRsolBalance(0);
        } finally {
            setIsLoadingBalance(false);
        }
    }, [wallet.publicKey]);

    // Fetch balance when wallet connects
    useEffect(() => {
        if (wallet.publicKey) {
            fetchRSOLBalance();
        } else {
            setRsolBalance(0);
        }
    }, [wallet.publicKey, fetchRSOLBalance]);

    const handleUnstake = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            setMessage('❌ Please connect your wallet first');
            return;
        }

        if (rsolAmount <= 0) {
            setMessage('❌ Please enter a valid RSOL amount');
            return;
        }

        if (rsolAmount > rsolBalance) {
            setMessage('❌ Insufficient RSOL balance');
            return;
        }

        setIsUnstaking(true);
        setMessage('🔥 Preparing unstaking transaction...');

        try {
            console.log(`🔥 Starting two-step unstake process:`);
            console.log(`   RSOL to burn: ${rsolAmount / 1e9} RSOL (${rsolAmount} lamports)`);
            console.log(`   Unstaking ratio: ${currentRatio.toFixed(3)}x`);
            console.log(`   Expected SOL: ${(rsolAmount / currentRatio) / 1e9} SOL`);

            // Step 1: Prepare burn transaction
            setMessage('🔥 Step 1: Preparing burn transaction...');
            const prepareResponse = await fetch('/api/prepare-unstake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: wallet.publicKey.toString(),
                    rsolAmount: rsolAmount,
                    ratio: currentRatio
                }),
            });

            const prepareData = await prepareResponse.json();
            console.log('Prepare unstake response:', prepareData);

            if (!prepareData.success) {
                setMessage(`❌ Failed to prepare unstaking: ${prepareData.error}`);
                return;
            }

            // Step 2: User signs the burn transaction
            setMessage('🔏 Step 2: Please sign the burn transaction in your wallet...');
            
            const { Connection } = await import('@solana/web3.js');
            const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT || '', 'confirmed');
            
            // Reconstruct transaction from base64
            const { Transaction } = await import('@solana/web3.js');
            const burnTransaction = Transaction.from(Buffer.from(prepareData.transaction, 'base64'));
            
            // Get fresh blockhash to avoid "already processed" error
            const { blockhash } = await connection.getLatestBlockhash();
            burnTransaction.recentBlockhash = blockhash;
            
            // Sign the transaction
            const signedBurnTx = await wallet.signTransaction(burnTransaction);
            
            // Send the burn transaction
            setMessage('🔥 Step 3: Burning RSOL tokens...');
            const burnTxSignature = await connection.sendRawTransaction(signedBurnTx.serialize());
            console.log('Burn transaction signature:', burnTxSignature);

            // Step 3: Confirm burn and receive SOL
            setMessage('💸 Step 4: Requesting SOL transfer...');
            const confirmResponse = await fetch('/api/confirm-unstake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: wallet.publicKey.toString(),
                    burnTxSignature: burnTxSignature,
                    rsolAmount: rsolAmount,
                    ratio: currentRatio
                }),
            });

            const confirmData = await confirmResponse.json();
            console.log('Confirm unstake response:', confirmData);

            if (confirmData.success) {
                setMessage(`✅ Successfully unstaked! Burned ${confirmData.rsolBurned} RSOL and received ${confirmData.solReturned} SOL. 
                           Burn TX: ${confirmData.burnTxSignature.slice(0, 8)}... 
                           SOL TX: ${confirmData.transferTxSignature.slice(0, 8)}...`);
                
                // Refresh RSOL balance
                await fetchRSOLBalance();
                
                // Reset form
                setRsolAmount(0);
            } else {
                setMessage(`❌ Failed to complete unstaking: ${confirmData.error}`);
            }

        } catch (error) {
            console.error('Unstaking error:', error);
            if (error instanceof Error) {
                if (error.message.includes('User rejected')) {
                    setMessage('❌ Transaction was cancelled by user.');
                } else {
                    setMessage(`❌ Error during unstaking: ${error.message}`);
                }
            } else {
                setMessage('❌ Error processing unstaking request. Please try again.');
            }
        } finally {
            setIsUnstaking(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <Navigation />
            
            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center py-12 mb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-8">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                            Unstaking Interface
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Unstake RSOL
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                            Convert Your RSOL Back to SOL
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Burn your RSOL tokens and receive SOL back based on your selected unstaking ratio. 
                            Choose conservative for safety or aggressive for higher returns.
                        </p>
                    </div>
                </div>

                {/* Unstaking Interface */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Left Column - Unstaking Controls */}
                    <div className="space-y-6">
                        <RSOL_to_SOL 
                            onRatioChange={handleRatioChange}
                            rsolBalance={rsolBalance}
                        />
                        
                        {/* Unstake Button */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <button
                                onClick={handleUnstake}
                                disabled={isUnstaking || !wallet.publicKey || rsolAmount <= 0 || rsolAmount > rsolBalance}
                                className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${
                                    isUnstaking || !wallet.publicKey || rsolAmount <= 0 || rsolAmount > rsolBalance
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                }`}
                            >
                                {isUnstaking ? '🔥 Processing Unstaking...' : 
                                 !wallet.publicKey ? '🔗 Connect Wallet to Unstake' :
                                 rsolAmount <= 0 ? '⚠️ Enter RSOL Amount' :
                                 rsolAmount > rsolBalance ? '❌ Insufficient RSOL Balance' :
                                 `🔥 Unstake ${(rsolAmount / 1e9).toFixed(4)} RSOL`}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Information and Status */}
                    <div className="space-y-6">
                        {/* Balance Information */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs text-white">💰</span>
                                </span>
                                Your Balances
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="text-gray-700">RSOL Balance:</span>
                                    <span className="font-bold text-orange-600">
                                        {isLoadingBalance ? 'Loading...' : `${(rsolBalance / 1e9).toFixed(4)} RSOL`}
                                    </span>
                                </div>
                                {wallet.publicKey && (
                                    <button
                                        onClick={fetchRSOLBalance}
                                        disabled={isLoadingBalance}
                                        className="w-full py-2 px-4 text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg hover:from-orange-200 hover:to-red-200 transition-colors"
                                    >
                                        🔄 Refresh Balance
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Transaction Status */}
                        {message && (
                            <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                                message.includes('✅') 
                                    ? 'bg-green-50 text-green-800 border border-green-200' 
                                    : message.includes('❌') 
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}>
                                <div className="break-all">
                                    {message}
                                </div>
                            </div>
                        )}

                        {/* How Unstaking Works */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs text-white">ℹ️</span>
                                </span>
                                How Unstaking Works
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Select the amount of RSOL tokens you want to unstake</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Choose your unstaking ratio (affects SOL received)</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Your RSOL tokens are burned permanently</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>SOL is transferred to your wallet based on the ratio</span>
                                </div>
                            </div>
                        </div>

                        {/* Risk Information */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs text-white">⚠️</span>
                                </span>
                                Important Notes
                            </h3>
                            <div className="space-y-2 text-sm text-amber-800">
                                <p>• Higher ratios provide more SOL but carry additional considerations</p>
                                <p>• RSOL token burning is irreversible</p>
                                <p>• Transaction fees apply and are deducted from platform wallet</p>
                                <p>• This is a devnet implementation for testing purposes only</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
