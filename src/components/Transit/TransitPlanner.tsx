// ============================================================
// src/components/Transit/TransitPlanner.tsx
// Multi-modal route exposure calculator & Dijkstra clean-corridor pathfinder
// Per PROBLEM_ALIGNMENT.md §1.3 & CODING_CONVENTIONS.md §4
// ============================================================

import { memo } from 'react';
import { useExposureRouting } from '@/hooks/useExposureRouting';
import { useAppContext } from '@/context/AppContext';
import { TransitComparisonTable } from './TransitComparisonTable';

export const TransitPlanner = memo(function TransitPlanner() {
  const { selectedZone } = useAppContext();
  const {
    nodes,
    originId,
    destinationId,
    setOrigin,
    setDestination,
    lowestExposureResult,
    pathNodes,
    routeDistanceKm,
    modalComparisons,
  } = useExposureRouting();

  return (
    <section aria-label="Low-Emission Commute & Transit Planner" className="flex flex-col gap-6 fade-in">
      {/* Route Pathfinder Selector */}
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-xl font-black text-[#153C35] flex items-center gap-2">
            <span aria-hidden="true">🚇</span> Low-Exposure Commute & Transit Path Optimizer
          </h2>
          <p className="text-xs text-[#73817B] mt-1 max-w-2xl leading-relaxed">
            Dijkstra-powered algorithm identifying subterranean and clean-air corridors to bypass surface smog hotspots.
          </p>
        </div>

        {/* Origin / Destination Waypoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="origin-select" className="text-xs font-bold text-[#202B29] uppercase tracking-wider">
              Commute Origin Waypoint:
            </label>
            <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-2.5 flex items-center gap-2 focus-within:border-[#153C35] focus-within:ring-2 focus-within:ring-[#153C35]/15 transition-all">
              <span className="text-sm" aria-hidden="true">📍</span>
              <select
                id="origin-select"
                value={originId}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#202B29] w-full focus:outline-none cursor-pointer"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} {node.isCleanCorridor ? '(Clean Corridor)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="destination-select" className="text-xs font-bold text-[#202B29] uppercase tracking-wider">
              Destination Waypoint:
            </label>
            <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-2.5 flex items-center gap-2 focus-within:border-[#153C35] focus-within:ring-2 focus-within:ring-[#153C35]/15 transition-all">
              <span className="text-sm" aria-hidden="true">🏁</span>
              <select
                id="destination-select"
                value={destinationId}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#202B29] w-full focus:outline-none cursor-pointer"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lowest Exposure Path Breadcrumbs */}
        {lowestExposureResult && (
          <div className="bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-[#153C35] uppercase tracking-wider">
                Optimal Clean-Air Trajectory (Dijkstra Min-Exposure Cost: {lowestExposureResult.totalExposure})
              </span>
              <span className="text-xs text-[#1E4E45] font-semibold">
                Distance: <strong className="text-[#153C35] tabular-nums font-black">{routeDistanceKm} km</strong>
              </span>
            </div>

            <nav aria-label="Lowest pollution route steps">
              <ol className="flex flex-wrap items-center gap-2 text-xs">
                {pathNodes.map((n, idx) => (
                  <li key={n.id} className="flex items-center gap-2">
                    <span
                      className={`px-3.5 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 shadow-xs ${
                        n.isMetro
                          ? 'bg-[#FFFFFF] text-[#0369A1] border-[#BAE6FD]'
                          : n.isCleanCorridor
                          ? 'bg-[#FFFFFF] text-[#153C35] border-[#B8CDB8]'
                          : 'bg-[#FFFFFF] text-[#202B29] border-[#E5EAE4]'
                      }`}
                    >
                      <span aria-hidden="true">{n.isMetro ? '🚇' : n.isCleanCorridor ? '🌲' : '📍'}</span>
                      <span>{n.name}</span>
                    </span>
                    {idx < pathNodes.length - 1 && (
                      <span className="text-[#398F83] font-bold" aria-hidden="true">➔</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
      </div>

      {/* Multi-Modal Comparison Table */}
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
              <span aria-hidden="true">⚖️</span> Multi-Modal Exposure & Carbon Comparison
            </h3>
            <p className="text-xs text-[#73817B] mt-0.5">
              Evaluated against current ambient air quality in <strong className="text-[#202B29]">{selectedZone.zoneName}</strong> (AQI {selectedZone.aqi})
            </p>
          </div>
          <span className="text-xs text-[#73817B] bg-[#F6F7F2] px-3 py-1 rounded-full border border-[#E5EAE4] w-fit">
            Trip Length: <strong className="text-[#202B29] font-bold tabular-nums">{routeDistanceKm} km</strong>
          </span>
        </div>

        <TransitComparisonTable modalComparisons={modalComparisons} />
      </div>
    </section>
  );
});
