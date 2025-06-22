const request = require('supertest');
const app = require('../server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Pedidos Endpoints', () => {
  let token;
  let itemId;

  beforeAll(async () => {
    // Obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    token = loginResponse.body.token;

    // Obter item
    const item = await prisma.item.findFirst({ where: { nome: 'Hambúrguer' } });
    itemId = item.id;
  });

  it('deve criar um pedido', async () => {
    const response = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteNome: 'João',
        telefone: '11987654321',
        itens: [{ itemId, quantidade: 2 }],
        tipo: 'balcao',
        observacoes: 'Sem cebola',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.clienteNome).toBe('João');
    expect(response.body.total).toBe(41.80); // 2 x 20.90
  });

  it('deve listar pedidos', async () => {
    const response = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});