import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Preferences from '../Preferences';
import { renderWithProviders } from '../../test/utils';

// Hoist mocks to ensure they are available in vi.mock factory
const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'user_preferences') {
        return {
          select: () => ({
             // Return a chain that eventually calls mocks.select
            eq: () => ({
              maybeSingle: mocks.select,
            }),
          }),
          update: (payload: any) => {
            mocks.update(payload);
            return {
              eq: () => Promise.resolve({ data: payload }),
            };
          },
          insert: (payload: any) => {
             mocks.insert(payload);
             return Promise.resolve({ data: payload });
          },
        };
      }
      return {
        select: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }),
      };
    },
  },
}));

describe('Preferences Refactor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response: existing preferences
    mocks.select.mockResolvedValue({
      data: {
        id: '123',
        user_id: 'test-user',
        varietal_preferences: { 'Merlot': 'love' },
        body_min: 3,
        body_max: 8,
      },
    });
  });

  it('renders Refactored Preferences page', async () => {
    renderWithProviders(<Preferences />);

    await waitFor(() => {
      // Check for key sections
      expect(screen.getByText('Flavor Profile')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Wine Types')).toBeInTheDocument();
    });
  });

  it('loads existing preferences correctly', async () => {
    renderWithProviders(<Preferences />);
    
    // Open Red category to see Merlot
    await waitFor(() => screen.getByText('Wine Types'));
    const redBtn = screen.getByText('Red');
    fireEvent.click(redBtn);
    
    await waitFor(() => {
        expect(screen.getByText('Merlot')).toBeInTheDocument();
    });
  });

  it('updates varietal preference on click', async () => {
    // Start with empty preferences
    mocks.select.mockResolvedValue({ data: { user_id: 'test-user', varietal_preferences: {} } });
    renderWithProviders(<Preferences />);

    await waitFor(() => screen.getByText('Wine Types'));

    // Open Red
    fireEvent.click(screen.getByText('Red'));
    await waitFor(() => screen.getByText('Cabernet Sauvignon'));

    const cabSav = screen.getByText('Cabernet Sauvignon').closest('button');
    expect(cabSav).toBeDefined();

    // Click 1: Neutral -> Love
    fireEvent.click(cabSav!);
    // Click 2: Love -> Avoid
    fireEvent.click(cabSav!);
    
    // Save
    const saveBtn = screen.getByText('Save preferences');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalled();
    });
    
    const callArg = mocks.update.mock.calls[0][0];
    // After 2 clicks (Neutral -> Love -> Avoid), it should be 'avoid'
    expect(callArg.varietal_preferences['Cabernet Sauvignon']).toBe('avoid'); // 'avoid' matches logic: Neutral -> Love -> Avoid
  });
  
  it('updates slider values and saves', async () => {
     renderWithProviders(<Preferences />);
     await waitFor(() => screen.getByText('Save preferences'));
     
     // Simulate save to check default values from load are sent back if untouched
     fireEvent.click(screen.getByText('Save preferences'));
     
     await waitFor(() => {
         expect(mocks.update).toHaveBeenCalled();
     });
     
     const callArg = mocks.update.mock.calls[0][0];
     // Should have the loaded values (3 and 8 from beforeEach)
     expect(callArg.body_min).toBe(3);
     expect(callArg.body_max).toBe(8);
  });
});
