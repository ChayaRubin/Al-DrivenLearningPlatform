import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    setUser: vi.fn(),
    setToken: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { authApi } from '../services/api';

beforeEach(() => {
  vi.clearAllMocks();
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  it('renders login form with name and phone inputs and submit button', () => {
    renderLogin();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation error when name is empty after submit', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText(/your phone/i), '5551234567');
    fireEvent.submit(screen.getByRole('button', { name: /log in/i }).closest('form')!);
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows validation error when phone is not 10 digits', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText(/name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/phone/i), '123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByText(/10 digits/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('calls login and navigates on success', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            name: 'Jane',
            phone: '5551234567',
            role: 'USER',
            createdAt: new Date().toISOString(),
            email: '',
          },
          token: 'fake-token',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
    renderLogin();
    await user.type(screen.getByPlaceholderText(/name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(authApi.login).toHaveBeenCalledWith('Jane', '5551234567');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows error message when login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: { error: 'Invalid name or phone' } },
    });
    renderLogin();
    await user.type(screen.getByPlaceholderText(/name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    await screen.findByText(/invalid name or phone/i);
    expect(screen.getByText(/invalid name or phone/i)).toBeInTheDocument();
  });

  it('has link to register', () => {
    renderLogin();
    const registerLinks = screen.getAllByRole('link').filter((el) => el.getAttribute('href') === '/register');
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0]).toBeInTheDocument();
  });
});
