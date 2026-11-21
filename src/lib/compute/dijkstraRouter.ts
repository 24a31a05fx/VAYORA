// ============================================================
// src/lib/compute/dijkstraRouter.ts
// Dijkstra pathfinding for minimum cumulative smog exposure
// ============================================================

export interface PathEdge {
  to: string;
  distanceKm: number;
  exposureRate: number; // Pollutant intensity multiplier (1.0 = clean, 3.5 = smog hotspot)
}

export interface DijkstraResult {
  path: string[];
  totalDistance: number;
  totalExposure: number;
}

export interface ResolvableTransitNode {
  id: string;
  name: string;
  zoneId: string;
  isMetro: boolean;
  isCleanCorridor: boolean;
}

function reconstructPath(previous: Record<string, string | null>, target: string): string[] {
  const path: string[] = [];
  let step: string | null = target;
  while (step !== null) {
    path.unshift(step);
    step = previous[step] ?? null;
  }
  return path;
}

function findClosestNode(unvisited: Set<string>, distances: Record<string, number>): string | null {
  let closest: string | null = null;
  let minExposure = Infinity;
  for (const node of unvisited) {
    const dist = distances[node];
    if (dist !== undefined && dist < minExposure) {
      minExposure = dist;
      closest = node;
    }
  }
  return closest;
}

interface DijkstraState {
  distances: Record<string, number>;
  kmDistances: Record<string, number>;
  previous: Record<string, string | null>;
  unvisited: Set<string>;
}

function initDijkstraState(graph: Record<string, PathEdge[]>, start: string): DijkstraState {
  const distances: Record<string, number> = {};
  const kmDistances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    kmDistances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }
  distances[start] = 0;
  kmDistances[start] = 0;
  return { distances, kmDistances, previous, unvisited };
}

function relaxNeighbors(current: string, graph: Record<string, PathEdge[]>, state: DijkstraState): void {
  const neighbors = graph[current] ?? [];
  const currentDist = state.distances[current] ?? Infinity;
  const currentKm = state.kmDistances[current] ?? 0;
  for (const edge of neighbors) {
    if (!state.unvisited.has(edge.to)) continue;
    const targetDist = state.distances[edge.to] ?? Infinity;
    const alt = currentDist + edge.distanceKm * edge.exposureRate;
    if (alt < targetDist) {
      state.distances[edge.to] = alt;
      state.kmDistances[edge.to] = currentKm + edge.distanceKm;
      state.previous[edge.to] = current;
    }
  }
}

/**
 * Dijkstra lowest-exposure pathfinding algorithm.
 */
export function dijkstraLowestExposure(
  graph: Record<string, PathEdge[]>,
  start: string,
  target: string
): DijkstraResult | null {
  if (!graph[start] || !graph[target]) return null;
  if (start === target) return { path: [start], totalDistance: 0, totalExposure: 0 };

  const state = initDijkstraState(graph, start);

  while (state.unvisited.size > 0) {
    const current = findClosestNode(state.unvisited, state.distances);
    if (current === null || state.distances[current] === Infinity) break;

    if (current === target) {
      return {
        path: reconstructPath(state.previous, target),
        totalDistance: Math.round((state.kmDistances[target] ?? 0) * 100) / 100,
        totalExposure: Math.round((state.distances[target] ?? 0) * 100) / 100,
      };
    }

    state.unvisited.delete(current);
    relaxNeighbors(current, graph, state);
  }

  return null;
}

/**
 * Resolves node IDs from Dijkstra path into full metadata objects.
 */
export function resolvePathNodes<T extends ResolvableTransitNode>(
  path: string[],
  availableNodes: T[]
): T[] {
  return path.map((nodeId) => {
    return availableNodes.find((n) => n.id === nodeId) || availableNodes[0]!;
  });
}
