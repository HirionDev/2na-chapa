let Client, LocalAuth, MessageMedia;
let libraryAvailable = true;
try {
  ({ Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'));
} catch (err) {
  libraryAvailable = false;
  console.warn('whatsapp-web.js not found, WhatsApp features disabled');
}
let qrcode;
try {
  qrcode = require('qrcode');
} catch {
  qrcode = { toDataURL: (code, cb) => cb(null, null) };
}
const { processMessage } = require('./iaEngine');
const { getConversationState, setConversationState } = require('./conversationState');
const fs = require('fs').promises;

let client = null;
let qrCodeData = null;
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

const initializeWhatsApp = () => {
  if (!libraryAvailable) return;
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox'] },
  });

  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error('Erro ao gerar QR Code:', err);
        return;
      }
      qrCodeData = url;
      console.log('QR Code gerado');
      retryCount = 0;
    });
  });

  client.on('ready', () => {
    isConnected = true;
    qrCodeData = null;
    console.log('WhatsApp conectado');
    retryCount = 0;
  });

  client.on('disconnected', (reason) => {
    isConnected = false;
    console.log('WhatsApp desconectado:', reason);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Tentativa de reconexão ${retryCount}/${MAX_RETRIES}`);
      setTimeout(() => initializeWhatsApp(), 5000);
    } else {
      console.error('Máximo de tentativas de reconexão atingido');
    }
  });

  client.on('message', async (message) => {
    try {
      const state = getConversationState(message.from);
      const response = await processMessage(message.body, message.from, state);
      if (response) {
        await message.reply(response.text);
        setConversationState(message.from, response.state);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      await message.reply('Desculpe, houve um erro. Tente novamente ou digite "oi" para começar.');
    }
  });

  client.initialize().catch((error) => {
    console.error('Erro ao inicializar WhatsApp:', error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Tentativa de reconexão ${retryCount}/${MAX_RETRIES}`);
      setTimeout(() => initializeWhatsApp(), 5000);
    }
  });
};

const getQRCode = () => (libraryAvailable ? qrCodeData : null);
const getConnectionStatus = () => (libraryAvailable ? isConnected : false);

const sendMessage = async (to, message, options = {}) => {
  if (!libraryAvailable) {
    console.log(`Mock sendMessage to ${to}: ${message}`);
    return;
  }
  if (!isConnected || !client) {
    throw new Error('WhatsApp não conectado');
  }
  const formattedNumber = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
  if (options.media) {
    const media = await MessageMedia.fromFilePath(options.media);
    await client.sendMessage(formattedNumber, media, { caption: message });
  } else {
    await client.sendMessage(formattedNumber, message);
  }
};

if (libraryAvailable) {
  initializeWhatsApp();
}

module.exports = { getQRCode, getConnectionStatus, sendMessage };