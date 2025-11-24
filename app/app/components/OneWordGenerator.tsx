'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StyleSelector from './StyleSelector';
import { applyStyleToPrompt } from '@/lib/imageStyles';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AspectRatio {
  label: string;
  width: number;
  height: number;
}

const aspectRatios: AspectRatio[] = [
  { label: "1:1 Square", width: 1024, height: 1024 },
  { label: "3:4 Portrait", width: 768, height: 1024 },
  { label: "4:3 Landscape", width: 1024, height: 768 },
  { label: "16:9 Widescreen", width: 1024, height: 576 },
];

const defaultImageModel = '@cf/black-forest-labs/flux-1-schnell';

interface GeneratedImage {
  keyword: string;
  imageUrl: string;
  seed: number;
  index: number;
}

export default function OneWordGenerator() {
  const [keywords, setKeywords] = useState('');
  const [imagesPerKeyword, setImagesPerKeyword] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<string | null>('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatios[0]);
  const [selectedModel] = useState(defaultImageModel);
  const [qualitySteps, setQualitySteps] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleGenerate = async () => {
    if (!keywords.trim()) return;

    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keywordList.length === 0) return;

    setIsGenerating(true);
    setGeneratedImages([]);
    const totalImages = keywordList.length * imagesPerKeyword;
    setProgress({ current: 0, total: totalImages });

    const newImages: GeneratedImage[] = [];

    for (let i = 0; i < keywordList.length; i++) {
      const keyword = keywordList[i];
      
      for (let j = 0; j < imagesPerKeyword; j++) {
        try {
          const prompt = selectedStyle ? applyStyleToPrompt(keyword, selectedStyle) : keyword;
          
          const response = await fetch('/api/generate_image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt,
              model: selectedModel,
              width: selectedAspectRatio.width,
              height: selectedAspectRatio.height,
              num_inference_steps: qualitySteps,
            }),
          });

          if (response.ok) {
            const data = await response.json() as { dataURI: string; seed: number };
            const newImage: GeneratedImage = {
              keyword,
              imageUrl: data.dataURI,
              seed: data.seed,
              index: j + 1,
            };
            newImages.push(newImage);
            setGeneratedImages([...newImages]);
          }
        } catch (error) {
          console.error('Error generating image:', error);
        }
        
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    }

    setIsGenerating(false);
  };

  const downloadImage = (imageUrl: string, keyword: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${keyword.replace(/[^a-zA-Z0-9]/g, '_')}_${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          One Word Generator
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords (separated by commas)
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="cat, dog, bird, flower, sunset"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images per keyword: {imagesPerKeyword}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={imagesPerKeyword}
              onChange={(e) => setImagesPerKeyword(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>10</span>
              <span>25</span>
              <span>40</span>
              <span>50</span>
            </div>
          </div>

          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleSelect={(style) => setSelectedStyle(style || '')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={selectedAspectRatio.label}
                onChange={(e) => {
                  const ratio = aspectRatios.find(r => r.label === e.target.value);
                  if (ratio) setSelectedAspectRatio(ratio);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {aspectRatios.map((ratio) => (
                  <option key={ratio.label} value={ratio.label}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality Steps: {qualitySteps}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={qualitySteps}
                onChange={(e) => setQualitySteps(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast</span>
                <span>High Quality</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !keywords.trim()}
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 animate-spin" />
                Generating... ({progress.current}/{progress.total})
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Generate Images
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Generated Images ({generatedImages.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={`Generated image for ${image.keyword}`}
                    className="w-full h-64 object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      onClick={() => downloadImage(image.imageUrl, image.keyword, image.index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black hover:bg-gray-200"
                    >
                      Download
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-medium">{image.keyword} #{image.index}</div>
                  <div>Seed: {image.seed}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}