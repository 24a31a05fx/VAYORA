// ============================================================
// src/hooks/useExposureRouting.ts
// Dijkstra pathfinder & multi-modal exposure comparison hook
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useZoneContext } from '@/context/ZoneContext';
import {
  dijkstraLowestExposure,
  computeModalComparisons,
  resolvePathNodes,
} from '@/lib/compute';
import { TRANSIT_NODES, TRANSIT_GRAPH } from '@/lib/constants';

function useRouteNodes(originId: string, destinationId: string) {
  const originNode = useMemo(() => {
    return TRANSIT_NODES.find((n) => n.id === originId) ?? TRANSIT_NODES[0];
  }, [originId]);

  const destNode = useMemo(() => {
    return TRANSIT_NODES.find((n) => n.id === destinationId) ?? TRANSIT_NODES[0];
  }, [destinationId]);

  return { originNode, destNode };
}

function useRouteCalculations(originId: string, destinationId: string, aqi: number) {
  const lowestExposureResult = useMemo(() => {
    return dijkstraLowestExposure(TRANSIT_GRAPH, originId, destinationId);
  }, [originId, destinationId]);

  const pathNodes = useMemo(() => {
    if (!lowestExposureResult) return [];
    return resolvePathNodes(lowestExposureResult.path, TRANSIT_NODES);
  }, [lowestExposureResult]);

  const routeDistanceKm = useMemo(() => lowestExposureResult?.totalDistance || 8.0, [lowestExposureResult]);
  const modalComparisons = useMemo(() => computeModalComparisons(routeDistanceKm, aqi), [routeDistanceKm, aqi]);

  return { lowestExposureResult, pathNodes, routeDistanceKm, modalComparisons };
}

export function useExposureRouting() {
  const { selectedZone } = useZoneContext();
  const [originId, setOriginId] = useState<string>('N-HOME');
  const [destinationId, setDestinationId] = useState<string>('N-WORK');
  const nodes = useRouteNodes(originId, destinationId);
  const calc = useRouteCalculations(originId, destinationId, selectedZone.aqi);

  const setOrigin = useCallback((id: string) => { setOriginId(id); }, []);
  const setDestination = useCallback((id: string) => { setDestinationId(id); }, []);

  return {
    nodes: TRANSIT_NODES,
    originId,
    destinationId,
    ...nodes,
    setOrigin,
    setDestination,
    ...calc,
  };
}
