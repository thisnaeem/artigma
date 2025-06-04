'use client';

import { useState, useEffect } from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Configure your API keys and preferences.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <KeyIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gemini API Key</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your Gemini API key to enable prompt enhancement features. 
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-white hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
              <div className="space-y-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-medium text-sm transition-all duration-200"
                >
                  {isSaved ? 'Saved!' : 'Save API Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 