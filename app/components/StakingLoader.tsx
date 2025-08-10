import React from "react";

interface StakingLoaderProps {
  show: boolean;
}

const StakingLoader: React.FC<StakingLoaderProps> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-2xl px-8 py-10 min-w-[320px] max-w-xs">
        <div className="mb-6">
          <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Staking in progress...</h3>
        <p className="text-gray-600 text-center text-sm mb-2">This can take some time.<br/>Please do not close the window.</p>
      </div>
    </div>
  );
};

export default StakingLoader;
