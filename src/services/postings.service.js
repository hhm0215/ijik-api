const postingsRepository = require('../repositories/postings.repository');

async function findAll() {
  return postingsRepository.findAll();
}

async function findById(id) {
  const posting = await postingsRepository.findById(id);
  if (!posting) throw new Error('NOT_FOUND');
  return posting;
}

async function create(data) {
  return postingsRepository.create(data);
}

async function update(id, data) {
  const affected = await postingsRepository.update(id, data);
  if (affected === 0) throw new Error('NOT_FOUND');
  return postingsRepository.findById(id);
}

async function remove(id) {
  const affected = await postingsRepository.remove(id);
  if (affected === 0) throw new Error('NOT_FOUND');
}

module.exports = { findAll, findById, create, update, remove };
