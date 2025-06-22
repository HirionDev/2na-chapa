const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario).toHaveProperty('username', 'admin');
  });

  it('deve falhar com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
  });
});