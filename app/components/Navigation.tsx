'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="flex md:flex-row flex-col justify-between items-center px-8 py-6 bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent no-underline hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        >
          RSOL Platform
        </Link>
        <div className="hidden md:flex gap-2">
          <Link
            href="/"
            className="text-gray-700 no-underline px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-medium"
          >
            Home
          </Link>
          <Link
            href="/LST"
            className="text-gray-700 no-underline px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-medium"
          >
            Stake
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="flex md:hidden gap-2 mt-4 md:mt-0 order-first md:order-last">
        <Link
          href="/"
          className="text-gray-700 no-underline px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-medium"
        >
          Home
        </Link>
        <Link
          href="/LST"
          className="text-gray-700 no-underline px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-medium"
        >
          Stake
        </Link>
      </div>
      
      <div className="mt-4 md:mt-0">
        <WalletMultiButton className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none !rounded-xl !px-6 !py-3 !text-white !cursor-pointer !font-semibold !transition-all !duration-300 hover:!from-indigo-700 hover:!to-purple-700 hover:!shadow-lg hover:!transform hover:!-translate-y-0.5" />
      </div>
    </nav>
  );
}
