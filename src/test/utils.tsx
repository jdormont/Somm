import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';
import { ReactElement } from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  user?: AuthContextType['user'];
}

const noop = async () => {};
const noopWithError = async () => ({ error: null as string | null });

const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  isAdmin: false,
  isApproved: true,
  signUp: noopWithError,
  signIn: noopWithError,
  signInWithGoogle: noopWithError,
  signOut: noop,
  refreshProfile: noop,
};

export function renderWithProviders(ui: ReactElement, { user = { id: 'test-user' } as AuthContextType['user'], ...renderOptions }: ExtendedRenderOptions = {}) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ ...defaultContextValue, user }}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
    renderOptions
  );
}
