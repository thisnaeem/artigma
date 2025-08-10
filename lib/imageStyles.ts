export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
  category: 'artistic' | 'photographic' | 'digital' | 'abstract' | 'cinematic';
  tags: string[];
}

export const imageStyles: ImageStyle[] = [
  // Artistic Styles
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classic oil painting style with rich textures and brushstrokes',
    prompt: 'oil painting, classical art style, rich textures, visible brushstrokes, artistic masterpiece',
    thumbnail: '🎨',
    category: 'artistic',
    tags: ['classic', 'painting', 'artistic', 'traditional']
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft watercolor painting with flowing colors and transparency',
    prompt: 'watercolor painting, soft colors, flowing paint, transparent layers, artistic',
    thumbnail: '🌊',
    category: 'artistic',
    tags: ['soft', 'flowing', 'transparent', 'artistic']
  },
  {
    id: 'anime',
    name: 'Anime Style',
    description: 'Japanese anime and manga art style',
    prompt: 'anime style, manga art, Japanese animation, vibrant colors, detailed character design',
    thumbnail: '🎌',
    category: 'artistic',
    tags: ['anime', 'manga', 'japanese', 'vibrant']
  },
  {
    id: 'sketch',
    name: 'Pencil Sketch',
    description: 'Hand-drawn pencil sketch with detailed shading',
    prompt: 'pencil sketch, hand drawn, detailed shading, graphite, artistic drawing',
    thumbnail: '✏️',
    category: 'artistic',
    tags: ['sketch', 'pencil', 'drawing', 'monochrome']
  },

  // Photographic Styles
  {
    id: 'portrait',
    name: 'Portrait Photography',
    description: 'Professional portrait photography with perfect lighting',
    prompt: 'professional portrait photography, perfect lighting, sharp focus, bokeh background, high quality',
    thumbnail: '📸',
    category: 'photographic',
    tags: ['portrait', 'professional', 'photography', 'lighting']
  },
  {
    id: 'landscape',
    name: 'Landscape Photography',
    description: 'Stunning landscape photography with natural lighting',
    prompt: 'landscape photography, natural lighting, wide angle, stunning scenery, high resolution',
    thumbnail: '🏔️',
    category: 'photographic',
    tags: ['landscape', 'nature', 'wide-angle', 'scenery']
  },
  {
    id: 'macro',
    name: 'Macro Photography',
    description: 'Extreme close-up macro photography with fine details',
    prompt: 'macro photography, extreme close-up, fine details, shallow depth of field, professional',
    thumbnail: '🔍',
    category: 'photographic',
    tags: ['macro', 'close-up', 'detailed', 'professional']
  },
  {
    id: 'street',
    name: 'Street Photography',
    description: 'Urban street photography with authentic atmosphere',
    prompt: 'street photography, urban scene, authentic atmosphere, candid moment, documentary style',
    thumbnail: '🏙️',
    category: 'photographic',
    tags: ['street', 'urban', 'candid', 'documentary']
  },

  // Digital Styles
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyberpunk aesthetic with neon lights',
    prompt: 'cyberpunk style, neon lights, futuristic, dark atmosphere, high tech, digital art',
    thumbnail: '🌃',
    category: 'digital',
    tags: ['cyberpunk', 'neon', 'futuristic', 'digital']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Retro pixel art style with 8-bit aesthetics',
    prompt: 'pixel art, 8-bit style, retro gaming, pixelated, digital art, nostalgic',
    thumbnail: '🎮',
    category: 'digital',
    tags: ['pixel', '8-bit', 'retro', 'gaming']
  },
  {
    id: 'low-poly',
    name: 'Low Poly',
    description: 'Modern low poly 3D art with geometric shapes',
    prompt: 'low poly art, geometric shapes, 3D render, modern design, clean aesthetics',
    thumbnail: '🔷',
    category: 'digital',
    tags: ['low-poly', 'geometric', '3d', 'modern']
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Retro vaporwave aesthetic with pastel colors',
    prompt: 'vaporwave aesthetic, retro 80s, pastel colors, synthwave, nostalgic atmosphere',
    thumbnail: '🌴',
    category: 'digital',
    tags: ['vaporwave', 'retro', 'pastel', 'synthwave']
  },

  // Abstract Styles
  {
    id: 'abstract',
    name: 'Abstract Art',
    description: 'Modern abstract art with bold colors and shapes',
    prompt: 'abstract art, bold colors, geometric shapes, modern composition, artistic expression',
    thumbnail: '🎭',
    category: 'abstract',
    tags: ['abstract', 'modern', 'geometric', 'artistic']
  },
  {
    id: 'surreal',
    name: 'Surrealism',
    description: 'Surreal and dreamlike artistic composition',
    prompt: 'surrealism, dreamlike, impossible scenes, artistic imagination, Salvador Dali style',
    thumbnail: '🌀',
    category: 'abstract',
    tags: ['surreal', 'dreamlike', 'imagination', 'artistic']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean minimalist design with simple elements',
    prompt: 'minimalist design, clean composition, simple elements, negative space, modern aesthetics',
    thumbnail: '⚪',
    category: 'abstract',
    tags: ['minimalist', 'clean', 'simple', 'modern']
  },

  // Cinematic Styles
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie-like cinematic composition with dramatic lighting',
    prompt: 'cinematic composition, dramatic lighting, film photography, movie scene, professional cinematography',
    thumbnail: '🎬',
    category: 'cinematic',
    tags: ['cinematic', 'dramatic', 'film', 'professional']
  },
  {
    id: 'noir',
    name: 'Film Noir',
    description: 'Classic film noir style with high contrast black and white',
    prompt: 'film noir style, black and white, high contrast, dramatic shadows, vintage cinematography',
    thumbnail: '🎭',
    category: 'cinematic',
    tags: ['noir', 'black-white', 'vintage', 'dramatic']
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm golden hour lighting with soft atmospheric glow',
    prompt: 'golden hour lighting, warm atmosphere, soft glow, cinematic quality, beautiful lighting',
    thumbnail: '🌅',
    category: 'cinematic',
    tags: ['golden-hour', 'warm', 'atmospheric', 'cinematic']
  }
];

export const styleCategories = [
  { id: 'all', name: 'All Styles', icon: '🎨' },
  { id: 'artistic', name: 'Artistic', icon: '🎨' },
  { id: 'photographic', name: 'Photography', icon: '📸' },
  { id: 'digital', name: 'Digital Art', icon: '💻' },
  { id: 'abstract', name: 'Abstract', icon: '🎭' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' }
];

export const getStylesByCategory = (category: string): ImageStyle[] => {
  if (category === 'all') return imageStyles;
  return imageStyles.filter(style => style.category === category);
};

export const getStyleById = (id: string): ImageStyle | undefined => {
  return imageStyles.find(style => style.id === id);
};

export const applyStyleToPrompt = (userPrompt: string, styleId: string): string => {
  const style = getStyleById(styleId);
  if (!style) return userPrompt;
  
  // If user prompt is empty, return just the style prompt
  if (!userPrompt.trim()) return style.prompt;
  
  // Combine user prompt with style prompt
  return `${userPrompt}, ${style.prompt}`;
};