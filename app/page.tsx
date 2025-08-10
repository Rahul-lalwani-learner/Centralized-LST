import Navigation from "./components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
      <Navigation />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-br from-indigo-100 to-blue-200 shadow-lg min-h-[80vh]">
        <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-700 mb-6 tracking-tight">Liquid Staking Demo</h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">A modern platform to learn, visualize, and interact with Liquid Staking Tokens (LSTs) on Solana. Change yield, stake, unstake, and see protocol logic in action.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4">
          <Link href="/LST" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">Stake Demo</Link>
          <Link href="/unstake" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300">Unstake Demo</Link>
        </div>
      </section>

      {/* Visual Explainer Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 py-20 px-4">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-3xl font-bold text-indigo-700 mb-4">What is LST?</h2>
          <p className="text-lg text-gray-700 mb-4">LSTs (Liquid Staking Tokens) let you stake SOL and get RSOL, which earns yield and remains liquid. You can unstake RSOL to get SOL back, anytime.</p>
          <ul className="list-disc ml-5 text-gray-600 text-left mb-4">
            <li>Stake SOL → Mint RSOL</li>
            <li>RSOL earns yield, is tradable</li>
            <li>Unstake RSOL → Redeem SOL</li>
            <li>Change yield to see protocol logic</li>
          </ul>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-indigo-600 mb-4">How does it work?</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">🪙</span>
                <span className="font-semibold text-gray-700">Stake SOL</span>
                <span className="text-sm text-gray-500">Select yield, stake SOL, mint RSOL</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">💸</span>
                <span className="font-semibold text-gray-700">Unstake RSOL</span>
                <span className="text-sm text-gray-500">Select yield, burn RSOL, get SOL</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-600 text-center">
              <span className="font-semibold text-indigo-600">Yield Logic:</span> <br />
              Staking: RSOL = SOL / (1 + yield/100) <br />
              Unstaking: SOL = RSOL × (1 + yield/100)
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-br from-indigo-50 to-blue-100">
        <h2 className="text-4xl font-bold text-indigo-700 mb-6">Ready to Learn & Try?</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">Jump into the staking or unstaking demo, adjust yield, and see how LST protocols work. No real funds required—just explore and learn!</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/LST" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">Stake Demo</Link>
          <Link href="/unstake" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300">Unstake Demo</Link>
        </div>
      </section>
    </div>
  );
}
