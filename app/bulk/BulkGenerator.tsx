'use client';

import { useState, FormEvent } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar";
import ImagePreview from "../components/ImagePreview";
import StyleSelector from "../components/StyleSelector";
import AutoPrompt from "../components/AutoPrompt";
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

const cleanFileName = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
};

export default function BulkGenerator() {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [numSteps, setNumSteps] = useState(4);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

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
    if (isGenerating) return;

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
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 text-transparent bg-clip-text">
              Bulk Image Generator
            </h2>
            <p className="mt-2 text-purple-200/70">Generate multiple images at once from a single prompt.</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-purple-200">
                  Enter your prompt
                </label>
                <div className="mt-1 relative">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 p-4 pr-12 h-32 text-white placeholder-purple-200/50 focus:border-purple-500 focus:ring-purple-500 sm:text-sm backdrop-blur-xl"
                    placeholder="A cyberpunk lizard wearing sunglasses..."
                  />
                  <SparklesIcon className="absolute right-3 top-3 h-5 w-5 text-purple-300" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <AutoPrompt
                  onPromptSelect={setPrompt}
                />
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onStyleSelect={setSelectedStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200">
                    Number of Images
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:border-purple-500 focus:ring-purple-500 backdrop-blur-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200">
                    Aspect Ratio
                  </label>
                  <select
                    value={JSON.stringify(selectedRatio)}
                    onChange={(e) => setSelectedRatio(JSON.parse(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:border-purple-500 focus:ring-purple-500 backdrop-blur-xl [&>option]:bg-[#1e1b4b] [&>option]:text-white"
                  >
                    {aspectRatios.map((ratio) => (
                      <option key={ratio.label} value={JSON.stringify(ratio)}>
                        {ratio.label} ({ratio.width}x{ratio.height})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200">
                    Quality Steps ({numSteps})
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={numSteps}
                      onChange={(e) => setNumSteps(Number(e.target.value))}
                      className="w-full h-2 appearance-none bg-gradient-to-r from-purple-500/20 to-purple-500/20 rounded-lg cursor-pointer relative
                        before:absolute before:top-1/2 before:left-0 before:h-[2px] before:bg-gradient-to-r before:from-purple-500 before:to-purple-700 before:transform before:-translate-y-1/2
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-400 [&::-webkit-slider-thumb]:to-purple-600
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/25
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-300/50
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-purple-400 [&::-moz-range-thumb]:to-purple-600
                        [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-purple-500/25
                        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-300/50
                        [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150
                        [&::-moz-range-thumb]:hover:scale-110"
                    />
                    <div className="mt-1 flex justify-between px-1">
                      <div className="grid grid-cols-8 w-full gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-200 ${
                              i < numSteps
                                ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                                : 'bg-purple-500/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-purple-200/50">
                      <span>Fast</span>
                      <span>High Quality</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                {isGenerating ? `Generating (${progress.current}/${progress.total})` : "Generate Images"}
              </button>

              {isGenerating && (
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-700 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </form>

            {generatedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                    <div className={`relative rounded-xl overflow-hidden ${getAspectRatioClass(selectedRatio)}`}>
                      <img
                        src={image}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(image)}
                      />
                    </div>
                    <div className="mt-2 text-center text-sm text-purple-200/70">
                      Image {index + 1} of {count}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {previewImage && (
              <ImagePreview
                imageUrl={previewImage}
                alt="Generated image preview"
                onClose={() => setPreviewImage(null)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 