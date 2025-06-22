const request = require('supertest');
const app = require('../server');

describe('Clientes API', () => {
  it('should create a cliente', async () => {
    const token = 'SEU_TOKEN_JWT'; // Substitua pelo token gerado no login
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Maria',
        telefone: '11912345678',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});