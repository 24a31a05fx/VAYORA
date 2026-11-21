// ============================================================
// src/components/Legal/LegalModal.tsx
// Accessible Privacy Policy and Terms & Conditions Modals
// ============================================================

import { useEffect, memo } from 'react';
import { CloseIcon } from '@/components/shared/Icons';

export type LegalDocType = 'privacy' | 'terms' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-xs text-[#202B29] leading-relaxed">
      <p><strong>Effective Date:</strong> November 2026. VAYORA is committed to absolute data privacy and ethical environmental intelligence.</p>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">1. Zero Telemetry Harvesting</h4>
        <p className="mt-1 text-[#73817B]">VAYORA does not collect, log, or sell any personal identifiable information (PII). No GPS coordinates, names, or device fingerprints are transmitted to remote servers.</p>
      </div>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">2. Local-Only Storage</h4>
        <p className="mt-1 text-[#73817B]">Your selected household personas, room volumes, and route preferences are stored exclusively on your client device using isolated local storage with memory fallback.</p>
      </div>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">3. Transparent AI Processing</h4>
        <p className="mt-1 text-[#73817B]">Inference requests send only anonymized environmental parameters (AQI and meteorological factors) to our secure server proxy. No user identity is attached.</p>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-4 text-xs text-[#202B29] leading-relaxed">
      <p><strong>Agreement:</strong> By accessing VAYORA, you agree to these ethical terms of use for civic environmental intelligence.</p>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">1. Informational Health Guidance</h4>
        <p className="mt-1 text-[#73817B]">VAYORA provides advisory guidance derived from EPA sub-indices and ASHRAE ventilation standards. It does not substitute professional medical advice or official evacuation orders.</p>
      </div>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">2. Civic Non-Commercial License</h4>
        <p className="mt-1 text-[#73817B]">All algorithms, CADR calculators, and DIY purifier blueprints are provided openly for community resilience, public educational training, and non-commercial defense.</p>
      </div>
      <div>
        <h4 className="font-bold text-[#153C35] text-sm">3. Security Invariant</h4>
        <p className="mt-1 text-[#73817B]">Users may not probe, bypass rate limiters, or abuse the API gateway. Zero-trust security controls protect platform integrity.</p>
      </div>
    </div>
  );
}

function useEscapeKey(isActive: boolean, onEscape: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onEscape();
    }
    if (isActive) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape]);
}

function LegalModalDialog({ type, onClose }: { type: NonNullable<LegalDocType>; onClose: () => void }) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EAE4] flex items-center justify-between bg-[#F6F7F2]">
          <h3 id="legal-modal-title" className="font-heading font-black text-lg text-[#153C35]">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-lg text-[#73817B] hover:text-[#202B29] hover:bg-[#EBF2EC] focus:outline-none focus:ring-2 focus:ring-[#398F83]">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {isPrivacy ? <PrivacyPolicyContent /> : <TermsContent />}
        </div>
        <div className="px-6 py-3 border-t border-[#E5EAE4] bg-[#F6F7F2] flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-[#153C35] text-white text-xs font-bold rounded-xl hover:bg-[#1E4E45] focus:outline-none focus:ring-2 focus:ring-[#398F83]">
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export const LegalModal = memo(function LegalModal({ type, onClose }: LegalModalProps) {
  useEscapeKey(type !== null, onClose);
  if (!type) return null;
  return <LegalModalDialog type={type} onClose={onClose} />;
});
