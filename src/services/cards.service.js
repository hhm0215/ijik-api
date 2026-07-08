const cardsRepository = require('../repositories/cards.repository');

async function findAll() {
  return cardsRepository.findAll();
}

async function findById(id) {
  const card = await cardsRepository.findById(id);
  if (!card) throw new Error('NOT_FOUND');
  return card;
}

async function create({ title, content, tags }) {
  return cardsRepository.create({ title, content, tags });
}

async function update(id, { title, content, tags }) {
  const affectedRows = await cardsRepository.update(id, { title, content, tags });
  if (affectedRows === 0) throw new Error('NOT_FOUND');
  return cardsRepository.findById(id);
}

async function softDelete(id) {
  const affectedRows = await cardsRepository.softDelete(id);
  if (affectedRows === 0) throw new Error('NOT_FOUND');
}

module.exports = { findAll, findById, create, update, softDelete };
