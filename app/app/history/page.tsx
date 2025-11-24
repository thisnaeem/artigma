'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';


interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{item.prompt}</p>
                  <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = item.imageUrl;
                      link.download = `generated-image-${item.id}.jpg`;
                      link.click();
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          {history.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No images generated yet</p>
          )}
        </div>
      </main>
    </div>
    </div>
  );
}