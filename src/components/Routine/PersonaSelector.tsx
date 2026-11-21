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

function PersonaCard({ persona, isSelected, onSelect }: { persona: PersonaProfile; isSelected: boolean; onSelect: (p: PersonaProfile) => void }) {
  const isHigh = persona.sensitivityLevel === 'high';
  const btnClass = isSelected
    ? 'bg-[#EBF2EC] border-[#153C35] ring-2 ring-[#153C35]/15 shadow-sm'
    : 'bg-[#F6F7F2] border-[#E5EAE4] hover:border-[#B8CDB8] hover:bg-[#F2F7F3]';
  const badgeClass = isHigh ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(persona)}
      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${btnClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-heading font-bold text-sm ${isSelected ? 'text-[#153C35]' : 'text-[#202B29]'}`}>{persona.name}</span>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
          {persona.sensitivityLevel} Risk
        </span>
      </div>
      <p className="text-xs text-[#73817B] mt-1.5 line-clamp-2 leading-relaxed">{persona.description}</p>
    </button>
  );
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
        {personas.map((p) => (
          <PersonaCard key={p.id} persona={p} isSelected={p.id === activePersona.id} onSelect={onSelectPersona} />
        ))}
      </div>
    </fieldset>
  );
});
