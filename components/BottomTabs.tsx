'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Wifi, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const BottomTabs = () => {
  const pathname = usePathname() || '/'; // Fallback to '/' if null

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Store', path: '/store', icon: ShoppingBag },
    { name: 'Data', path: '/data', icon: Wifi },
    { name: 'Track', path: '/track', icon: Search },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-zinc-200 pb-safe max-w-md mx-auto">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          // Exact match for home ('/'), startsWith for others
          const isActive = tab.path === '/' 
            ? pathname === '/' 
            : pathname.startsWith(tab.path);
            
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-zinc-900" : "text-zinc-400"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6 transition-transform duration-200", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-900"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};