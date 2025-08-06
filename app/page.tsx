import Navigation from "./components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            RSOL Liquid Staking Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stake your SOL and receive RSOL tokens instantly. Earn staking rewards while maintaining liquidity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/LST"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Staking
            </Link>
            <Link 
              href="/api/test-webhook"
              target="_blank"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Test Webhook
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              🚀 Instant Liquidity
            </h3>
            <p className="text-gray-600">
              Receive RSOL tokens immediately when you stake SOL. No waiting periods or lock-up times.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              💰 Earn Rewards
            </h3>
            <p className="text-gray-600">
              Your staked SOL earns rewards automatically while you maintain full control of your RSOL tokens.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              🔗 Automated Process
            </h3>
            <p className="text-gray-600">
              Our webhook system automatically detects your SOL deposits and mints RSOL tokens to your wallet.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-600">Connect your Solana wallet to get started</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Stake SOL</h4>
              <p className="text-sm text-gray-600">Send SOL to our staking contract</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Receive RSOL</h4>
              <p className="text-sm text-gray-600">Get RSOL tokens minted to your wallet automatically</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Earn Rewards</h4>
              <p className="text-sm text-gray-600">Your SOL earns staking rewards over time</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Technical Implementation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Webhook Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Helius webhook monitors our wallet for SOL transfers</li>
                <li>• Automatic RSOL token minting upon SOL receipt</li>
                <li>• 1:1 ratio between SOL staked and RSOL minted</li>
                <li>• Real-time transaction processing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <code className="bg-white px-2 py-1 rounded">/api/webhook</code> - Helius webhook handler</li>
                <li>• <code className="bg-white px-2 py-1 rounded">/api/test-webhook</code> - Test webhook with static data</li>
                <li>• Devnet only for testing and development</li>
                <li>• Automatic error handling and logging</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
