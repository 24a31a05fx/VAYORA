// ============================================================
// src/components/Routine/HouseholdContextForm.tsx
// Compact Step 1 & Step 2 household, lifestyle & neighborhood selector
// ============================================================

import { memo } from 'react';
import type { UrbanZone, HouseholdProfile, CommuteHabit, OutdoorActivityType, PurifierStatus, TelemetryDataSource } from '@/types';
import { getAQIColor } from '@/lib/compute';

interface HouseholdContextFormProps {
  zones: UrbanZone[];
  selectedZone: UrbanZone;
  dataSource: TelemetryDataSource;
  onSelectZone: (zoneId: string) => void;
  household: HouseholdProfile;
  onUpdateField: <K extends keyof HouseholdProfile>(key: K, value: HouseholdProfile[K]) => void;
}

function ZonePills({ zone, dataSource }: { zone: UrbanZone; dataSource: TelemetryDataSource }) {
  const color = getAQIColor(zone.aqi);
  const modeLabel = dataSource === 'open-meteo-live' ? 'Live Open-Meteo' : dataSource === 'simulated-scenario' ? 'Simulated' : 'Demo Baseline';
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="px-2.5 py-1 rounded-full font-mono font-bold border" style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}>
        AQI {zone.aqi} • {zone.category}
      </span>
      <span className="px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E5EAE4] font-mono font-semibold text-[#202B29]">
        PM2.5 {zone.pm25} µg/m³
      </span>
      <span className="px-2.5 py-1 rounded-full bg-[#EBF2EC] border border-[#B8CDB8] text-[10px] font-bold text-[#153C35]">
        {modeLabel}
      </span>
    </div>
  );
}

function ZoneSummaryRow({ zones, selectedZone, dataSource, onSelectZone }: { zones: UrbanZone[]; selectedZone: UrbanZone; dataSource: TelemetryDataSource; onSelectZone: (id: string) => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4">
      <div className="flex-1">
        <label htmlFor="routine-zone-select" className="text-[11px] font-bold uppercase tracking-wider text-[#73817B] block mb-1">
          Neighborhood / Urban Sector
        </label>
        <select id="routine-zone-select" value={selectedZone.zoneId} onChange={(e) => onSelectZone(e.target.value)} className="w-full sm:w-auto min-w-[240px] bg-[#FFFFFF] border border-[#E5EAE4] rounded-xl px-3 py-2 text-xs font-bold text-[#153C35] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] cursor-pointer">
          {zones.map((z) => <option key={z.zoneId} value={z.zoneId}>{z.zoneName} (AQI {z.aqi})</option>)}
        </select>
      </div>
      <ZonePills zone={selectedZone} dataSource={dataSource} />
    </div>
  );
}

function TextField({ id, label, value, maxLength, placeholder, onChange }: { id: string; label: string; value: string; maxLength: number; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold text-[#202B29]">{label}</label>
      <input id={id} type="text" maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-xl px-3 py-2 text-xs text-[#202B29] focus:outline-none focus:border-[#153C35]" />
    </div>
  );
}

function VulnerabilityToggles({ household, onUpdateField }: { household: HouseholdProfile; onUpdateField: HouseholdContextFormProps['onUpdateField'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <TextField id="hh-composition" label="Family Composition" maxLength={100} value={household.householdComposition} onChange={(v) => onUpdateField('householdComposition', v)} placeholder="e.g., 2 adults, 1 school child" />
      <TextField id="hh-sensitivities" label="Air Sensitivities (Optional)" maxLength={160} value={household.sensitivities} onChange={(v) => onUpdateField('sensitivities', v)} placeholder="e.g., asthma, bronchitis (voluntary)" />
      <div className="flex items-end gap-4 pb-1.5 text-xs">
        <label className="flex items-center gap-2 font-semibold text-[#202B29] cursor-pointer">
          <input type="checkbox" checked={household.hasChildren} onChange={(e) => onUpdateField('hasChildren', e.target.checked)} className="accent-[#153C35] w-4 h-4 rounded" />
          <span>Children / Infants</span>
        </label>
        <label className="flex items-center gap-2 font-semibold text-[#202B29] cursor-pointer">
          <input type="checkbox" checked={household.hasElderly} onChange={(e) => onUpdateField('hasElderly', e.target.checked)} className="accent-[#153C35] w-4 h-4 rounded" />
          <span>Older Adults</span>
        </label>
      </div>
    </div>
  );
}

function SelectField({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: Array<[string, string]>; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold text-[#202B29]">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-xl px-3 py-2 text-xs font-semibold text-[#202B29] focus:outline-none focus:border-[#153C35] cursor-pointer">
        {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
      </select>
    </div>
  );
}

function HabitsSelectGrid({ household, onUpdateField }: { household: HouseholdProfile; onUpdateField: HouseholdContextFormProps['onUpdateField'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SelectField id="hh-commute" label="Daily Commute Habit" value={household.commuteMode} onChange={(v) => onUpdateField('commuteMode', v as CommuteHabit)} options={[['metro', 'Underground Metro / Rail'], ['bus', 'City / Electric Bus'], ['car', 'Private Car / Rideshare'], ['walk-bike', 'Walking or Bicycle'], ['remote', 'Work / Learn from Home']]} />
      <SelectField id="hh-activity" label="Typical Outdoor Activity" value={household.outdoorActivity} onChange={(v) => onUpdateField('outdoorActivity', v as OutdoorActivityType)} options={[['school-run', 'School Drop-off & Pick-up'], ['exercise', 'Morning / Evening Walk or Run'], ['errands', 'Groceries & Daily Errands'], ['outdoor-work', 'Outdoor Work / Site Visits']]} />
      <SelectField id="hh-purifier" label="Current Indoor Air Setup" value={household.indoorPurifier} onChange={(v) => onUpdateField('indoorPurifier', v as PurifierStatus)} options={[['hepa', 'Commercial HEPA Purifier'], ['diy-box', 'DIY Corsi-Rosenthal / Box Fan'], ['none', 'No Purifier Yet (Natural Ventilation)']]} />
    </div>
  );
}

export const HouseholdContextForm = memo(function HouseholdContextForm(props: HouseholdContextFormProps) {
  return (
    <div className="flex flex-col gap-4 pt-3 border-t border-[#E5EAE4]">
      <ZoneSummaryRow zones={props.zones} selectedZone={props.selectedZone} dataSource={props.dataSource} onSelectZone={props.onSelectZone} />
      <VulnerabilityToggles household={props.household} onUpdateField={props.onUpdateField} />
      <HabitsSelectGrid household={props.household} onUpdateField={props.onUpdateField} />
    </div>
  );
});
