// ============================================================
// src/test/workflowJourney.test.tsx
// End-to-end UI workflow verification for Challenge 06:
// Household context input -> Schedule generation -> Fallback/AI plan -> Interactive checklist
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContextProvider } from '@/context/AppContext';
import { DailyRoutineOptimizer } from '@/components/Routine/DailyRoutineOptimizer';

describe('End-to-End Family Air Resilience Workflow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('collects household inputs, handles API fallback cleanly, and tracks interactive checklist', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline dev environment'));

    render(
      <AppContextProvider>
        <DailyRoutineOptimizer />
      </AppContextProvider>
    );

    // Step 1: Customize neighborhood, sensitivity, commute habit & purifier setup
    const zoneSelect = screen.getByLabelText(/Neighborhood \/ Urban Sector/i) as HTMLSelectElement;
    fireEvent.change(zoneSelect, { target: { value: 'Z-INDUSTRIAL' } });
    expect(zoneSelect.value).toBe('Z-INDUSTRIAL');

    const sensitivityInput = screen.getByLabelText(/Air Sensitivities/i) as HTMLInputElement;
    fireEvent.change(sensitivityInput, { target: { value: 'Pollen & winter bronchitis' } });
    expect(sensitivityInput.value).toBe('Pollen & winter bronchitis');

    const commuteSelect = screen.getByLabelText(/Daily Commute Habit/i) as HTMLSelectElement;
    fireEvent.change(commuteSelect, { target: { value: 'walk-bike' } });
    expect(commuteSelect.value).toBe('walk-bike');

    const purifierSelect = screen.getByLabelText(/Current Indoor Air Setup/i) as HTMLSelectElement;
    fireEvent.change(purifierSelect, { target: { value: 'none' } });
    expect(purifierSelect.value).toBe('none');

    // Step 2-3: Trigger personalized action plan generation
    const genBtn = screen.getByRole('button', { name: /Generate Smart Schedule/i });
    fireEvent.click(genBtn);

    // Step 4: Verify unified results, error/fallback disclosure, A/B/C/D impact cards & interactive checklist
    expect(await screen.findByText(/Priority Family Action Plan & Impact Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline \/ Demo Fallback/i)).toBeInTheDocument();
    expect(screen.getByText(/Pollen & winter bronchitis/i)).toBeInTheDocument();
    expect(screen.getByText(/Sustainable Commute Suggestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Data & Model Transparency/i)).toBeInTheDocument();

    // Check interactive Indoor Air Improvement Checklist toggles completion count
    expect(screen.getByText(/0 \/ 4 done/i)).toBeInTheDocument();
    const firstCheck = screen.getByLabelText(/Keep windows closed/i);
    fireEvent.click(firstCheck);
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 4 done/i)).toBeInTheDocument();
    });
  });
});
