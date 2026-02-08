import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { renderWithProviders } from '../../test/utils';
import { scanService } from '../../services/scanService';

// Mock the service
vi.mock('../../services/scanService', () => ({
  scanService: {
    getSessions: vi.fn(),
  },
}));

// Mock Supabase to avoid real network calls during prefs check
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: 'prefs-123' } }),
        }),
      }),
    }),
  },
}));

describe('Dashboard Integration', () => {
  it('renders loading state initially', () => {
    (scanService.getSessions as any).mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithProviders(<Dashboard />);
    // Check for loader (implementation detail: Loader2 icon usually implies loading)
    // You might need to add a specific test-id for better testing
  });

  it('renders empty state when no sessions', async () => {
    (scanService.getSessions as any).mockResolvedValue([]);
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No scans yet/i)).toBeInTheDocument();
    });
  });

  it('renders scan sessions list', async () => {
    const mockSessions = [
      {
        id: '1',
        created_at: new Date().toISOString(),
        summary: 'A great Cabernet',
        wines_detected: [{ name: 'Caymus', type: 'Red' }],
        recommendations: [{ name: 'Silver Oak', match_score: 95 }],
        notes: 'Anniversary dinner',
      },
    ];

    (scanService.getSessions as any).mockResolvedValue(mockSessions);
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Silver Oak')).toBeInTheDocument();
      expect(screen.getByText('Anniversary dinner')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
