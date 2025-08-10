'use client'

import { useState, useEffect } from 'react';

interface SOLtoRSOLProps {
  solAmount: number;
  onYieldChange: (yieldPercent: number, rsolAmount: number) => void;
}

export default function SOL_to_RSOL({ solAmount, onYieldChange }: SOLtoRSOLProps) {
  const [yieldPercent, setYieldPercent] = useState(0); // Default 0% yield
  const [ratio, setRatio] = useState(1.0);
  const [rsolAmount, setRsolAmount] = useState(0);

  // Yield bounds - users can select 0% to 20% yield
  const minYield = 0;
  const maxYield = 20;
  const step = 0.1;

  useEffect(() => {
    const calculatedRatio = 1 + yieldPercent / 100;
    setRatio(calculatedRatio);
    // RSOL = SOL / (1 + yield/100)
    const newRsolAmount = solAmount / calculatedRatio;
    setRsolAmount(newRsolAmount);
    onYieldChange(yieldPercent, newRsolAmount);
  }, [solAmount, yieldPercent, onYieldChange]);

  const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYield = parseFloat(e.target.value);
    setYieldPercent(newYield);
  };

  const getYieldColorClass = () => {
    if (yieldPercent < 5) return 'text-green-500'; // Green for lower yields (safer)
    if (yieldPercent > 15) return 'text-red-500'; // Red for higher yields (riskier)
    return 'text-indigo-500'; // Blue for neutral yields
  };

  const getYieldLabel = () => {
    if (yieldPercent < 5) return 'Safe';
    if (yieldPercent > 15) return 'Aggressive';
    return 'Standard';
  };

  const getYieldBadgeClass = () => {
    if (yieldPercent < 5) return 'text-green-600 bg-green-100'; // Green for safe
    if (yieldPercent > 15) return 'text-red-600 bg-red-100'; // Red for aggressive
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
        
  <div className={`text-xl font-bold ${getYieldColorClass()}`}>
          →
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-500">
            {rsolAmount.toFixed(4)} RSOL
          </div>
          <div className="text-xs text-gray-500">You Receive</div>
        </div>
      </div>

      {/* Yield Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Yield: {yieldPercent.toFixed(2)}%</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getYieldBadgeClass()}`}>
            {getYieldLabel()}
          </span>
        </div>
        <input
          type="range"
          min={minYield}
          max={maxYield}
          step={step}
          value={yieldPercent}
          onChange={handleYieldChange}
          className="w-full h-2 bg-gradient-to-r from-green-400 via-indigo-500 to-red-400 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{minYield}%</span>
          <span>10%</span>
          <span>{maxYield}%</span>
        </div>
      </div>

      {/* Yield Information */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="p-3 bg-white rounded-md text-center border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            Current Ratio
          </div>
          <div className={`text-lg font-bold ${getYieldColorClass()}`}>
            {ratio.toFixed(3)}x
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-md text-center border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            Yield Type
          </div>
          <div className={`text-sm font-bold ${getYieldColorClass()}`}>
            {getYieldLabel()}
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
          • <strong>Safe (0-5%):</strong> Lower yield, lower risk<br/>
          • <strong>Standard (5-15%):</strong> Balanced yield and risk<br/>
          • <strong>Aggressive (15-20%):</strong> Higher yield, higher risk<br/>
          <br/>
          <em>Note: Higher yield means more RSOL minted per SOL, but also higher risk exposure.</em>
        </div>
      </div>
    </div>
  );
}
