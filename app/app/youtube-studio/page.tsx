'use client';

import { useState } from 'react';
import { VideoCameraIcon, SparklesIcon, PhotoIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import Sidebar from '../components/Sidebar';


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

const availableImageModels = [
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/lykon/dreamshaper-8-lcm',
  '@cf/runwayml/stable-diffusion-v1-5-img2img',
  '@cf/runwayml/stable-diffusion-v1-5-inpainting',
  '@cf/stability-ai/stable-diffusion-xl-base-1.0',
];

const cleanFileName = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
};

export default function YouTubeStudio() {
  const [script, setScript] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [numPrompts, setNumPrompts] = useState(5);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [numSteps, setNumSteps] = useState(4);
  const [selectedImageModel, setSelectedImageModel] = useState(availableImageModels[0]);
  const [generatedImages, setGeneratedImages] = useState<{ prompt: string; image: string }[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(400);

  const generateScript = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate_script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          wordCount,
        }),
      });

      const data = await response.json() as { script?: string; error?: string };
      if (data.error) {
        throw new Error(data.error);
      }

      setScript(data.script || '');
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrompts = async () => {
    if (!script.trim()) {
      alert('Please generate a script first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate_prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          numPrompts,
        }),
      });

      const data = await response.json() as { prompts?: string[]; error?: string };
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedPrompts(data.prompts || []);
      setGeneratedImages([]);
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert('Failed to generate prompts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const convertToSpeech = async () => {
    if (!script.trim()) {
      alert('Please generate a script first');
      return;
    }

    setIsGeneratingSpeech(true);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
          lang: 'en',
        }),
      });

      const data = await response.json() as { audio?: string; error?: string; details?: string; errorCode?: string };
      if (data.error) {
        console.error('TTS API Error:', data);
        throw new Error(`${data.error}: ${data.details || 'Unknown error'} (Code: ${data.errorCode || 'UNKNOWN'})`);
      }

      if (data.audio) {
        // Convert base64 to blob URL for audio playback
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Failed to generate speech. Please try again.');
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const generateImage = async (prompt: string, index: number) => {
    setCurrentPromptIndex(index);
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

      setGeneratedImages(prev => [...prev, { prompt, image: data.dataURI }]);
    } catch (error) {
      console.error("Error:", error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setCurrentPromptIndex(null);
    }
  };

  const downloadImage = (dataURI: string, prompt: string) => {
    const fileName = cleanFileName(prompt);
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const link = document.createElement("a");
    link.href = dataURI;
    link.download = `${fileName}-${timestamp}.jpg`;
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
    <div>
      <div className="flex h-screen">
        <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <VideoCameraIcon className="h-8 w-8" />
              YouTube Studio
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Generate AI-powered scripts and visuals for your YouTube content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Script Generation Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Script Generator
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Video Topic
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter your video topic..."
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Script Length (Words)
                    </label>
                    <select
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value))}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                    >
                      <option value={200}>200 words (~1-2 minutes)</option>
                      <option value={400}>400 words (~2-3 minutes)</option>
                      <option value={600}>600 words (~3-4 minutes)</option>
                      <option value={800}>800 words (~4-5 minutes)</option>
                      <option value={1000}>1000 words (~5-6 minutes)</option>
                      <option value={1500}>1500 words (~7-8 minutes)</option>
                      <option value={2000}>2000 words (~10+ minutes)</option>
                    </select>
                  </div>
                  <button
                    onClick={generateScript}
                    disabled={isGenerating || !topic.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 ${
                      isGenerating || !topic.trim()
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                    } transition-colors`}
                  >
                    {isGenerating ? (
                      'Generating...'
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        Generate Script
                      </>
                    )}
                  </button>
                </div>
              </div>

              {script && (
                <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Generated Script
                  </h3>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full h-[400px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                  />
                  
                  {/* Convert to Speech Button */}
                  <div className="mt-4 flex flex-col gap-4">
                    <button
                      onClick={convertToSpeech}
                      disabled={isGeneratingSpeech || !script.trim()}
                      className={`flex items-center justify-center gap-2 py-2 px-4 ${
                        isGeneratingSpeech || !script.trim()
                          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } transition-colors`}
                    >
                      {isGeneratingSpeech ? (
                        'Converting to Speech...'
                      ) : (
                        <>
                          <SpeakerWaveIcon className="h-5 w-5" />
                          Convert to Speech
                        </>
                      )}
                    </button>
                    
                    {/* Audio Player */}
                    {audioUrl && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Generated Audio
                        </h4>
                        <audio controls className="w-full">
                          <source src={audioUrl} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                        <div className="mt-2">
                          <a
                            href={audioUrl}
                            download="script-audio.mp3"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                          >
                            Download Audio
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prompt and Image Generation Section */}
            <div className="space-y-6">
              {script && (
                <>
                  <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Generate Image Prompts
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                          Number of Prompts
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={numPrompts}
                          onChange={(e) => setNumPrompts(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="mt-1 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        />
                        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Fast</span>
                          <span>High Quality</span>
                        </div>
                      </div>

                      <button
                        onClick={generatePrompts}
                        disabled={isGenerating || !script.trim()}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 ${
                          isGenerating || !script.trim()
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                            : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                        } transition-colors`}
                      >
                        {isGenerating ? (
                          'Generating...'
                        ) : (
                          <>
                            <SparklesIcon className="h-5 w-5" />
                            Generate Prompts
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {generatedPrompts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Generated Prompts & Images
                      </h3>
                      <div className="space-y-6">
                        {generatedPrompts.map((prompt, index) => {
                          const generatedImage = generatedImages.find(img => img.prompt === prompt);
                          const [sceneDesc, ...visualDetails] = prompt.split('\n\n').map(p => p.trim());
                          
                          return (
                            <div
                              key={index}
                              className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                            >
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Scene {index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {sceneDesc}
                                  </p>
                                </div>
                                
                                {visualDetails.length > 0 && (
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                      {visualDetails.join('\n\n')}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {!generatedImage && (
                                <button
                                  onClick={() => generateImage(prompt, index)}
                                  disabled={currentPromptIndex === index}
                                  className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  {currentPromptIndex === index ? (
                                    'Generating...'
                                  ) : (
                                    <>
                                      <PhotoIcon className="h-4 w-4" />
                                      Generate Image
                                    </>
                                  )}
                                </button>
                              )}

                              {generatedImage && (
                                <div className="mt-4">
                                  <div className={`${getAspectRatioClass(selectedRatio)} relative overflow-hidden border border-gray-200 dark:border-gray-700`}>
                                    <img
                                      src={generatedImage.image}
                                      alt={`Scene ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    onClick={() => downloadImage(generatedImage.image, `scene-${index + 1}`)}
                                    className="mt-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white border border-black dark:border-white px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    Download
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
}