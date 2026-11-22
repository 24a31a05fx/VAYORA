// ============================================================
// src/components/Dashboard/AirForecastCard.tsx
// 7-Day Predictive Atmospheric & Air Quality Forecast
// Directly inspired by Reference Design Image 1 ("7 Days Forecast")
// ============================================================

import { memo } from 'react';

interface ForecastDay {
  day: string;
  date: string;
  temp: string;
  aqi: number;
  status: string;
  isTomorrow?: boolean;
}

const FORECAST_DAYS: ForecastDay[] = [
  { day: 'Tomorrow', date: '21 January', temp: '27°C', aqi: 62, status: 'Moderate', isTomorrow: true },
  { day: 'Wednesday', date: '22 January', temp: '24°C', aqi: 45, status: 'Good' },
  { day: 'Thursday', date: '23 January', temp: '29°C', aqi: 110, status: 'Unhealthy' },
  { day: 'Friday', date: '24 January', temp: '22°C', aqi: 85, status: 'Moderate' },
  { day: 'Saturday', date: '25 January', temp: '21°C', aqi: 38, status: 'Good' },
  { day: 'Sunday', date: '26 January', temp: '25°C', aqi: 95, status: 'Moderate' },
];

function TomorrowHighlight({ day }: { day: ForecastDay }) {
  return (
    <div className="bg-gradient-to-r from-[#153C35] to-[#1C4E46] text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#99D5C9]">Next 24h Window</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-heading font-black text-xl">{day.day}</span>
          <span className="text-sm font-semibold text-[#99D5C9]">{day.temp}</span>
        </div>
        <span className="text-xs text-white/80">Projected AQI: {day.aqi} ({day.status})</span>
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
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#153C35] min-w-[65px] text-center">
          AQI {day.aqi}
        </span>
      </div>
    </div>
  );
}

export const AirForecastCard = memo(function AirForecastCard() {
  const tomorrow = FORECAST_DAYS[0]!;
  const restDays = FORECAST_DAYS.slice(1);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div>
        <h3 className="font-heading font-bold text-base text-[#153C35]">
          Atmospheric Outlook — 7-Day Forecast
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">
          Predictive multi-day photochemical dispersion and meteorological model
        </p>
      </div>
      <TomorrowHighlight day={tomorrow} />
      <div className="flex flex-col gap-1">
        {restDays.map((d) => (
          <ForecastRow key={d.day} day={d} />
        ))}
      </div>
    </div>
  );
});
