const postingsRepository = require('../repositories/postings.repository');
const AppError = require('../utils/AppError');

async function findAll() {
  return postingsRepository.findAll();
}

async function findById(id) {
  const posting = await postingsRepository.findById(id);
  if (!posting) throw new AppError(404, 'Posting not found');
  return posting;
}

async function create(data) {
  return postingsRepository.create(data);
}

async function update(id, data) {
  const affected = await postingsRepository.update(id, data);
  if (affected === 0) throw new AppError(404, 'Posting not found');
  return postingsRepository.findById(id);
}

async function remove(id) {
  const affected = await postingsRepository.remove(id);
  if (affected === 0) throw new AppError(404, 'Posting not found');
}

module.exports = { findAll, findById, create, update, remove };
