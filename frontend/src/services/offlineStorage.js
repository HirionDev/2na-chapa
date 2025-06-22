import Dexie from 'dexie';

const db = new Dexie('NaChapaDB');
db.version(1).stores({
  pedidos: '++localId, id, clienteNome, telefone, total, tipo, status, observacoes, itens, combos, criadoEm',
  itens: 'id, nome, preco, categoriaId, ativo',
  combos: 'id, nome, preco, categoriaId, ativo, itens',
  clientes: 'id, nome, telefone',
  categorias: 'id, nome',
});

const savePedidoOffline = async (pedido) => {
  const localId = await db.pedidos.add({
    ...pedido,
    localId: Date.now(),
    criadoEm: new Date().toISOString(),
    status: 'pendente',
  });
  return localId;
};

const getPedidosPendentes = async () => {
  return db.pedidos.where('status').equals('pendente').toArray();
};

const updatePedidoStatus = async (localId, status, serverId) => {
  await db.pedidos.update(localId, { status, id: serverId });
};

const saveCardapioOffline = async (itens, combos, categorias) => {
  await db.transaction('rw', db.itens, db.combos, db.categorias, async () => {
    await db.itens.clear();
    await db.combos.clear();
    await db.categorias.clear();
    await db.itens.bulkAdd(itens);
    await db.combos.bulkAdd(combos);
    await db.categorias.bulkAdd(categorias);
  });
};

const getCardapioOffline = async () => {
  const [itens, combos, categorias] = await Promise.all([
    db.itens.toArray(),
    db.combos.toArray(),
    db.categorias.toArray(),
  ]);
  return { itens, combos, categorias };
};

const saveClienteOffline = async (cliente) => {
  await db.clientes.put(cliente);
};

const getClientesOffline = async () => {
  return db.clientes.toArray();
};

export {
  savePedidoOffline,
  getPedidosPendentes,
  updatePedidoStatus,
  saveCardapioOffline,
  getCardapioOffline,
  saveClienteOffline,
  getClientesOffline,
};