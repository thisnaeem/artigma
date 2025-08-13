"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  PhotoIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();

  const navigation = [
    { name: "AI Generate Hub", href: "/", icon: PhotoIcon },
    { name: "Chat", href: "/chat", icon: ChatBubbleLeftRightIcon },
    { name: "YouTube Studio", href: "/youtube-studio", icon: VideoCameraIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: UserGroupIcon },
  ];

  return (
    <div className="flex h-full w-72 flex-col bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="Artigma Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Artigma</h1>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            MENU
          </p>
        </div>
        <ul role="list" className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex gap-x-3 py-3 px-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-l-2 border-black dark:border-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-black dark:hover:text-white"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}

          {/* Admin Navigation */}
          {user?.role === 'ADMIN' && (
            <>
              <div className="mt-6 mb-4">
                <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ADMIN
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 py-3 px-2 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-l-2 border-black dark:border-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-black dark:hover:text-white"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </>
          )}
        </ul>

        {/* User Info and Sign Out */}
        {user && (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="font-medium text-gray-900 dark:text-white">
                {user.name || 'User'}
              </div>
              <div className="text-xs">{user.email}</div>
              <div className="text-xs mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  user.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={signout}
              className="w-full flex items-center gap-x-3 py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-black dark:hover:text-white transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
