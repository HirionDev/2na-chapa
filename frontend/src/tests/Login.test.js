import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import api from '../services/api';

jest.mock('../services/api');

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form and logs in successfully', async () => {
    api.post.mockResolvedValue({
      data: { token: 'mock-token', usuario: { username: 'admin', role: 'admin' } },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/usuário/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'admin123' });
    });
  });

  it('shows error on invalid credentials', async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { error: 'Credenciais inválidas' } } });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/usuário/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});