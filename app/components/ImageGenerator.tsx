"use client";

import { useState, FormEvent } from "react";
import {
  SparklesIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ImagePreview from "./ImagePreview";
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
  const [autoDownload, setAutoDownload] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

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
      } else if (!(error instanceof Error)) {
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

      const data = (await response.json()) as ApiResponse;

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

      // Automatically download if enabled
      if (autoDownload) {
        const fileName = cleanFileName(prompt);
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .split(".")[0];
        const link = document.createElement("a");
        link.href = data.dataURI;
        link.download = `${fileName}-${timestamp}.jpg`;
        link.click();
      }
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Image Generator
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create stunning AI-generated images from text descriptions.
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700"
        >
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-900 dark:text-gray-200"
            >
              Enter your prompt
            </label>
            <div className="relative">
              {showNSFWWarning && (
                <div className="fixed top-6 right-6 left-6 md:left-auto md:w-96 z-50">
                  <div className="bg-white dark:bg-gray-800 border border-red-500 text-gray-900 dark:text-gray-200 px-4 py-3 flex items-center gap-3 text-sm shadow-lg animate-in fade-in slide-in-from-top duration-300">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-red-500 mb-0.5">
                        Content Warning
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 truncate">
                        Your prompt may contain inappropriate content. Please revise and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-1 relative">
                <textarea
                  id="prompt"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A stunning landscape with mountains and a lake at sunset..."
                  className="block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0"
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3">
                  <button
                    type="button"
                    onClick={enhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="group relative flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Enhance prompt with AI"
                  >
                    {isEnhancing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 dark:border-gray-200 border-t-transparent" />
                        <span className="text-sm font-medium">Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <StarIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Enhance</span>
                      </>
                    )}
                    <div className="absolute bottom-full right-0 mb-2 w-64 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-xs text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      Enhance your prompt with AI to add more details about style,
                      lighting, mood, and composition
                    </div>
                  </button>
                </div>
                <SparklesIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Aspect Ratio
              </label>
              <select
                value={JSON.stringify(selectedRatio)}
                onChange={(e) => setSelectedRatio(JSON.parse(e.target.value))}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                disabled={isLoading}
              >
                {aspectRatios.map((ratio) => (
                  <option key={ratio.label} value={JSON.stringify(ratio)}>
                    {ratio.label} ({ratio.width}x{ratio.height})
                  </option>
                ))}
              </select>
            </div>

            <div>
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
                disabled={isLoading}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Fast</span>
                <span>High Quality</span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="auto-download"
              type="checkbox"
              checked={autoDownload}
              onChange={(e) => setAutoDownload(e.target.checked)}
              className="h-4 w-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-0"
              disabled={isLoading}
            />
            <label
              htmlFor="auto-download"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Auto-download generated images
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
          >
            {isLoading
              ? `Generating${".".repeat((progress % 30) / 10 + 1)}`
              : "Generate Image"}
          </button>

          {isLoading && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
              <div
                className="bg-black dark:bg-white h-1 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>

        {generatedImage && (
          <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generated Image
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div
                className={`relative ${getAspectRatioClass(
                  selectedRatio
                )} w-full md:w-1/2 overflow-hidden bg-gray-100 dark:bg-gray-900`}
              >
                <img
                  src={generatedImage}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Prompt
                  </h4>
                  <p className="text-gray-900 dark:text-white">{prompt}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-white dark:bg-gray-900 text-black dark:text-white border border-black dark:border-white px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={handleGenerateAnother}
                    disabled={isLoading}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black px-4 py-2 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
