import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Scanner from '../Scanner';
import { renderWithProviders } from '../../test/utils';
import { scanService } from '../../services/scanService';

// Mock services
vi.mock('../../services/scanService', () => ({
  scanService: {
    analyzeWine: vi.fn(),
    createSession: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: {} }), // Mock empty prefs
          order: () => ({ limit: () => Promise.resolve({ data: [] }) }), // Mock empty memories
        }),
      }),
    }),
  },
}));

describe('Scanner Integration', () => {
  it('renders initial state correctly', () => {
    renderWithProviders(<Scanner />);
    expect(screen.getByText(/Wine Scanner/i)).toBeInTheDocument();
    expect(screen.getByText(/Snap a wine list/i)).toBeInTheDocument();
  });

  // Note: Testing the full flow requires mocking ImageUpload which uses browser APIs (FileReader)
  // For this integration test, we'll verify the form elements are present
  
  it('displays budget inputs', () => {
    renderWithProviders(<Scanner />);
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
  });

  it('displays eating input', () => {
    renderWithProviders(<Scanner />);
    expect(screen.getByText('What are you eating?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/grilled steak/i)).toBeInTheDocument();
  });
  
  it('displays context toggle', () => {
    renderWithProviders(<Scanner />);
    expect(screen.getByText('Store')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
  });
});
