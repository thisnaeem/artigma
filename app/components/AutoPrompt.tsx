'use client';

import { useState } from 'react';

interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: 'nature' | 'portrait' | 'abstract' | 'fantasy' | 'architecture' | 'animals';
  icon: string;
}

const promptSuggestions: PromptSuggestion[] = [
  // Nature
  {
    id: 'sunset-mountain',
    title: 'Mountain Sunset',
    prompt: 'Majestic mountain range at sunset, golden hour lighting, dramatic clouds, serene landscape',
    category: 'nature',
    icon: '🏔️'
  },
  {
    id: 'forest-path',
    title: 'Forest Path',
    prompt: 'Enchanted forest path, dappled sunlight through trees, moss-covered stones, magical atmosphere',
    category: 'nature',
    icon: '🌲'
  },
  {
    id: 'ocean-waves',
    title: 'Ocean Waves',
    prompt: 'Powerful ocean waves crashing on rocky shore, dramatic seascape, stormy sky',
    category: 'nature',
    icon: '🌊'
  },

  // Portrait
  {
    id: 'elegant-portrait',
    title: 'Elegant Portrait',
    prompt: 'Elegant portrait of a person, professional lighting, soft focus background, artistic composition',
    category: 'portrait',
    icon: '👤'
  },
  {
    id: 'vintage-portrait',
    title: 'Vintage Portrait',
    prompt: 'Vintage style portrait, sepia tones, classic clothing, nostalgic atmosphere, film photography',
    category: 'portrait',
    icon: '📷'
  },

  // Abstract
  {
    id: 'geometric-abstract',
    title: 'Geometric Abstract',
    prompt: 'Abstract geometric composition, vibrant colors, modern design, clean lines, contemporary art',
    category: 'abstract',
    icon: '🔷'
  },
  {
    id: 'fluid-abstract',
    title: 'Fluid Abstract',
    prompt: 'Fluid abstract art, flowing colors, organic shapes, dynamic movement, artistic expression',
    category: 'abstract',
    icon: '🌀'
  },

  // Fantasy
  {
    id: 'dragon-castle',
    title: 'Dragon Castle',
    prompt: 'Majestic dragon perched on ancient castle, fantasy landscape, magical atmosphere, epic scene',
    category: 'fantasy',
    icon: '🐉'
  },
  {
    id: 'fairy-forest',
    title: 'Fairy Forest',
    prompt: 'Enchanted fairy forest, glowing mushrooms, magical creatures, ethereal lighting, fantasy art',
    category: 'fantasy',
    icon: '🧚'
  },
  {
    id: 'wizard-tower',
    title: 'Wizard Tower',
    prompt: 'Ancient wizard tower, mystical energy, floating books, magical artifacts, fantasy interior',
    category: 'fantasy',
    icon: '🧙'
  },

  // Architecture
  {
    id: 'modern-building',
    title: 'Modern Architecture',
    prompt: 'Modern architectural masterpiece, glass and steel, geometric design, urban landscape',
    category: 'architecture',
    icon: '🏢'
  },
  {
    id: 'ancient-temple',
    title: 'Ancient Temple',
    prompt: 'Ancient temple ruins, weathered stone columns, overgrown with vines, historical atmosphere',
    category: 'architecture',
    icon: '🏛️'
  },

  // Animals
  {
    id: 'majestic-lion',
    title: 'Majestic Lion',
    prompt: 'Majestic lion portrait, golden mane, intense gaze, wildlife photography, natural habitat',
    category: 'animals',
    icon: '🦁'
  },
  {
    id: 'colorful-bird',
    title: 'Colorful Bird',
    prompt: 'Exotic colorful bird, vibrant plumage, tropical setting, detailed feathers, nature photography',
    category: 'animals',
    icon: '🦜'
  },
  {
    id: 'wolf-pack',
    title: 'Wolf Pack',
    prompt: 'Wolf pack in snowy forest, winter landscape, dramatic lighting, wildlife scene',
    category: 'animals',
    icon: '🐺'
  }
];

const categories = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'portrait', name: 'Portrait', icon: '👤' },
  { id: 'abstract', name: 'Abstract', icon: '🎨' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙' },
  { id: 'architecture', name: 'Architecture', icon: '🏛️' },
  { id: 'animals', name: 'Animals', icon: '🦁' }
];

interface AutoPromptProps {
  onPromptSelect: (prompt: string) => void;
  className?: string;
}

export default function AutoPrompt({ onPromptSelect, className = '' }: AutoPromptProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredPrompts = activeCategory === 'all' 
    ? promptSuggestions 
    : promptSuggestions.filter(p => p.category === activeCategory);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
          Quick Prompt Ideas
        </label>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {isExpanded ? 'Hide' : 'Show'} suggestions
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Prompt Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredPrompts.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onPromptSelect(suggestion.prompt)}
                className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 overflow-hidden"
                         style={{ 
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical'
                         }}>
                      {suggestion.prompt}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}