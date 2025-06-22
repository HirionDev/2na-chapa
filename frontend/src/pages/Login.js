import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 text-white">Usuário</label>
          <input
            {...register('username', { required: true })}
            aria-label="Usuário"
            className="w-full p-2 bg-gray-700 rounded text-white"
            placeholder="Digite seu usuário"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-white">Senha</label>
          <input
            {...register('password', { required: true })}
            type="password"
            aria-label="Senha"
            className="w-full p-2 bg-gray-700 rounded text-white"
            placeholder="Digite sua senha"
          />
        </div>
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}

export default Login;