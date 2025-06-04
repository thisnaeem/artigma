"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../components/Sidebar'; 
import { SparklesIcon } from "@heroicons/react/24/outline";

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

interface SearchParams {
  query: string;
  page: number;
  limit: number;
  contentType: {
    photo: boolean;
    illustration: boolean;
    vector: boolean;
    video: boolean;
    template: boolean;
    "3d": boolean;
    audio: boolean;
  };
  safeSearch: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface SearchResponse {
  items: any[];
  total: number;
  num_pages: number;
}

interface ApiResponse {
  dataURI: string;
  seed: number;
  error?: string;
}

const cleanFileName = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
};

const availableImageModels = [
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/lykon/dreamshaper-8-lcm',
  '@cf/runwayml/stable-diffusion-v1-5-img2img',
  '@cf/runwayml/stable-diffusion-v1-5-inpainting',
  '@cf/stability-ai/stable-diffusion-xl-base-1.0',
];

export default function GeneratePage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    page: 1,
    limit: 100,
    contentType: {
      photo: true,
      illustration: true,
      vector: false,
      video: false,
      template: false,
      "3d": false,
      audio: false,
    },
    safeSearch: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<{ id: string; title: string; url: string }[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState(1);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [numSteps, setNumSteps] = useState(4);
  const [autoDownload, setAutoDownload] = useState(true);
  const [selectedImageModel, setSelectedImageModel] = useState(availableImageModels[0]);

  const fetchResults = async (params: SearchParams): Promise<SearchResult[]> => {
    let results: SearchResult[] = [];

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: SearchResponse = await response.json();
      
      results = Object.values(data.items).map((item) => ({
        id: item.id32,
        title: item.title,
        thumbnailUrl: item.thumbnail_url,
      }));
    } catch (error) {
      console.error("Error fetching results:", error);
    }

    return results;
  };

  const fetchStats = async (params: SearchParams) => {
    let totalItems = 0;
    let totalPages = 0;

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: SearchResponse = await response.json();

    totalItems = data.total;
    totalPages = data.num_pages;

    return { totalItems, totalPages };
  };

  const generateSingleImage = async (prompt: string): Promise<string | null> => {
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
      console.error("Error generating image:", error);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!searchParams.query) {
      alert("Please enter a search query");
      return;
    }

    setIsGenerating(true);
    setImages([]);

    try {
      setProgress({ current: 0, total: 0 });

      const promises = Array.from({ length: pages }).map(async (_, index) => {
        const newSearchParams = { ...searchParams, page: index + 1 };
        const results = await fetchResults(newSearchParams);
        console.log(results)
        return results;
      });

      const allResults = await Promise.all(promises);
      const titles = allResults.flat().map(result => result.title);
      console.log(titles)
      // Update total for progress
      setProgress(prev => ({ ...prev, total: titles.length }));

      // Generate images for each title
      for (let i = 0; i < titles.length; i++) {
        const title = titles[i];
        const imageUrl = await generateSingleImage(title);
        
        if (imageUrl) {
          setImages(prev => [...prev, {
            id: `img-${i}`,
            title: title,
            url: imageUrl
          }]);

          // Auto-download if enabled
          if (autoDownload) {
            downloadImage(imageUrl, title);
          }
        }
        
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while generating images");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (dataURI: string, title: string) => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const fileName = `${cleanFileName(title)}-${timestamp}.jpg`;
    const link = document.createElement("a");
    link.href = dataURI;
    link.download = fileName;
    link.click();
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Image Generator
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Generate AI images from text descriptions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Enter your prompt
                </label>
                <div className="mt-1 relative">
                  <Input
                    placeholder="A stunning landscape with mountains..."
                    value={searchParams.query}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, query: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0"
                  />
                  <SparklesIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Number of Pages
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value) || 1)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Model
                  </label>
                  <select
                    value={selectedImageModel}
                    onChange={(e) => setSelectedImageModel(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                  >
                    {availableImageModels.map((model) => (
                      <option key={model} value={model}>
                        {model.split('/').pop()}
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

              <div className="flex items-center mb-4">
                <input
                  id="auto-download"
                  type="checkbox"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                  className="h-4 w-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-0"
                />
                <label
                  htmlFor="auto-download"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Auto-download generated images
                </label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !searchParams.query}
                className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    Generating {progress.current}/{progress.total}...
                  </>
                ) : (
                  "Generate Images"
                )}
              </Button>

              {isGenerating && progress.total > 0 && (
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-1">
                  <div
                    className="bg-black dark:bg-white h-1 transition-all duration-300"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Generated Images ({images.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      <div className={`${getAspectRatioClass(selectedRatio)} relative overflow-hidden`}>
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {image.title}
                        </p>
                        <button
                          onClick={() => downloadImage(image.url, image.title)}
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
        </div>
      </div>
    </div>
  );
} 