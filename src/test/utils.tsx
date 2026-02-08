import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
// @ts-ignore
import { AuthContext } from '../contexts/AuthContext';
import { ReactElement } from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export function renderWithProviders(ui: ReactElement, { user = { id: 'test-user' }, ...renderOptions }: ExtendedRenderOptions = {}) {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, session: { access_token: 'fake-token' }, profile: null, loading: false } as any}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
    renderOptions
  );
}
