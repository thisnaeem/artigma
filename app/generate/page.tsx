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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 text-transparent bg-clip-text">
              Stock Image Generator
            </h2>
            <p className="mt-2 text-purple-200/70">Generate AI images from Adobe Stock titles.</p>
          </div>

          <div className="space-y-6">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }} 
              className="space-y-6 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
            >
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-purple-200">
                  Enter your keyword
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="keyword"
                    type="text"
                    placeholder="Enter a keyword to search Adobe Stock..."
                    value={searchParams.query}
                    onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 p-4 pr-12 text-white placeholder-purple-200/50 focus:border-purple-500 focus:ring-purple-500 sm:text-sm backdrop-blur-xl"
                  />
                  <SparklesIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200">
                    Number of Pages
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={pages}
                    onChange={(e) => setPages(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
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

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-purple-200">
                    <input
                      type="checkbox"
                      checked={autoDownload}
                      onChange={(e) => setAutoDownload(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Auto-download generated images</span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isGenerating || !searchParams.query.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                {isGenerating ? `Generating (${progress.current}/${progress.total})` : "Generate Images"}
              </Button>

              {isGenerating && (
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-700 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </form>

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-purple-200">
                    Generated Images ({images.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 transition-all duration-200 hover:border-purple-500/50"
                    >
                      <div className={`relative rounded-xl overflow-hidden mb-3 ${getAspectRatioClass(selectedRatio)}`}>
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            onClick={() => downloadImage(image.url, image.title)}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-purple-200/90 line-clamp-2">
                        {image.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 