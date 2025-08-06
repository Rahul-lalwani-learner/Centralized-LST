'use client'

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface RSOL_to_SOL_Props {
  onRatioChange: (ratio: number, solAmount: number, rsolAmount: number) => void;
  rsolBalance?: number;
}

export default function RSOL_to_SOL({ onRatioChange, rsolBalance = 0 }: RSOL_to_SOL_Props) {
  const { publicKey } = useWallet();
  const [ratio, setRatio] = useState(1.0);
  const [rsolAmount, setRsolAmount] = useState(0);
  const [solAmount, setSolAmount] = useState(0);

  // Handle ratio change from slider
  const handleRatioChange = (newRatio: number) => {
    setRatio(newRatio);
    const calculatedSol = rsolAmount / newRatio;
    setSolAmount(calculatedSol);
    onRatioChange(newRatio, calculatedSol, rsolAmount);
  };

  // Handle RSOL amount change
  const handleRsolAmountChange = (newRsolAmount: number) => {
    setRsolAmount(newRsolAmount);
    const calculatedSol = newRsolAmount / ratio;
    setSolAmount(calculatedSol);
    onRatioChange(ratio, calculatedSol, newRsolAmount);
  };

  // Color coding for ratio (reverse of staking - green for conservative, red for aggressive)
  const getRatioColor = (currentRatio: number) => {
    if (currentRatio <= 0.9) return 'from-green-500 to-emerald-600'; // Conservative - less SOL returned
    if (currentRatio <= 1.0) return 'from-yellow-500 to-orange-500';
    if (currentRatio <= 1.1) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600'; // Aggressive - more SOL returned
  };

  const getRatioLabel = (currentRatio: number) => {
    if (currentRatio <= 0.9) return 'Conservative';
    if (currentRatio <= 1.0) return 'Balanced';
    if (currentRatio <= 1.1) return 'Aggressive';
    return 'Very Aggressive';
  };

  const getRatioDescription = (currentRatio: number) => {
    if (currentRatio <= 0.9) return 'Lower SOL return, safer unstaking';
    if (currentRatio <= 1.0) return 'Standard 1:1 unstaking ratio';
    if (currentRatio <= 1.1) return 'Higher SOL return, moderate risk';
    return 'Maximum SOL return, highest risk';
  };

  if (!publicKey) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">Connect Wallet to Unstake</h3>
          <p className="text-gray-600">Please connect your wallet to access the unstaking interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-xl text-white">🔥</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Unstake RSOL</h3>
          <p className="text-sm text-gray-600">Burn RSOL tokens and receive SOL back</p>
        </div>
      </div>

      {/* RSOL Balance Display */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Available RSOL Balance:</span>
          <span className="text-lg font-bold text-orange-600">{(rsolBalance / 1e9).toFixed(4)} RSOL</span>
        </div>
      </div>

      {/* RSOL Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          RSOL Amount to Unstake
        </label>
        <div className="relative">
          <input
            type="number"
            value={rsolAmount / 1e9}
            onChange={(e) => handleRsolAmountChange(parseFloat(e.target.value || '0') * 1e9)}
            max={rsolBalance / 1e9}
            step="0.001"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-medium"
            placeholder="0.0"
          />
          <button
            onClick={() => handleRsolAmountChange(rsolBalance)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-orange-600 hover:text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Ratio Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-gray-700">
            Unstaking Ratio: {ratio.toFixed(3)}x
          </label>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRatioColor(ratio)}`}>
            {getRatioLabel(ratio)}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.001"
            value={ratio}
            onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, 
                #10b981 0%, #10b981 ${((0.9 - 0.8) / (1.2 - 0.8)) * 100}%, 
                #f59e0b ${((0.9 - 0.8) / (1.2 - 0.8)) * 100}%, #f59e0b ${((1.0 - 0.8) / (1.2 - 0.8)) * 100}%, 
                #ef4444 ${((1.0 - 0.8) / (1.2 - 0.8)) * 100}%, #ef4444 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0.8x (Safe)</span>
            <span>1.0x (Standard)</span>
            <span>1.2x (Aggressive)</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {getRatioDescription(ratio)}
        </p>
      </div>

      {/* Calculation Display */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs text-white">⚡</span>
          </span>
          Unstaking Calculation
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">RSOL to Burn:</span>
            <span className="font-bold text-orange-600">{(rsolAmount / 1e9).toFixed(6)} RSOL</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Unstaking Ratio:</span>
            <span className="font-bold text-orange-600">{ratio.toFixed(3)}x</span>
          </div>
          
          <div className="flex justify-between items-center py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg px-3">
            <span className="font-medium text-gray-900">SOL You&apos;ll Receive:</span>
            <span className="font-bold text-2xl text-orange-600">{(solAmount / 1e9).toFixed(6)} SOL</span>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <span className="text-xs text-white">ℹ️</span>
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-blue-900 mb-1">How Unstaking Works</h5>
            <p className="text-sm text-blue-700 leading-relaxed">
              Your RSOL tokens will be burned and you&apos;ll receive SOL based on your selected ratio. 
              Higher ratios provide more SOL but may carry additional risk considerations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
