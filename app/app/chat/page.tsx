'use client';

import { useState, useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, XIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface ChatResponse {
  message: string;
  error?: string;
}

interface ModelOption {
  value: string;
  label: string;
  description: string;
}

const modelOptions: ModelOption[] = [
  { value: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', label: 'Llama 3 (70B)', description: 'Most powerful model' },
  { value: '@cf/meta/llama-3.1-8b-instruct-fast', label: 'Llama 3 (8B)', description: 'Fast and efficient' },
  { value: '@cf/qwen/qwq-32b', label: 'Qwen (32B)', description: 'Strong general purpose' },
  { value: '@cf/google/gemma-3-12b-it', label: 'Gemma (12B)', description: 'Google\'s instruction model' },
  { value: '@cf/mistralai/mistral-small-3.1-24b-instruct', label: 'Mistral (24B)', description: 'High quality responses' },
  { value: '@cf/meta/llama-3.2-11b-vision-instruct', label: 'Llama Vision', description: 'Can analyze images' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check if file size is less than 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || isLoading) return;

    let userMessage: Message = { role: 'user', content: input.trim() };
    
    // If there's an image, add it to the message
    if (imageFile && imagePreview) {
      userMessage.image = imagePreview;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    clearImage();

    try {
      // Check if we're using a vision model and have an image
      const isVisionModel = selectedModel.includes('vision');
      const hasImage = !!userMessage.image;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          image: hasImage && isVisionModel ? userMessage.image : undefined,
        }),
      });

      const data = await response.json() as ChatResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedModelOption = () => {
    return modelOptions.find(option => option.value === selectedModel) || modelOptions[0];
  };

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-screen bg-white dark:bg-[#121212]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <label htmlFor="model-select" className="text-gray-900 dark:text-white mr-2 block text-sm font-medium mb-1">AI Model</label>
              <div className="relative">
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-3 py-2 appearance-none focus:outline-none focus:border-black dark:focus:border-white"
                >
                  {modelOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getSelectedModelOption().description}</p>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white block text-sm mb-1">Using: {getSelectedModelOption().label}</span>
                {selectedModel.includes('vision') ? 
                  <span className="text-green-600 dark:text-green-400 text-xs">✓ Supports image analysis</span> : 
                  <span className="text-gray-400 text-xs">× No image analysis support</span>
                }
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start a conversation</h3>
                <p className="mt-1 max-w-md">Ask anything or upload an image for analysis with a vision-capable model</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.image && (
                    <div className="mb-3 relative">
                      <div className="relative h-48 w-full max-w-md overflow-hidden">
                        <img 
                          src={message.image} 
                          alt="Uploaded image" 
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
            {imagePreview && (
              <div className="mb-3 relative">
                <div className="relative h-20 w-20 overflow-hidden border border-gray-300 dark:border-gray-700">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-0 right-0 p-1 bg-black/70 text-white hover:bg-black"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-4 py-3 pr-12 focus:outline-none focus:border-black dark:focus:border-white"
                />
                <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imageFile)}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ImageIcon className="h-3 w-3 mr-1" />
              {selectedModel.includes('vision') ? 
                <span>Image upload enabled with {getSelectedModelOption().label}</span> : 
                <span>Switch to a vision model to analyze images</span>
              }
            </div>
          </form>
        </div>
      </main>
    </div>
    </div>
  );
}