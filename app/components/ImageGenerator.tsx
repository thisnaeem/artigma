"use client";

import { useState, FormEvent } from "react";
import {
  SparklesIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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

interface EnhanceResponse {
  enhancedPrompt: string;
  error?: string;
  isNSFW?: boolean;
}

const aspectRatios: AspectRatio[] = [
  { label: "1:1 Square", width: 1024, height: 1024 },
  { label: "3:4 Portrait", width: 768, height: 1024 },
  { label: "4:3 Landscape", width: 1024, height: 768 },
  { label: "16:9 Widescreen", width: 1024, height: 576 },
];

const getAspectRatioClass = (ratio: AspectRatio) => {
  switch (`${ratio.width}x${ratio.height}`) {
    case "1024x576":
      return "aspect-video"; // 16:9
    case "768x1024":
      return "aspect-[3/4]"; // 3:4
    case "1024x768":
      return "aspect-[4/3]"; // 4:3
    default:
      return "aspect-square"; // 1:1
  }
};

const cleanFileName = (str: string): string => {
  // Remove special characters and spaces, limit length
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Replace special chars with hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .slice(0, 50); // Limit length
};

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(
    aspectRatios[0]
  );
  const [numSteps, setNumSteps] = useState(4);
  const [showNSFWWarning, setShowNSFWWarning] = useState(false);

  const enhancePrompt = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      alert("Please add your Gemini API key in Settings first");
      return;
    }

    if (!prompt.trim()) {
      alert("Please enter a prompt first");
      return;
    }

    setIsEnhancing(true);
    setShowNSFWWarning(false);

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey,
        }),
      });

      const data = (await response.json()) as EnhanceResponse;

      // Handle NSFW warning or safety blocks
      if (!response.ok && (data.isNSFW || data.error?.includes("SAFETY"))) {
        setShowNSFWWarning(true);
        setTimeout(() => setShowNSFWWarning(false), 5000);
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      // Success case
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      // Only show alert for non-safety related errors
      if (
        error instanceof Error &&
        !error.message.includes("SAFETY") &&
        !error.message.includes("Content Warning")
      ) {
        alert(error.message);
      } else if (!error instanceof Error) {
        alert("Failed to enhance prompt");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setShowNSFWWarning(false);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
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

      const data = await response.json();

      if (data.error === "NSFW content detected") {
        setShowNSFWWarning(true);
        setTimeout(() => setShowNSFWWarning(false), 5000);
        return;
      }

      if (!response.ok || !data.dataURI) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.dataURI);
      setProgress(100);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      clearInterval(progressInterval);
      setProgress(0);
      setIsLoading(false);
    }
  };

  const handleGenerateAnother = async () => {
    if (isLoading) return;
    await handleSubmit(new Event("submit") as any);
  };

  const handleDownload = () => {
    if (!generatedImage || !prompt) return;

    const fileName = cleanFileName(prompt);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `${fileName}-${timestamp}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 text-transparent bg-clip-text">
          Image Generator
        </h2>
        <p className="mt-2 text-purple-200/70">
          Create stunning AI-generated images from text descriptions.
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
        >
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-purple-200"
            >
              Enter your prompt
            </label>
            <div className="relative">
              {showNSFWWarning && (
                <div className="fixed top-6 right-6 left-6 md:left-auto md:w-96 z-50">
                  <div className="bg-purple-900/30 backdrop-blur-xl border border-red-500/20 text-purple-100 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg animate-in fade-in slide-in-from-top duration-300">
                    <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-red-400 mb-0.5">
                        Content Warning
                      </h3>
                      <p className="text-purple-200/70 truncate">
                        Please modify your prompt to be more appropriate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="custom-scrollbar block w-full rounded-xl border border-white/10 bg-white/5 p-4 pb-16 h-32 text-white placeholder-purple-200/50 focus:border-purple-500 focus:ring-purple-500 sm:text-sm backdrop-blur-xl"
                placeholder="A cyberpunk lizard wearing sunglasses..."
              />
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onClick={enhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Enhance prompt with AI"
                >
                  {isEnhancing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-transparent" />
                      <span className="text-sm font-medium">Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <StarIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Enhance</span>
                    </>
                  )}
                  <div className="absolute bottom-full right-0 mb-2 w-64 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-xs text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    Enhance your prompt with AI to add more details about style,
                    lighting, mood, and composition
                  </div>
                </button>
              </div>
              <SparklesIcon className="absolute top-3 right-3 h-5 w-5 text-purple-300/50" />
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

        {generatedImage && (
          <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            <div
              className={`relative rounded-xl overflow-hidden ${getAspectRatioClass(
                selectedRatio
              )}`}
            >
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
        )}
      </div>
    </div>
  );
}
