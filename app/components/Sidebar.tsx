'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhotoIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Generate', href: '/', icon: PhotoIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-[#1a1f37] text-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <PhotoIcon className="w-6 h-6" />
          AI Generator
        </h1>
      </div>
      <nav className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Menu</p>
        </div>
        <ul role="list" className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex gap-x-3 rounded-md p-2 text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
} 