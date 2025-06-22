const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (username, password) => {
  const usuario = await prisma.usuario.findUnique({ where: { username } });
  if (!usuario) {
    throw new Error('Credenciais inválidas');
  }

  const isValid = await bcrypt.compare(password, usuario.password);
  if (!isValid) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Expira em 1 hora
  );

  return { token, usuario: { id: usuario.id, username: usuario.username, role: usuario.role } };
};

module.exports = { login };