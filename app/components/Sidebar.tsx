"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  PhotoIcon,
  ClockIcon,
  Square3Stack3DIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Generate", href: "/", icon: PhotoIcon },
    { name: "Bulk Generate", href: "/bulk", icon: Square3Stack3DIcon },
    { name: "History", href: "/history", icon: ClockIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-[#1e1b4b]/30 backdrop-blur-xl border-r border-white/5">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/5">
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
          <h1 className="text-xl font-semibold text-white">Artigma</h1>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-purple-200/50 uppercase tracking-wider">
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
                    group flex gap-x-3 rounded-xl p-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-500/20 text-purple-200 border border-purple-500/20"
                        : "text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-200"
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
