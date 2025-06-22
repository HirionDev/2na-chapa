const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const WebSocket = require('ws');
const pedidosRoutes = require('./routes/pedidosRoutes');
const cardapioRoutes = require('./routes/cardapioRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const configuracoesRoutes = require('./routes/configuracoesRoutes');
const authRoutes = require('./routes/authRoutes');
const vendasRoutes = require('./routes/vendasRoutes');
const integracoesRoutes = require('./routes/integracoesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { getQRCode, getConnectionStatus } = require('../ai/whatsapp');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/cardapio', cardapioRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/integracoes', integracoesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Endpoints WhatsApp
app.get('/api/whatsapp/qr', (req, res) => {
  const qr = getQRCode();
  if (!qr) return res.status(404).json({ error: 'QR Code não disponível' });
  res.json({ qrCode: qr });
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json({ isConnected: getConnectionStatus() });
});

// WebSocket para notificações
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.on('close', () => console.log('Cliente WebSocket desconectado'));
});

// Notificar clientes WebSocket
const notifyClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Job para limpar pedidos prontos
setInterval(async () => {
  try {
    const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);
    await prisma.pedido.deleteMany({
      where: {
        status: 'pronto',
        atualizadoEm: { lte: quinzeMinutosAtras },
      },
    });
    console.log('Pedidos prontos antigos limpos');
  } catch (error) {
    console.error('Erro ao limpar pedidos:', error);
  }
}, 5 * 60 * 1000);

// Middleware de erro
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { notifyClients };