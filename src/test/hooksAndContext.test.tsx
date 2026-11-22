// ============================================================
// src/test/hooksAndContext.test.tsx
// Verification of unified AppContext adapter and useDebounce hook
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContextProvider } from '@/context/AppContext';
import { useAppContext } from '@/context/useAppContext';
import { useDebouncedCallback } from '@/hooks/useDebounce';

function TestAppContextConsumer() {
  const { activeTab, selectedZone, rooms } = useAppContext();
  return <div>{`Tab:${activeTab}|Zone:${selectedZone.zoneId}|Rooms:${rooms.length}`}</div>;
}

function TestDebounceConsumer({ onCall }: { onCall: (val: string) => void }) {
  const debounced = useDebouncedCallback(onCall, 50);
  return (
    <button type="button" onClick={() => debounced('debounced-val')}>
      Trigger Debounce
    </button>
  );
}

describe('useAppContext Compatibility Hook', () => {
  it('aggregates focused context state into unified contract', () => {
    render(
      <AppContextProvider>
        <TestAppContextConsumer />
      </AppContextProvider>
    );

    expect(screen.getByText(/Tab:dashboard\|Zone:Z-CENTRAL\|Rooms:4/)).toBeInTheDocument();
  });
});

describe('useDebouncedCallback Hook', () => {
  it('delays callback invocation until specified delay elapsed', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<TestDebounceConsumer onCall={fn} />);

    fireEvent.click(screen.getByRole('button', { name: /Trigger Debounce/i }));
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60);
    expect(fn).toHaveBeenCalledWith('debounced-val');
    vi.useRealTimers();
  });
});
