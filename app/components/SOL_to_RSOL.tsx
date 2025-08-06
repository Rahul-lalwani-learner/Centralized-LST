'use client'

import { useState, useEffect } from 'react';

interface SOLtoRSOLProps {
  solAmount: number;
  onRatioChange: (ratio: number, rsolAmount: number) => void;
}

export default function SOL_to_RSOL({ solAmount, onRatioChange }: SOLtoRSOLProps) {
  const [ratio, setRatio] = useState(1.0); // Default 1:1 ratio
  const [rsolAmount, setRsolAmount] = useState(0);

  // Ratio bounds - users can get between 0.8x to 1.2x RSOL for their SOL
  // Lower ratio = more conservative (less RSOL but potentially safer)
  // Higher ratio = more aggressive (more RSOL but potentially higher risk)
  const minRatio = 0.8;
  const maxRatio = 1.2;
  const step = 0.01;

  useEffect(() => {
    const newRsolAmount = solAmount * ratio;
    setRsolAmount(newRsolAmount);
    onRatioChange(ratio, newRsolAmount);
  }, [solAmount, ratio, onRatioChange]);

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRatio = parseFloat(e.target.value);
    setRatio(newRatio);
  };

  const getRatioColorClass = () => {
    if (ratio < 0.9) return 'text-green-500'; // Green for lower ratios (safer, less RSOL)
    if (ratio > 1.1) return 'text-red-500'; // Red for higher ratios (riskier, more RSOL)
    return 'text-indigo-500'; // Blue for neutral ratios
  };

  const getRatioLabel = () => {
    if (ratio < 0.9) return 'Conservative'; // Less RSOL, safer
    if (ratio > 1.1) return 'Aggressive'; // More RSOL, riskier
    return 'Balanced';
  };

  const getRatioBadgeClass = () => {
    if (ratio < 0.9) return 'text-green-600 bg-green-100'; // Green for conservative
    if (ratio > 1.1) return 'text-red-600 bg-red-100'; // Red for aggressive
    return 'text-indigo-600 bg-indigo-100';
  };

  return (
    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-5">
      <h3 className="mb-4 text-gray-700 text-lg font-semibold">
        SOL to RSOL Conversion Ratio
      </h3>
      
      {/* Visual Ratio Display */}
      <div className="flex items-center justify-between mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">
            {solAmount.toFixed(4)} SOL
          </div>
          <div className="text-xs text-gray-500">You Stake</div>
        </div>
        
        <div className={`text-xl font-bold ${getRatioColorClass()}`}>
          →
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-500">
            {rsolAmount.toFixed(4)} RSOL
          </div>
          <div className="text-xs text-gray-500">You Receive</div>
        </div>
      </div>

      {/* Ratio Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Ratio: {ratio.toFixed(2)}x</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRatioBadgeClass()}`}>
            {getRatioLabel()}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={minRatio}
            max={maxRatio}
            step={step}
            value={ratio}
            onChange={handleRatioChange}
            className="w-full h-2 bg-gradient-to-r from-green-400 via-indigo-500 to-red-400 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${ratio < 0.9 ? '#22c55e' : ratio > 1.1 ? '#ef4444' : '#6366f1'};
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              cursor: pointer;
            }
            
            .slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${ratio < 0.9 ? '#22c55e' : ratio > 1.1 ? '#ef4444' : '#6366f1'};
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              cursor: pointer;
              border: none;
            }
          `}</style>
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{minRatio}x</span>
          <span>1.0x</span>
          <span>{maxRatio}x</span>
        </div>
      </div>

      {/* Ratio Information */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="p-3 bg-white rounded-md text-center border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            Current Ratio
          </div>
          <div className={`text-lg font-bold ${getRatioColorClass()}`}>
            {ratio.toFixed(3)}x
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-md text-center border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            Rate Type
          </div>
          <div className={`text-sm font-bold ${getRatioColorClass()}`}>
            {getRatioLabel()}
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-md text-center border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            Difference
          </div>
          <div className={`text-sm font-bold ${
            ratio < 1 ? 'text-green-500' : ratio > 1 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {ratio < 1 ? '' : '+'}{((ratio - 1) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-md">
        <div className="text-xs text-sky-800 leading-relaxed">
          <strong>How it works:</strong><br/>
          • <strong>Conservative (0.8x-0.9x):</strong> Receive fewer RSOL but potentially safer returns<br/>
          • <strong>Balanced (0.9x-1.1x):</strong> Standard rate, close to 1:1 conversion<br/>
          • <strong>Aggressive (1.1x-1.2x):</strong> Receive more RSOL but with higher risk exposure<br/>
          <br/>
          <em>Note: Higher RSOL amounts may indicate higher risk/reward scenarios in volatile markets.</em>
        </div>
      </div>
    </div>
  );
}
