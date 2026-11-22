// ============================================================
// src/components/shared/VayoraLogo.tsx
// Distinctive VAYORA atmospheric airflow monogram & wordmark
// Inspired by fluid dynamics, laminar airflow, and vortex currents
// ============================================================

import { memo } from 'react';

interface VayoraLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

function StreamlinePaths() {
  return (
    <>
      <path d="M8 12C9.5 7.5 15.5 8 18 13.5C20.5 19 14.5 22 18 27.5" stroke="#9EBFA6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28 12C26.5 7.5 20.5 8 18 13.5C15.5 19 21.5 22 18 27.5" stroke="#3FB4A5" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="18" cy="13.5" r="2.2" fill="#F7F8F4" />
      <path d="M13 28C14.5 29.5 21.5 29.5 23 28" stroke="#D5E4D8" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function VayoraSymbol({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`shrink-0 ${className}`} aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#11322B" />
      <StreamlinePaths />
    </svg>
  );
}

export const VayoraLogo = memo(function VayoraLogo({ className = '', size = 36, showTagline = true }: VayoraLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VayoraSymbol size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-xl tracking-tight text-[#11322B] leading-none">
            VAYORA
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#EBF2EC] text-[#11322B] border border-[#B8CDB8]/60 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB4A5] animate-pulse" aria-hidden="true" />
            LIVE
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-[#73817B] font-medium tracking-tight mt-1">
            Air. Awareness. Action.
          </span>
        )}
      </div>
    </div>
  );
});
