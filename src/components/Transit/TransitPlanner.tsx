// ============================================================
// src/components/Transit/TransitPlanner.tsx
// Multi-modal route exposure calculator & Dijkstra clean-corridor pathfinder
// Per PROBLEM_ALIGNMENT.md §1.3 & CODING_CONVENTIONS.md §4
// ============================================================

import { memo } from 'react';
import { useExposureRouting } from '@/hooks/useExposureRouting';
import { useAppContext } from '@/context/useAppContext';
import type { TransitNode, TransitRouteComparison, UrbanZone } from '@/types';
import type { DijkstraResult } from '@/lib/compute';
import { TransitComparisonTable } from './TransitComparisonTable';

interface WaypointProps {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  nodes: TransitNode[];
  showCorridor?: boolean;
}

function WaypointSelector({ id, label, icon, value, onChange, nodes, showCorridor }: WaypointProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[#202B29] uppercase tracking-wider">{label}</label>
      <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-2.5 flex items-center gap-2 focus-within:border-[#153C35] focus-within:ring-2 focus-within:ring-[#153C35]/15 transition-all">
        <span className="text-sm" aria-hidden="true">{icon}</span>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-xs font-semibold text-[#202B29] w-full focus:outline-none cursor-pointer">
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name} {showCorridor && node.isCleanCorridor ? '(Clean Corridor)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RouteBreadcrumbNodes({ nodes }: { nodes: TransitNode[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {nodes.map((n, idx) => (
        <li key={n.id} className="flex items-center gap-2">
          <span className={`px-3.5 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 shadow-xs ${n.isMetro ? 'bg-[#FFFFFF] text-[#0369A1] border-[#BAE6FD]' : n.isCleanCorridor ? 'bg-[#FFFFFF] text-[#153C35] border-[#B8CDB8]' : 'bg-[#FFFFFF] text-[#202B29] border-[#E5EAE4]'}`}>
            <span aria-hidden="true">{n.isMetro ? '🚇' : n.isCleanCorridor ? '🌲' : '📍'}</span>
            <span>{n.name}</span>
          </span>
          {idx < nodes.length - 1 && <span className="text-[#398F83] font-bold" aria-hidden="true">➔</span>}
        </li>
      ))}
    </ol>
  );
}

function OptimalTrajectoryBreadcrumbs({ result, distance, nodes }: { result: DijkstraResult; distance: number; nodes: TransitNode[] }) {
  return (
    <div className="bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black text-[#153C35] uppercase tracking-wider">
          Optimal Clean-Air Trajectory (Dijkstra Min-Exposure Cost: {result.totalExposure})
        </span>
        <span className="text-xs text-[#1E4E45] font-semibold">
          Distance: <strong className="text-[#153C35] tabular-nums font-black">{distance} km</strong>
        </span>
      </div>
      <nav aria-label="Lowest pollution route steps">
        <RouteBreadcrumbNodes nodes={nodes} />
      </nav>
    </div>
  );
}

function TransitRouteComparisonSection({ selectedZone, routeDistanceKm, modalComparisons }: { selectedZone: UrbanZone; routeDistanceKm: number; modalComparisons: TransitRouteComparison[] }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2"><span aria-hidden="true">⚖️</span> Multi-Modal Exposure & Carbon Comparison</h3>
          <p className="text-xs text-[#73817B] mt-0.5">Evaluated against ambient air in <strong className="text-[#202B29]">{selectedZone.zoneName}</strong> (AQI {selectedZone.aqi})</p>
        </div>
        <span className="text-xs text-[#73817B] bg-[#F6F7F2] px-3 py-1 rounded-full border border-[#E5EAE4] w-fit">Trip Length: <strong className="text-[#202B29] font-bold tabular-nums">{routeDistanceKm} km</strong></span>
      </div>
      <TransitComparisonTable modalComparisons={modalComparisons} />
    </div>
  );
}

export const TransitPlanner = memo(function TransitPlanner() {
  const { selectedZone } = useAppContext();
  const { nodes, originId, destinationId, setOrigin, setDestination, lowestExposureResult, pathNodes, routeDistanceKm, modalComparisons } = useExposureRouting();

  return (
    <section aria-label="Low-Emission Commute & Transit Planner" className="flex flex-col gap-6 fade-in">
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-xl font-black text-[#153C35] flex items-center gap-2"><span aria-hidden="true">🚇</span> Low-Exposure Commute & Transit Path Optimizer</h2>
          <p className="text-xs text-[#73817B] mt-1 max-w-2xl leading-relaxed">Dijkstra-powered algorithm identifying subterranean and clean-air corridors to bypass surface smog hotspots.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WaypointSelector id="origin-select" label="Commute Origin Waypoint:" icon="📍" value={originId} onChange={setOrigin} nodes={nodes} showCorridor />
          <WaypointSelector id="destination-select" label="Destination Waypoint:" icon="🏁" value={destinationId} onChange={setDestination} nodes={nodes} />
        </div>
        {lowestExposureResult && <OptimalTrajectoryBreadcrumbs result={lowestExposureResult} distance={routeDistanceKm} nodes={pathNodes} />}
      </div>
      <TransitRouteComparisonSection selectedZone={selectedZone} routeDistanceKm={routeDistanceKm} modalComparisons={modalComparisons} />
    </section>
  );
});
