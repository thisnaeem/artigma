'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, KeyIcon } from '@heroicons/react/24/outline';
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 text-transparent bg-clip-text">
              Settings
            </h2>
            <p className="mt-2 text-purple-200/70">Configure your API keys and preferences.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <KeyIcon className="h-5 w-5 text-purple-300" />
                <h3 className="text-lg font-medium text-white">Gemini API Key</h3>
              </div>
              <p className="text-sm text-purple-200/70 mb-4">
                Enter your Gemini API key to enable prompt enhancement features. 
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
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
                  className="block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-purple-200/50 focus:border-purple-500 focus:ring-purple-500 sm:text-sm backdrop-blur-xl"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-500/25"
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