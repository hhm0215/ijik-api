const cardsRepository = require('../repositories/cards.repository');
const AppError = require('../utils/AppError');

async function findAll() {
  return cardsRepository.findAll();
}

async function findById(id) {
  const card = await cardsRepository.findById(id);
  if (!card) throw new AppError(404, 'Card not found');
  return card;
}

async function create({ title, content, tags }) {
  return cardsRepository.create({ title, content, tags });
}

async function update(id, { title, content, tags }) {
  const affectedRows = await cardsRepository.update(id, { title, content, tags });
  if (affectedRows === 0) throw new AppError(404, 'Card not found');
  return cardsRepository.findById(id);
}

async function softDelete(id) {
  const affectedRows = await cardsRepository.softDelete(id);
  if (affectedRows === 0) throw new AppError(404, 'Card not found');
}

module.exports = { findAll, findById, create, update, softDelete };
