// ============================================================
// src/components/IAQ/IAQCenter.tsx
// Indoor Air Quality (IAQ), Room CADR Calculator, and Low-Cost DIY Hack Center
// Per PROBLEM_ALIGNMENT.md §1.4 & EFFICIENCY.md §2
// ============================================================

import { memo, useState, useMemo, useCallback } from 'react';
import { useIAQContext } from '@/context/IAQContext';
import { useZoneContext } from '@/context/ZoneContext';
import { calculateRoomVolume, calculateRequiredCADR, estimatePurificationTime } from '@/lib/compute';
import type { IAQRoomConfig } from '@/types';
import { DEFAULT_ROOMS } from '@/lib/constants';
import { WindowSchedule } from './WindowSchedule';
import { DIYHackGrid } from './DIYHackGrid';

function RoomSelectorTabs({ rooms, selectedRoomId, onSelect }: { rooms: IAQRoomConfig[]; selectedRoomId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {rooms.map((room) => {
        const isSelected = room.roomId === selectedRoomId;
        const btnClass = isSelected ? 'bg-[#153C35] text-white shadow-sm shadow-[#153C35]/20 font-bold' : 'bg-[#F6F7F2] text-[#202B29] hover:bg-[#EBF2EC] hover:text-[#153C35] border border-[#E5EAE4]';
        return (
          <button key={room.roomId} type="button" aria-pressed={isSelected} onClick={() => onSelect(room.roomId)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${btnClass}`}>
            {room.roomName}
          </button>
        );
      })}
    </div>
  );
}

function RoomParameterControls({ area, cadr, onAreaChange, onCadrChange }: { area: number; cadr: number; onAreaChange: (a: number) => void; onCadrChange: (c: number) => void }) {
  return (
    <div className="lg:col-span-5 bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <div className="flex justify-between text-xs font-bold text-[#202B29]"><label htmlFor="room-area-range">Floor Area:</label><span className="text-[#153C35] font-extrabold tabular-nums">{area} m²</span></div>
        <input id="room-area-range" type="range" min="6" max="80" step="1" value={area} onChange={(e) => onAreaChange(parseFloat(e.target.value))} className="w-full mt-2 accent-[#153C35] cursor-pointer" />
      </div>
      <div>
        <div className="flex justify-between text-xs font-bold text-[#202B29]"><label htmlFor="room-cadr-range">Purifier Clean Air Delivery Rate (CADR):</label><span className="text-[#153C35] font-extrabold tabular-nums">{cadr} m³/h</span></div>
        <input id="room-cadr-range" type="range" min="0" max="600" step="20" value={cadr} onChange={(e) => onCadrChange(parseFloat(e.target.value))} className="w-full mt-2 accent-[#153C35] cursor-pointer" />
      </div>
    </div>
  );
}

function DiagnosticMetricsGrid({ requiredCadr, roomVolume, ceilingHeight, effectiveAch, purificationTime }: { requiredCadr: number; roomVolume: number; ceilingHeight: number; effectiveAch: number; purificationTime: number }) {
  return (
    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">Target CADR (4 ACH)</span>
        <div className="font-heading text-2xl font-black text-[#153C35] mt-2 tabular-nums">{requiredCadr} <span className="text-xs font-normal text-[#73817B]">m³/h</span></div>
        <p className="text-[11px] text-[#73817B] mt-2">Volume: {roomVolume} m³ ({ceilingHeight}m ceiling).</p>
      </div>
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">Effective Air Changes</span>
        <div className="font-heading text-2xl font-black text-[#398F83] mt-2 tabular-nums">{effectiveAch} <span className="text-xs font-normal text-[#73817B]">ACH</span></div>
        <p className="text-[11px] text-[#73817B] mt-2">{effectiveAch >= 4 ? 'Meets hospital-grade clean room target.' : 'Sub-optimal air recycling rate.'}</p>
      </div>
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">80% Clean Time</span>
        <div className="font-heading text-2xl font-black text-[#153C35] mt-2 tabular-nums">{purificationTime > 120 ? 'No Purifier' : `${purificationTime} mins`}</div>
        <p className="text-[11px] text-[#73817B] mt-2">Time required to filter out airborne ambient particles.</p>
      </div>
    </div>
  );
}

function CadrDeficitBanner({ cadrDeficit }: { cadrDeficit: number }) {
  if (cadrDeficit <= 0) return null;
  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#92400E]">
      <div className="flex items-center gap-3">
        <div><strong className="font-bold">CADR Deficit Detected:</strong> Your current setup is short by <strong className="text-[#78350F] tabular-nums font-black">{cadrDeficit} m³/h</strong>. Build a low-cost DIY Corsi-Rosenthal Box to achieve full 4 ACH protection!</div>
      </div>
    </div>
  );
}

function useRoomDiagnostics() {
  const { rooms, updateRoom } = useIAQContext();
  const { selectedZone } = useZoneContext();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => rooms[0]?.roomId ?? DEFAULT_ROOMS[0].roomId);
  const activeRoom = useMemo(() => rooms.find((r) => r.roomId === selectedRoomId) ?? rooms[0] ?? DEFAULT_ROOMS[0], [rooms, selectedRoomId]);
  const roomVolumeM3 = useMemo(() => calculateRoomVolume(activeRoom.areaSqMeters, activeRoom.ceilingHeightMeters), [activeRoom.areaSqMeters, activeRoom.ceilingHeightMeters]);
  const requiredCadrM3H = useMemo(() => calculateRequiredCADR(roomVolumeM3, 4), [roomVolumeM3]);
  const effectiveAch = useMemo(() => (activeRoom.purifierCadrM3H <= 0 ? 0.3 : Math.round((activeRoom.purifierCadrM3H / roomVolumeM3) * 10) / 10), [activeRoom.purifierCadrM3H, roomVolumeM3]);
  const purificationTimeMins = useMemo(() => (activeRoom.purifierCadrM3H <= 0 ? 999 : estimatePurificationTime(roomVolumeM3, activeRoom.purifierCadrM3H, 0.8)), [roomVolumeM3, activeRoom.purifierCadrM3H]);
  const cadrDeficit = useMemo(() => Math.max(0, requiredCadrM3H - activeRoom.purifierCadrM3H), [requiredCadrM3H, activeRoom.purifierCadrM3H]);
  const handleArea = useCallback((area: number) => updateRoom(activeRoom.roomId, { areaSqMeters: Math.max(4, area) }), [activeRoom.roomId, updateRoom]);
  const handleCadr = useCallback((cadr: number) => updateRoom(activeRoom.roomId, { purifierCadrM3H: Math.max(0, cadr), hasAirPurifier: cadr > 0 }), [activeRoom.roomId, updateRoom]);

  return { rooms, selectedRoomId, setSelectedRoomId, activeRoom, roomVolumeM3, requiredCadrM3H, effectiveAch, purificationTimeMins, cadrDeficit, handleArea, handleCadr, selectedZone };
}

export const IAQCenter = memo(function IAQCenter() {
  const { rooms, selectedRoomId, setSelectedRoomId, activeRoom, roomVolumeM3, requiredCadrM3H, effectiveAch, purificationTimeMins, cadrDeficit, handleArea, handleCadr, selectedZone } = useRoomDiagnostics();

  return (
    <section aria-label="Indoor Air Quality and Low-Cost Hack Center" className="flex flex-col gap-6 fade-in">
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-xl font-black text-[#153C35] flex items-center gap-2">Room CADR & Indoor Air Quality (IAQ) Calculator</h2>
          <p className="text-xs text-[#73817B] mt-1 max-w-2xl leading-relaxed">Calculate Clean Air Delivery Rate (CADR) requirements, air changes per hour (ACH), and purification duration.</p>
        </div>
        <RoomSelectorTabs rooms={rooms} selectedRoomId={selectedRoomId} onSelect={setSelectedRoomId} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <RoomParameterControls area={activeRoom.areaSqMeters} cadr={activeRoom.purifierCadrM3H} onAreaChange={handleArea} onCadrChange={handleCadr} />
          <DiagnosticMetricsGrid requiredCadr={requiredCadrM3H} roomVolume={roomVolumeM3} ceilingHeight={activeRoom.ceilingHeightMeters} effectiveAch={effectiveAch} purificationTime={purificationTimeMins} />
        </div>
        <CadrDeficitBanner cadrDeficit={cadrDeficit} />
      </div>
      <WindowSchedule currentAqi={selectedZone.aqi} />
      <DIYHackGrid />
    </section>
  );
});
