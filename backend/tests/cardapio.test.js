const request = require('supertest');
const app = require('../server');

describe('Cardápio API', () => {
  it('should list itens', async () => {
    const res = await request(app).get('/api/cardapio/itens');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});