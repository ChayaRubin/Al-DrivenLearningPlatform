import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Admin } from './Admin';

vi.mock('../services/api', () => ({
  adminApi: {
    users: vi.fn(),
    prompts: vi.fn(),
    categories: vi.fn(),
  },
}));

import { adminApi } from '../services/api';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(adminApi.users).mockResolvedValue({
    data: { data: [], total: 0, page: 1, limit: 10 },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });
  vi.mocked(adminApi.prompts).mockResolvedValue({
    data: { data: [], total: 0, page: 1, limit: 10 },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });
  vi.mocked(adminApi.categories).mockResolvedValue({
    data: { data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });
});

function renderAdmin() {
  return render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );
}

describe('Admin', () => {
  it('renders nav tabs for Users, Prompts, Categories', () => {
    renderAdmin();
    expect(screen.getByRole('button', { name: /^users$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^prompts$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^categories$/i })).toBeInTheDocument();
  });

  it('shows Users tab content and calls adminApi.users', () => {
    renderAdmin();
    expect(adminApi.users).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('switches to Prompts tab and calls adminApi.prompts', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(screen.getByRole('button', { name: /^prompts$/i }));
    expect(adminApi.prompts).toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/prompt, category, user/i)).toBeInTheDocument();
  });

  it('switches to Categories tab and calls adminApi.categories', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(screen.getByRole('button', { name: /^categories$/i }));
    expect(adminApi.categories).toHaveBeenCalled();
    expect(await screen.findByPlaceholderText(/e\.g\. mathematics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^add category$/i })).toBeInTheDocument();
  });

  it('displays users table headers', () => {
    renderAdmin();
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /phone/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
  });

  it('displays user rows when adminApi.users returns data', async () => {
    vi.mocked(adminApi.users).mockResolvedValue({
      data: {
        data: [
          {
            id: 'u1',
            name: 'Alice',
            phone: '5551111111',
            role: 'USER',
            createdAt: new Date().toISOString(),
            email: '',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
    renderAdmin();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('5551111111')).toBeInTheDocument();
  });
});
