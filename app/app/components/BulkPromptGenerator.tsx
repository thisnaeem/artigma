"use client";

import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import StyleSelector from "./StyleSelector";
import { applyStyleToPrompt } from '@/lib/imageStyles';

interface AspectRatio {
  label: string;
  width: number;
  height: number;
}

interface ApiResponse {
  dataURI: string;
  seed: number;
  error?: string;
}

const aspectRatios: AspectRatio[] = [
  { label: "1:1 Square", width: 1024, height: 1024 },
  { label: "3:4 Portrait", width: 768, height: 1024 },
  { label: "4:3 Landscape", width: 1024, height: 768 },
  { label: "16:9 Widescreen", width: 1024, height: 576 },
];

const defaultImageModel = '@cf/black-forest-labs/flux-1-schnell';

const cleanFileName = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
};

export default function BulkPromptGenerator() {
  const [prompts, setPrompts] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [qualitySteps, setQualitySteps] = useState(4);
  const [selectedImageModel] = useState(defaultImageModel);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ prompt: string; image: string; seed: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number | null>(null);

  const generateImages = async () => {
    const promptList = prompts.split('\n').filter(p => p.trim().length > 0);
    
    if (promptList.length === 0) {
      alert('Please enter at least one prompt');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      for (let i = 0; i < promptList.length; i++) {
        setCurrentPromptIndex(i);
        const prompt = promptList[i].trim();
        const finalPrompt = selectedStyle ? applyStyleToPrompt(prompt, selectedStyle) : prompt;
        
        const response = await fetch("/api/generate_image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            num_steps: qualitySteps,
            width: selectedRatio.width,
            height: selectedRatio.height,
            model: selectedImageModel,
          }),
        });

        const data = await response.json() as ApiResponse;
        
        if (data.error) {
          console.error(`Error generating image for prompt ${i + 1}:`, data.error);
          continue;
        }

        if (data.dataURI) {
          setGeneratedImages(prev => [...prev, {
            prompt: prompt,
            image: data.dataURI,
            seed: data.seed
          }]);
        }
      }
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
      setCurrentPromptIndex(null);
    }
  };

  const downloadImage = (imageUrl: string, prompt: string, seed: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${cleanFileName(prompt)}-${seed}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    generatedImages.forEach((item, index) => {
      setTimeout(() => {
        downloadImage(item.image, item.prompt, item.seed);
      }, index * 100);
    });
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bulk Prompt Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter multiple prompts (one per line) to generate images in batch.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Input Section */}
        <div className="space-y-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Enter your prompts (one per line)
            </label>
            <textarea
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              placeholder={`A beautiful sunset over mountains
A cat sitting on a windowsill
A futuristic city skyline
A peaceful forest scene`}
              className="w-full h-40 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0 resize-none"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {prompts.split('\n').filter(p => p.trim().length > 0).length} prompts
            </p>
          </div>

          {/* Style Selector */}
          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleSelect={setSelectedStyle}
          />

          {/* Settings */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                Aspect Ratio
              </label>
              <select
                value={`${selectedRatio.width}x${selectedRatio.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  const ratio = aspectRatios.find(r => r.width === width && r.height === height);
                  if (ratio) setSelectedRatio(ratio);
                }}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
              >
                {aspectRatios.map((ratio) => (
                  <option key={`${ratio.width}x${ratio.height}`} value={`${ratio.width}x${ratio.height}`}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quality Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
              Quality Steps ({qualitySteps})
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Fast</span>
              <input
                type="range"
                min="1"
                max="8"
                value={qualitySteps}
                onChange={(e) => setQualitySteps(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">High Quality</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImages}
            disabled={isGenerating || !prompts.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 text-white font-medium ${
              isGenerating || !prompts.trim()
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
            } transition-colors`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                Generating... {currentPromptIndex !== null ? `(${currentPromptIndex + 1}/${prompts.split('\n').filter(p => p.trim().length > 0).length})` : ''}
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Generate Images
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6 w-full xl:col-span-1">
          {generatedImages.length > 0 && (
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generated Images ({generatedImages.length})
              </h3>
              <button
                onClick={downloadAllImages}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Download All
              </button>
            </div>
          )}

          <div className="space-y-4 max-h-[700px] overflow-y-auto">
            {generatedImages.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="flex flex-col space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {item.prompt}
                  </div>
                  <img
                    src={item.image}
                    alt={item.prompt}
                    className="w-full h-auto border border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Seed: {item.seed}
                    </span>
                    <button
                      onClick={() => downloadImage(item.image, item.prompt, item.seed)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}