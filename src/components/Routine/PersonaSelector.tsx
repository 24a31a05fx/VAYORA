// ============================================================
// src/components/Routine/PersonaSelector.tsx
// Persona profile selector chips for family and commuter vulnerability
// ============================================================

import { memo } from 'react';
import type { PersonaProfile } from '@/types';

interface PersonaSelectorProps {
  personas: PersonaProfile[];
  activePersona: PersonaProfile;
  onSelectPersona: (persona: PersonaProfile) => void;
}

export const PersonaSelector = memo(function PersonaSelector({
  personas,
  activePersona,
  onSelectPersona,
}: PersonaSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="text-xs font-bold text-[#202B29] uppercase tracking-wider">
        Target Family & Commuter Persona:
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {personas.map((p: PersonaProfile) => {
          const isSelected = p.id === activePersona.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectPersona(p)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${
                isSelected
                  ? 'bg-[#EBF2EC] border-[#153C35] ring-2 ring-[#153C35]/15 shadow-sm'
                  : 'bg-[#F6F7F2] border-[#E5EAE4] hover:border-[#B8CDB8] hover:bg-[#F2F7F3]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-heading font-bold text-sm ${
                    isSelected ? 'text-[#153C35]' : 'text-[#202B29]'
                  }`}
                >
                  {p.name}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                    p.sensitivityLevel === 'high'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {p.sensitivityLevel} Risk
                </span>
              </div>
              <p className="text-xs text-[#73817B] mt-1.5 line-clamp-2 leading-relaxed">
                {p.description}
              </p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
});
