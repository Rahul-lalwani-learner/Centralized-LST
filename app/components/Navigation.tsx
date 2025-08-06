'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="flex md:flex-row flex-col justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-500 no-underline"
        >
          RSOL Platform
        </Link>
        <div className="flex gap-4">
          <Link
            href="/"
            className="text-gray-700 no-underline px-4 py-2 rounded-md transition-colors hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            href="/LST"
            className="text-gray-700 no-underline px-4 py-2 rounded-md transition-colors hover:bg-gray-100"
          >
            Stake
          </Link>
        </div>
      </div>
      <WalletMultiButton className="bg-indigo-500 border-none rounded-md px-4 py-2 text-white cursor-pointer" />
    </nav>
  );
}
