'use client';

import { useState } from 'react';
import { ImageStyle, styleCategories, getStylesByCategory } from '@/lib/imageStyles';

interface StyleSelectorProps {
  selectedStyle: string | null;
  onStyleSelect: (styleId: string | null) => void;
  className?: string;
}

export default function StyleSelector({ selectedStyle, onStyleSelect, className = '' }: StyleSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const styles = getStylesByCategory(activeCategory);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
          Choose Style (Optional)
        </label>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {styleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* None Option */}
          <button
            onClick={() => onStyleSelect(null)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedStyle === null
                ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-2">🚫</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              No Style
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use original prompt
            </div>
          </button>

          {/* Style Options */}
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedStyle === style.id
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{style.thumbnail}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {style.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {style.description}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Style Preview */}
        {selectedStyle && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Style Prompt Addition:
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {styles.find(s => s.id === selectedStyle)?.prompt}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}