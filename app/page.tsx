'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import AuthGuard from './components/AuthGuard';
import { Tab } from '@headlessui/react';
import { PhotoIcon, SparklesIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";
import AutoPromptGenerator from './components/AutoPromptGenerator';
import BulkGeneratorComponent from './components/BulkGeneratorComponent';


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const tabs = [
    { name: 'Image Generator', icon: PhotoIcon },
    { name: 'Auto Prompt', icon: SparklesIcon },
    { name: 'Bulk Generate', icon: Square3Stack3DIcon },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Generate Hub
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create stunning AI-generated images with different methods
            </p>
          </div>

          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 mb-6">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }: { selected: boolean }) =>
                    classNames(
                      'w-full py-3 px-4 text-sm font-medium flex items-center justify-center gap-2',
                      'focus:outline-none transition-all duration-200',
                      selected
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )
                  }
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <ImageGenerator />
              </Tab.Panel>
              <Tab.Panel>
                <AutoPromptGenerator />
              </Tab.Panel>
              <Tab.Panel>
                <BulkGeneratorComponent />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
