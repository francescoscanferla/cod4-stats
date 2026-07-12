'use client';

import React from 'react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Caricamento dati in corso...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 animate-fade-in">
      <div className="relative flex items-center justify-center w-20 h-20">
   
        <div className="absolute inset-0 rounded-full border-2 border-ctp-red/20 animate-ping opacity-75" />

        <div className="w-16 h-16 rounded-full border-4 border-t-ctp-red border-r-transparent border-b-ctp-surface border-l-transparent animate-spin" />

        <div className="absolute w-2 h-2 rounded-full bg-ctp-red shadow-[0_0_8px_#f38ba8]" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
        <p className="text-sm font-mono uppercase tracking-widest text-ctp-text font-bold animate-pulse">
          {message}
        </p>
        <span className="text-[10px] font-mono text-ctp-subtext/60 tracking-wider uppercase">
          Calling Head Quarter
        </span>
      </div>
    </div>
  );
}