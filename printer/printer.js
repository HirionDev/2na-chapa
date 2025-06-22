let Printer, Network, USB;
let axios;
try {
  ({ Printer, Network, USB } = require('escpos'));
} catch {
  Printer = class { constructor(){} cut(){} close(){} };
  Network = class {}; USB = class {};
}
try {
  axios = require('axios');
} catch {
  axios = { get: async () => ({ data: { valor: '' } }) };
}
const { printPedido } = require('./escposTemplates');

const BACKEND_URL = 'http://localhost:3001/api';

const getPrinter = async () => {
  try {
    // Obter configuração da impressora
    const configResponse = await axios.get(`${BACKEND_URL}/configuracoes/impressora_endereco`);
    const printerAddress = configResponse.data.valor;

    if (!printerAddress) {
      throw new Error('Endereço da impressora não configurado');
    }

    let device;
    if (printerAddress.includes('.')) {
      // Conexão via rede (IP)
      const [ip, port = 9100] = printerAddress.split(':');
      device = new Network(ip, parseInt(port));
    } else {
      // Conexão via USB (assume que printerAddress é o Vendor ID ou vazio para auto-detecção)
      device = new USB();
    }

    return new Printer(device);
  } catch (error) {
    console.error('Erro ao configurar impressora:', error.message);
    throw error;
  }
};

const printOrder = async (pedidoId) => {
  let printer;
  try {
    // Obter dados do pedido
    const response = await axios.get(`${BACKEND_URL}/integracoes/impressao/${pedidoId}`);
    const pedido = response.data;

    // Configurar impressora
    printer = await getPrinter();
    await new Promise((resolve, reject) => {
      printer.device.open((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Imprimir
    await printPedido(printer, pedido);

    // Finalizar
    printer.cut();
    printer.close();
  } catch (error) {
    console.error('Erro ao imprimir pedido:', error.message);
    if (printer) printer.close();
    throw error;
  }
};

module.exports = { printOrder };