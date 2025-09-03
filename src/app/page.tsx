import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 dark:from-slate-900 dark:via-red-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-gray-900 dark:text-white text-xl font-bold">SecureHunt</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-md transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Secure the Digital
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"> World</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect ethical hackers with companies to discover vulnerabilities before malicious actors do.
              Build a safer internet, one bug at a time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transform transition-all"
            >
              Start Bug Hunting
            </Link>
            <Link
              href="/register"
              className="border-2 border-red-600 text-red-600 dark:text-red-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 hover:text-white transition-all hover:scale-105 transform"
            >
              Launch Your Program
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Security Researchers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Programs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$2M+</div>
              <div className="text-gray-600 dark:text-gray-400">Rewards Paid</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose SecureHunt?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The most trusted platform connecting security researchers with forward-thinking companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Researchers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">For Researchers</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Discover vulnerabilities in real-world applications and get rewarded for your ethical hacking skills.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Competitive rewards
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Global recognition
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Skill development
                </li>
              </ul>
            </div>

            {/* For Companies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">For Companies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Leverage the power of crowdsourced security testing to protect your digital assets and customers.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Proactive security
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Cost-effective testing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Expert insights
                </li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Platform Features</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Advanced tools and features designed to streamline the bug bounty process for everyone.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  AI-powered analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  Real-time collaboration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  Secure communication
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple steps to get started with ethical hacking or launching your bug bounty program
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your account as a researcher or company in minutes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Explore</h3>
              <p className="text-gray-600 dark:text-gray-300">Browse active programs or create your own bug bounty program</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Hunt & Report</h3>
              <p className="text-gray-600 dark:text-gray-300">Find vulnerabilities and submit detailed security reports</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Get Rewarded</h3>
              <p className="text-gray-600 dark:text-gray-300">Receive recognition and monetary rewards for valid findings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-red-50 dark:bg-red-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to Make the Internet Safer?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of security researchers and companies already using SecureHunt to build a more secure digital world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transform transition-all"
            >
              Join as Researcher
            </Link>
            <Link
              href="/register"
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transform transition-all"
            >
              Launch Your Program
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-gray-900 dark:text-white text-xl font-bold">SecureHunt</span>
            </div>
            <div className="flex space-x-6 text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 SecureHunt. All rights reserved. Building a safer digital world together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
