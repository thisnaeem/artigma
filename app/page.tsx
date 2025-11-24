import { WrenchScrewdriverIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
              <WrenchScrewdriverIcon className="h-16 w-16 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            This is Now a Paid Tool
          </h1>

          {/* Pricing Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lifetime Access
              </h2>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                PKR 6,000
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                or
              </p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                $25 USD
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Activate Your License
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
              Contact me on Instagram to activate your license and get lifetime access to all features
            </p>
            <div className="flex justify-center">
              <a
                href="https://instagram.com/thisnaeem"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @thisnaeem
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>One-time payment • Lifetime access • All features included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
