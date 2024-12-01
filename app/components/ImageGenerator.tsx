"use client";

import { useState, FormEvent } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

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
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [numSteps, setNumSteps] = useState(4);

  const generateImage = async () => {
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch("/api/generate_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
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

      setGeneratedImage(data.dataURI);
      setProgress(100);

    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      clearInterval(progressInterval);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await generateImage();
    setIsLoading(false);
  };

  const handleGenerateAnother = async () => {
    if (isLoading) return;
    setIsLoading(true);
    await generateImage();
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 text-transparent bg-clip-text">Image Generator</h2>
        <p className="mt-2 text-purple-200/70">Create stunning AI-generated images from text descriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200">
                  Aspect Ratio
                </label>
                <select
                  value={JSON.stringify(selectedRatio)}
                  onChange={(e) => setSelectedRatio(JSON.parse(e.target.value))}
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:border-purple-500 focus:ring-purple-500 backdrop-blur-xl"
                >
                  {aspectRatios.map((ratio) => (
                    <option key={ratio.label} value={JSON.stringify(ratio)}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200">
                  Quality Steps ({numSteps})
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={numSteps}
                  onChange={(e) => setNumSteps(Number(e.target.value))}
                  className="mt-3 block w-full accent-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? "Generating..." : "Generate Image"}
            </button>

            {isLoading && (
              <div className="w-full bg-white/10 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-700 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          {generatedImage ? (
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="aspect-square relative rounded-xl overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleGenerateAnother}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-purple-200 hover:bg-white/10 font-medium text-sm disabled:opacity-50 backdrop-blur-xl border border-white/10 transition-all duration-200"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  Download Image
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-purple-300/50" />
              <h3 className="mt-2 text-sm font-medium text-purple-200">No image generated</h3>
              <p className="mt-1 text-sm text-purple-200/50">Get started by generating your first image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
