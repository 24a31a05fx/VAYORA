// ============================================================
// src/components/IAQ/IAQCenter.tsx
// Indoor Air Quality (IAQ), Room CADR Calculator, and Low-Cost DIY Hack Center
// Per PROBLEM_ALIGNMENT.md §1.4 & EFFICIENCY.md §2
// ============================================================

import { memo, useState, useMemo, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  calculateRoomVolume,
  calculateRequiredCADR,
  estimatePurificationTime,
} from '@/lib/aqiCompute';
import { WindowSchedule } from './WindowSchedule';
import { DIYHackGrid } from './DIYHackGrid';

export const IAQCenter = memo(function IAQCenter() {
  const { rooms, updateRoom, selectedZone } = useAppContext();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0].roomId);

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.roomId === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const roomVolumeM3 = useMemo(() => {
    return calculateRoomVolume(activeRoom.areaSqMeters, activeRoom.ceilingHeightMeters);
  }, [activeRoom.areaSqMeters, activeRoom.ceilingHeightMeters]);

  const requiredCadrM3H = useMemo(() => {
    return calculateRequiredCADR(roomVolumeM3, 4);
  }, [roomVolumeM3]);

  const effectiveAch = useMemo(() => {
    if (activeRoom.purifierCadrM3H <= 0) return 0.3;
    return Math.round((activeRoom.purifierCadrM3H / roomVolumeM3) * 10) / 10;
  }, [activeRoom.purifierCadrM3H, roomVolumeM3]);

  const purificationTimeMins = useMemo(() => {
    if (activeRoom.purifierCadrM3H <= 0) return 999;
    return estimatePurificationTime(roomVolumeM3, activeRoom.purifierCadrM3H, 0.8);
  }, [roomVolumeM3, activeRoom.purifierCadrM3H]);

  const cadrDeficit = useMemo(() => {
    return Math.max(0, requiredCadrM3H - activeRoom.purifierCadrM3H);
  }, [requiredCadrM3H, activeRoom.purifierCadrM3H]);

  const handleAreaChange = useCallback(
    (area: number) => {
      updateRoom(activeRoom.roomId, { areaSqMeters: Math.max(4, area) });
    },
    [activeRoom.roomId, updateRoom]
  );

  const handleCadrChange = useCallback(
    (cadr: number) => {
      updateRoom(activeRoom.roomId, {
        purifierCadrM3H: Math.max(0, cadr),
        hasAirPurifier: cadr > 0,
      });
    },
    [activeRoom.roomId, updateRoom]
  );

  return (
    <section aria-label="Indoor Air Quality and Low-Cost Hack Center" className="flex flex-col gap-6 fade-in">
      {/* CADR Calculator & Room Profile */}
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-xl font-black text-[#153C35] flex items-center gap-2">
            <span aria-hidden="true">💨</span> Room CADR & Indoor Air Quality (IAQ) Calculator
          </h2>
          <p className="text-xs text-[#73817B] mt-1 max-w-2xl leading-relaxed">
            Calculate Clean Air Delivery Rate (CADR) requirements, air changes per hour (ACH), and purification duration.
          </p>
        </div>

        {/* Room Tab Selection */}
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => {
            const isSelected = room.roomId === selectedRoomId;
            return (
              <button
                key={room.roomId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedRoomId(room.roomId)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${
                  isSelected
                    ? 'bg-[#153C35] text-white shadow-sm shadow-[#153C35]/20 font-bold'
                    : 'bg-[#F6F7F2] text-[#202B29] hover:bg-[#EBF2EC] hover:text-[#153C35] border border-[#E5EAE4]'
                }`}
              >
                {room.roomName}
              </button>
            );
          })}
        </div>

        {/* Room Parameters & Live Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#202B29]">
                <label htmlFor="room-area-range">Floor Area:</label>
                <span className="text-[#153C35] font-extrabold tabular-nums">{activeRoom.areaSqMeters} m²</span>
              </div>
              <input
                id="room-area-range"
                type="range"
                min="6"
                max="80"
                step="1"
                value={activeRoom.areaSqMeters}
                onChange={(e) => handleAreaChange(parseFloat(e.target.value))}
                className="w-full mt-2 accent-[#153C35] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#202B29]">
                <label htmlFor="room-cadr-range">Purifier Clean Air Delivery Rate (CADR):</label>
                <span className="text-[#153C35] font-extrabold tabular-nums">{activeRoom.purifierCadrM3H} m³/h</span>
              </div>
              <input
                id="room-cadr-range"
                type="range"
                min="0"
                max="600"
                step="20"
                value={activeRoom.purifierCadrM3H}
                onChange={(e) => handleCadrChange(parseFloat(e.target.value))}
                className="w-full mt-2 accent-[#153C35] cursor-pointer"
              />
            </div>
          </div>

          {/* Diagnostic Metrics Display */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                Target CADR (4 ACH)
              </span>
              <div className="font-heading text-2xl font-black text-[#153C35] mt-2 tabular-nums">
                {requiredCadrM3H} <span className="text-xs font-normal text-[#73817B]">m³/h</span>
              </div>
              <p className="text-[11px] text-[#73817B] mt-2">
                Volume: {roomVolumeM3} m³ ({activeRoom.ceilingHeightMeters}m ceiling).
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                Effective Air Changes
              </span>
              <div className="font-heading text-2xl font-black text-[#398F83] mt-2 tabular-nums">
                {effectiveAch} <span className="text-xs font-normal text-[#73817B]">ACH</span>
              </div>
              <p className="text-[11px] text-[#73817B] mt-2">
                {effectiveAch >= 4
                  ? '✅ Meets hospital-grade clean room target.'
                  : '⚠️ Sub-optimal air recycling rate.'}
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                80% Clean Time
              </span>
              <div className="font-heading text-2xl font-black text-[#153C35] mt-2 tabular-nums">
                {purificationTimeMins > 120 ? 'No Purifier' : `${purificationTimeMins} mins`}
              </div>
              <p className="text-[11px] text-[#73817B] mt-2">
                Time required to filter out airborne ambient particles.
              </p>
            </div>
          </div>
        </div>

        {cadrDeficit > 0 && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#92400E]">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">🛠️</span>
              <div>
                <strong className="font-bold">CADR Deficit Detected:</strong> Your current setup is short by{' '}
                <strong className="text-[#78350F] tabular-nums font-black">{cadrDeficit} m³/h</strong>.
                Build a low-cost DIY Corsi-Rosenthal Box to achieve full 4 ACH protection!
              </div>
            </div>
          </div>
        )}
      </div>

      <WindowSchedule currentAqi={selectedZone.aqi} />
      <DIYHackGrid />
    </section>
  );
});
