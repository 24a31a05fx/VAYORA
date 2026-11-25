// ============================================================
// src/components/Dashboard/AirForecastCard.tsx
// Dynamic 6-Day Modelled Atmospheric & Air Quality Outlook
// Clearly labelled as estimated scenario projection anchored to active zone
// ============================================================

import { memo } from 'react';
import type { UrbanZone } from '@/types';
import { calculateAQICategory } from '@/lib/compute';

interface AirForecastCardProps {
  currentZone?: UrbanZone;
}

interface ForecastDay {
  day: string;
  date: string;
  temp: string;
  aqi: number;
  status: string;
}

const OFFSET_FACTORS = [0.88, 0.72, 1.05, 0.92, 0.78, 0.84];

function buildForecastDays(baseAqi: number, baseTempC: number): ForecastDay[] {
  const now = new Date();
  return OFFSET_FACTORS.map((factor, idx) => {
    const dt = new Date(now);
    dt.setDate(now.getDate() + idx + 1);
    const projectedAqi = Math.max(25, Math.min(480, Math.round(baseAqi * factor)));
    const projectedTemp = Math.round((baseTempC + (idx % 2 === 0 ? 1 : -1)) * 10) / 10;
    const dayLabel = idx === 0 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dt);
    const dateLabel = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' }).format(dt);
    return { day: dayLabel, date: dateLabel, temp: `${projectedTemp}°C`, aqi: projectedAqi, status: calculateAQICategory(projectedAqi) };
  });
}

function TomorrowHighlight({ day }: { day: ForecastDay }) {
  return (
    <div className="bg-gradient-to-r from-[#153C35] to-[#1C4E46] text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#99D5C9]">Next 24h Modelled Outlook</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-heading font-black text-xl">{day.day}</span>
          <span className="text-sm font-semibold text-[#99D5C9]">{day.temp}</span>
        </div>
        <span className="text-xs text-white/80">Estimated AQI: {day.aqi} ({day.status})</span>
      </div>
      <div className="w-20 h-8" aria-hidden="true">
        <svg viewBox="0 0 80 30" className="w-full h-full text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M 0 20 Q 20 5 40 18 T 80 10" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function ForecastRow({ day }: { day: ForecastDay }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F7F2] transition-colors text-xs">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[#202B29] min-w-[75px]">{day.day}</span>
        <span className="text-[#73817B] text-[11px]">{day.date}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-[#153C35] tabular-nums">{day.temp}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#153C35] min-w-[65px] text-center">AQI ~{day.aqi}</span>
      </div>
    </div>
  );
}

export const AirForecastCard = memo(function AirForecastCard({ currentZone }: AirForecastCardProps) {
  const days = buildForecastDays(currentZone?.aqi ?? 218, currentZone?.temperatureC ?? 11.5);
  const tomorrow = days[0]!;
  const restDays = days.slice(1);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div>
        <h3 className="font-heading font-bold text-base text-[#153C35]">Atmospheric Outlook — Projected Trend</h3>
        <p className="text-xs text-[#73817B] mt-0.5">Illustrative multi-day projection derived from current zone baseline (estimate)</p>
      </div>
      <TomorrowHighlight day={tomorrow} />
      <div className="flex flex-col gap-1">
        {restDays.map((d) => <ForecastRow key={d.day} day={d} />)}
      </div>
    </div>
  );
});
