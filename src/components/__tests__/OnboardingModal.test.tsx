import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingModal from '../OnboardingModal';
import { renderWithProviders } from '../../test/utils';

// Hoist mocks
const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'user_profiles') {
        return {
          update: (payload: any) => ({
            eq: () => Promise.resolve({ data: payload }),
          }),
        };
      }
      if (table === 'user_preferences') {
        return {
          upsert: (payload: any) => {
            mocks.upsert(payload);
            return Promise.resolve({ error: null });
          },
        };
      }
      return {};
    },
  },
}));

describe('OnboardingModal Mapping Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const completeFlow = async () => {
    renderWithProviders(<OnboardingModal onComplete={vi.fn()} />);

    // Start
    fireEvent.click(screen.getByText('Build Profile'));

    // Step 1: Wine Types (Skip selection)
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Regions (Skip selection)
    fireEvent.click(screen.getByText('Next'));
  };

  it('maps "Bold & Full-bodied" to correct spectrums', async () => {
    await completeFlow();

    // Step 3: Flavors - Select "Bold & Full-bodied"
    // Expect body 7-10, tannins 6-10
    fireEvent.click(screen.getByText('Bold & Full-bodied'));
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Avoidances
    fireEvent.click(screen.getByText('Next'));

    // Step 5: Adventurousness
    fireEvent.click(screen.getByText('Next'));

    // Step 6: Budget -> Finish
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
        expect(mocks.upsert).toHaveBeenCalled();
    });

    const payload = mocks.upsert.mock.calls[0][0];
    expect(payload.body_min).toBe(7);
    expect(payload.body_max).toBe(10);
    expect(payload.tannins_min).toBe(6);
    expect(payload.tannins_max).toBe(10);
  });

  it('handles conflicting tags by intersection/narrowing', async () => {
    await completeFlow();

    // Step 3: Flavors 
    // "Light & Crisp": Body 1-4
    // "Oaky": Body 6-10
    // Intersection is empty. Logic should fallback to middle ground (4-7)
    
    fireEvent.click(screen.getByText('Light & Crisp'));
    fireEvent.click(screen.getByText('Oaky'));
    fireEvent.click(screen.getByText('Next'));

    // Finish remaining steps
    fireEvent.click(screen.getByText('Next')); // Avoidances
    fireEvent.click(screen.getByText('Next')); // Adventurousness
    fireEvent.click(screen.getByText('Finish')); // Budget

    await waitFor(() => {
        expect(mocks.upsert).toHaveBeenCalled();
    });

    const payload = mocks.upsert.mock.calls[0][0];
    
    // Check fallback logic for Body
    // Light & Crisp (1-4) vs Oaky (6-10) -> Invalid -> Resets to 4-7
    expect(payload.body_min).toBe(4);
    expect(payload.body_max).toBe(7);
  });

  it('maps multiple non-conflicting tags correctly', async () => {
    await completeFlow();

    // "Dry": Sweetness 1-2
    // "Tannic": Tannins 7-10
    fireEvent.click(screen.getByText('Dry'));
    fireEvent.click(screen.getByText('Tannic'));
    fireEvent.click(screen.getByText('Next'));

    // Finish
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
        expect(mocks.upsert).toHaveBeenCalled();
    });

    const payload = mocks.upsert.mock.calls[0][0];
    expect(payload.sweetness_max).toBe(2);
    expect(payload.tannins_min).toBe(7);
  });
});
