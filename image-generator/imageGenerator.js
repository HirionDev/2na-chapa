const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { formatText } = require('./utils/imageUtils');

// Configurações
const BACKEND_URL = 'http://localhost:3001/api';
const OUTPUT_DIR = path.join(__dirname, 'output');
const FONT_PATH = path.join(__dirname, 'assets/fonts/Roboto-Regular.ttf');
const LOGO_PATH = path.join(__dirname, 'assets/logo.png');

// Registrar fonte
registerFont(FONT_PATH, { family: 'Roboto' });

const generateCardapioImage = async () => {
  try {
    // Obter dados do cardápio
    const [itensResponse, combosResponse] = await Promise.all([
      axios.get(`${BACKEND_URL}/cardapio/itens`),
      axios.get(`${BACKEND_URL}/cardapio/combos`),
    ]);

    const itens = itensResponse.data;
    const combos = combosResponse.data;

    // Configurações do canvas
    const width = 800;
    const lineHeight = 30;
    const padding = 20;
    const logoHeight = 100;
    const titleHeight = 50;
    const contentHeight = (itens.length + combos.length + 4) * lineHeight + padding * 4; // Estimativa
    const height = logoHeight + titleHeight + contentHeight + padding * 2;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#000000'; // Preto
    ctx.fillRect(0, 0, width, height);

    // Carregar logotipo
    const logo = await loadImage(LOGO_PATH);
    const logoAspect = logo.width / logo.height;
    const logoWidth = logoHeight * logoAspect;
    ctx.drawImage(logo, (width - logoWidth) / 2, padding, logoWidth, logoHeight);

    // Título
    ctx.fillStyle = '#FBBF24'; // Amarelo
    ctx.font = 'bold 30px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('Cardápio Na Chapa', width / 2, padding + logoHeight + 30);

    // Itens
    let y = padding + logoHeight + titleHeight + padding;
    ctx.fillStyle = '#FFFFFF'; // Branco
    ctx.font = 'bold 20px Roboto';
    ctx.textAlign = 'left';
    ctx.fillText('Itens', padding, y);
    y += lineHeight;

    ctx.font = '16px Roboto';
    itens.forEach((item) => {
      const text = formatText(`${item.nome} - R$${item.preco.toFixed(2)} (${item.categoria.nome})`, width - padding * 2, ctx);
      text.forEach((line) => {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      });
    });

    // Combos
    y += padding;
    ctx.font = 'bold 20px Roboto';
    ctx.fillText('Combos', padding, y);
    y += lineHeight;

    ctx.font = '16px Roboto';
    combos.forEach((combo) => {
      const text = formatText(`${combo.nome} - R$${combo.preco.toFixed(2)} (${combo.categoria.nome})`, width - padding * 2, ctx);
      text.forEach((line) => {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      });
    });

    // Salvar imagem
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
    const outputPath = path.join(OUTPUT_DIR, `cardapio_${Date.now()}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('Erro ao gerar imagem do cardápio:', error);
    throw error;
  }
};

module.exports = { generateCardapioImage };