import Navigation from "./components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center py-20 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live on Solana Devnet
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RSOL
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Liquid Staking Platform
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Stake your SOL and receive RSOL tokens instantly. Earn staking rewards while maintaining liquidity with our innovative ratio-based staking system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/LST"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Staking →
              </Link>
              <div className="text-sm text-gray-500">
                No minimum • Instant liquidity • Flexible ratios
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">0.8x - 1.2x</div>
            <div className="text-gray-700 font-medium">Flexible Ratios</div>
            <div className="text-sm text-gray-500 mt-2">Choose your risk/reward level</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
            <div className="text-gray-700 font-medium">Token Minting</div>
            <div className="text-sm text-gray-500 mt-2">Automated via webhooks</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-gray-700 font-medium">Liquid</div>
            <div className="text-sm text-gray-500 mt-2">No lock-up periods</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Instant Liquidity
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Receive RSOL tokens immediately when you stake SOL. No waiting periods or lock-up times. Trade or use your tokens right away.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Flexible Ratios
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Choose your own staking ratio from conservative (0.8x) to aggressive (1.2x). Customize your risk and reward profile.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Automated Process
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our webhook system automatically detects your SOL deposits and mints RSOL tokens using your selected ratio.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Stake your SOL in just a few simple steps and start earning rewards immediately
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                  <span className="text-2xl text-white font-bold">1</span>
                </div>
                <div className="absolute top-10 left-20 w-16 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 hidden md:block"></div>
              </div>
              <h4 className="font-bold mb-3 text-gray-900">Connect Wallet</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Connect your Solana wallet using Phantom, Solflare, or any supported wallet</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                  <span className="text-2xl text-white font-bold">2</span>
                </div>
                <div className="absolute top-10 left-20 w-16 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300 hidden md:block"></div>
              </div>
              <h4 className="font-bold mb-3 text-gray-900">Select Ratio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Choose your preferred staking ratio using our interactive slider interface</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                  <span className="text-2xl text-white font-bold">3</span>
                </div>
                <div className="absolute top-10 left-20 w-16 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-300 hidden md:block"></div>
              </div>
              <h4 className="font-bold mb-3 text-gray-900">Stake SOL</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Send SOL to our staking contract with your selected amount and ratio</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                  <span className="text-2xl text-white font-bold">4</span>
                </div>
              </div>
              <h4 className="font-bold mb-3 text-gray-900">Receive RSOL</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Get RSOL tokens automatically minted to your wallet based on your ratio</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl text-white">🔗</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Webhook Integration</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Helius webhook monitors our wallet for SOL transfers
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Automatic RSOL token minting based on your selected ratio
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Real-time transaction processing and confirmation
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl text-white">⚙️</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Platform Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Secure wallet-to-wallet SOL transfers
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Flexible ratio-based RSOL token distribution
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Built on Solana devnet with comprehensive tracking
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Staking?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join the future of liquid staking on Solana. Choose your ratio, stake your SOL, and earn rewards instantly.
            </p>
            <Link 
              href="/LST"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Launch App
              <span className="ml-2">🚀</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
