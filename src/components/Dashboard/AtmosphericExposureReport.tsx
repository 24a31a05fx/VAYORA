// ============================================================
// src/components/Dashboard/AtmosphericExposureReport.tsx
// Bidirectional Bar Chart: Atmospheric Dispersion vs Inversion Trapping
// Directly inspired by Reference Design Image 1 ("Damaging Wind Report")
// ============================================================

import { memo } from 'react';

interface ExposureBarData {
  hour: string;
  dispersion: number;
  inversionTrap: number;
}

const HOURLY_DISPERSION_DATA: ExposureBarData[] = [
  { hour: '01', dispersion: 48, inversionTrap: -32 },
  { hour: '02', dispersion: 64, inversionTrap: -45 },
  { hour: '03', dispersion: 52, inversionTrap: -85 },
  { hour: '04', dispersion: 35, inversionTrap: -40 },
  { hour: '05', dispersion: 38, inversionTrap: -30 },
  { hour: '06', dispersion: 42, inversionTrap: -25 },
  { hour: '07', dispersion: 72, inversionTrap: -20 },
  { hour: '08', dispersion: 88, inversionTrap: -15 },
  { hour: '09', dispersion: 60, inversionTrap: -20 },
  { hour: '10', dispersion: 40, inversionTrap: -22 },
  { hour: '11', dispersion: 48, inversionTrap: -28 },
  { hour: '12', dispersion: 55, inversionTrap: -30 },
  { hour: '13', dispersion: 38, inversionTrap: -35 },
  { hour: '14', dispersion: 40, inversionTrap: -32 },
  { hour: '15', dispersion: 54, inversionTrap: -28 },
  { hour: '16', dispersion: 35, inversionTrap: -42 },
  { hour: '17', dispersion: 65, inversionTrap: -50 },
  { hour: '18', dispersion: 45, inversionTrap: -40 },
  { hour: '19', dispersion: 40, inversionTrap: -30 },
  { hour: '20', dispersion: 36, inversionTrap: -28 },
];

function ReportLegend() {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded bg-[#153C35]" />
        <span className="text-[#73817B] text-[11px]">Ventilation</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded bg-[#34D399]" />
        <span className="text-[#73817B] text-[11px]">Inversion Trap</span>
      </div>
    </div>
  );
}

function ReportHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-base text-[#153C35]">
            Personal Exposure — Atmospheric Exposure & Dispersion Report
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8]/60">
            Diurnal Model Curve
          </span>
        </div>
        <p className="text-xs text-[#73817B] mt-0.5">
          Illustrative hourly pattern comparing midday solar mixing vs nocturnal ground trapping
        </p>
      </div>
      <ReportLegend />
    </div>
  );
}

function BidirectionalBarItem({ item }: { item: ExposureBarData }) {
  const topHeight = Math.max(4, Math.round((item.dispersion / 100) * 48));
  const bottomHeight = Math.max(4, Math.round((Math.abs(item.inversionTrap) / 100) * 48));

  return (
    <div className="flex-1 flex flex-col items-center group relative min-w-[10px]">
      <div className="h-12 w-full flex items-end justify-center">
        <div style={{ height: `${topHeight}px` }} className="w-full max-w-[12px] bg-[#153C35] rounded-t-sm transition-all group-hover:bg-[#1C4E46]" />
      </div>
      <div className="w-full h-px bg-[#DDE5DE]" />
      <div className="h-12 w-full flex items-start justify-center">
        <div style={{ height: `${bottomHeight}px` }} className="w-full max-w-[12px] bg-[#34D399] rounded-b-sm transition-all group-hover:bg-[#2DD4BF]" />
      </div>
      <span className="text-[9px] text-[#73817B] mt-1 tabular-nums font-mono">{item.hour}</span>
    </div>
  );
}

function AccessibleDataTable() {
  return (
    <div className="sr-only" aria-label="Hourly Atmospheric Exposure and Inversion Table">
      <table>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Ventilation Index</th>
            <th>Inversion Trap Index</th>
          </tr>
        </thead>
        <tbody>
          {HOURLY_DISPERSION_DATA.map((d) => (
            <tr key={d.hour}>
              <td>{d.hour}:00</td>
              <td>{d.dispersion}</td>
              <td>{d.inversionTrap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarChartDisplay() {
  return (
    <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4 overflow-x-auto" aria-hidden="true">
      <div className="flex items-center justify-between gap-1 min-w-[480px]">
        {HOURLY_DISPERSION_DATA.map((d) => (
          <BidirectionalBarItem key={d.hour} item={d} />
        ))}
      </div>
    </div>
  );
}

export const AtmosphericExposureReport = memo(function AtmosphericExposureReport() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm shadow-[#153C35]/5">
      <ReportHeader />
      <AccessibleDataTable />
      <BarChartDisplay />
    </div>
  );
});
