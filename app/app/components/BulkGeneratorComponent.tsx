'use client';

import { useState, FormEvent, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import StyleSelector from "./StyleSelector";
import AutoPrompt from "./AutoPrompt";
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

export default function BulkGeneratorComponent() {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [numSteps, setNumSteps] = useState(4);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageModel] = useState(defaultImageModel);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  useEffect(() => {
    const savedPrompt = localStorage.getItem('bulk_generator_prompt');
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem('bulk_generator_prompt');
    }
  }, []);

  const generateSingleImage = async (): Promise<string | null> => {
    try {
      // Apply style to prompt if selected
      const styledPrompt = selectedStyle ? applyStyleToPrompt(prompt, selectedStyle) : prompt;
      
      const response = await fetch("/api/generate_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: styledPrompt,
          num_steps: numSteps,
          width: selectedRatio.width,
          height: selectedRatio.height,
          model: selectedImageModel,
        }),
      });

      const data = await response.json() as ApiResponse;
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.dataURI) {
        throw new Error("No image data received");
      }

      return data.dataURI;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const downloadImage = (dataURI: string, index: number) => {
    const fileName = cleanFileName(prompt);
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const link = document.createElement("a");
    link.href = dataURI;
    link.download = `${fileName}-${index + 1}-${timestamp}.jpg`;
    link.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating || !prompt.trim()) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: count });
    setGeneratedImages([]);

    for (let i = 0; i < count; i++) {
      const image = await generateSingleImage();
      if (image) {
        setGeneratedImages(prev => [...prev, image]);
        downloadImage(image, i);
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }
    }

    setIsGenerating(false);
  };

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (`${ratio.width}x${ratio.height}`) {
      case '1024x576': return 'aspect-video'; // 16:9
      case '768x1024': return 'aspect-[3/4]'; // 3:4
      case '1024x768': return 'aspect-[4/3]'; // 4:3
      default: return 'aspect-square'; // 1:1
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
            Enter your prompt
          </label>
          <div className="mt-1 relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0"
              placeholder="A stunning landscape with mountains and a lake at sunset..."
              rows={3}
            />
            <SparklesIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <AutoPrompt
          onPromptSelect={setPrompt}
          className="mb-4"
        />

        <StyleSelector
          selectedStyle={selectedStyle}
          onStyleSelect={setSelectedStyle}
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
              Number of Images
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
              Aspect Ratio
            </label>
            <select
              value={JSON.stringify(selectedRatio)}
              onChange={(e) => setSelectedRatio(JSON.parse(e.target.value))}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio.label} value={JSON.stringify(ratio)}>
                  {ratio.label} ({ratio.width}x{ratio.height})
                </option>
              ))}
            </select>
          </div>


        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
            Quality Steps ({numSteps})
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={numSteps}
            onChange={(e) => setNumSteps(Number(e.target.value))}
            className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 appearance-none cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Fast</span>
            <span>High Quality</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
        >
          {isGenerating ? (
            <>
              Generating {progress.current}/{progress.total}...
            </>
          ) : (
            "Generate Multiple Images"
          )}
        </button>

        {isGenerating && (
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-1">
            <div
              className="bg-black dark:bg-white h-1 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {generatedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Generated Images ({generatedImages.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              >
                <div className={`${getAspectRatioClass(selectedRatio)} relative overflow-hidden`}>
                  <img
                    src={image}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {prompt} - Variation {index + 1}
                  </p>
                  <button
                    onClick={() => downloadImage(image, index)}
                    className="mt-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white border border-black dark:border-white px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}