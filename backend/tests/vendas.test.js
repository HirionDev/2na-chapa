const request = require('supertest');
const app = require('../server');

describe('Vendas Endpoints', () => {
  let token;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    token = loginResponse.body.token;
  });

  it('deve filtrar vendas por período', async () => {
    const response = await request(app)
      .post('/api/vendas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        inicio: '2025-06-01',
        fim: '2025-06-30',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('vendas');
    expect(response.body).toHaveProperty('estatisticas');
  });

  it('deve gerar relatório PDF', async () => {
    const response = await request(app)
      .post('/api/vendas/relatorio/pdf')
      .set('Authorization', `Bearer ${token}`)
      .send({
        inicio: '2025-06-01',
        fim: '2025-06-30',
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
  });
});