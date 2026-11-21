// ============================================================
// src/components/Navigation/NavControls.tsx
// Language and Accessibility mode controls for navigation header & sidebar
// ============================================================

import { memo } from 'react';
import { Language, AccessibilityMode } from '@/types';

interface NavControlsProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  accessibilityMode: AccessibilityMode;
  onAccessibilityChange: (mode: AccessibilityMode) => void;
}

function LanguageSelect({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="flex-1 flex items-center gap-1.5 bg-[#F6F7F2] rounded-xl px-2.5 py-1.5 border border-[#E5EAE4]">
      <span className="text-xs text-[#73817B]" aria-hidden="true">🌐</span>
      <label htmlFor="language-select" className="sr-only">Select Language</label>
      <select id="language-select" value={language} onChange={(e) => onChange(e.target.value as Language)} className="bg-transparent text-xs text-[#202B29] font-semibold w-full focus:outline-none cursor-pointer">
        <option value={Language.English}>English (EN)</option>
        <option value={Language.Hindi}>हिन्दी (HI)</option>
        <option value={Language.Arabic}>العربية (AR)</option>
        <option value={Language.Spanish}>Español (ES)</option>
      </select>
    </div>
  );
}

function A11ySelect({ mode, onChange }: { mode: AccessibilityMode; onChange: (mode: AccessibilityMode) => void }) {
  return (
    <div className="flex-1 flex items-center gap-1.5 bg-[#F6F7F2] rounded-xl px-2.5 py-1.5 border border-[#E5EAE4]">
      <span className="text-xs text-[#73817B]" aria-hidden="true">♿</span>
      <label htmlFor="a11y-select" className="sr-only">Accessibility Mode</label>
      <select id="a11y-select" value={mode} onChange={(e) => onChange(e.target.value as AccessibilityMode)} className="bg-transparent text-xs text-[#202B29] font-medium w-full focus:outline-none cursor-pointer">
        <option value={AccessibilityMode.Standard}>Default Mode</option>
        <option value={AccessibilityMode.HighContrast}>High Contrast</option>
        <option value={AccessibilityMode.ReducedMotion}>Reduced Motion</option>
        <option value={AccessibilityMode.ScreenReader}>Screen Reader</option>
      </select>
    </div>
  );
}

export const NavControls = memo(function NavControls(props: NavControlsProps) {
  return (
    <div className="p-3 sm:p-4 border-t border-[#E5EAE4] bg-[#FFFFFF] flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <LanguageSelect language={props.language} onChange={props.onLanguageChange} />
        <A11ySelect mode={props.accessibilityMode} onChange={props.onAccessibilityChange} />
      </div>
      <div className="hidden lg:flex items-center justify-between text-[10px] text-[#73817B] px-1 pt-1">
        <span>EPA Standardized</span>
        <span>•</span>
        <span>VAYORA Intelligence</span>
      </div>
    </div>
  );
});
