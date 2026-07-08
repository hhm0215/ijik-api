const cardsService = require('../services/cards.service');

async function getCards(req, res, next) {
  try {
    const cards = await cardsService.findAll();
    res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
}

async function getCard(req, res, next) {
  try {
    const card = await cardsService.findById(req.params.id);
    res.json({ success: true, data: card });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Card not found' });
    next(err);
  }
}

async function createCard(req, res, next) {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title and content are required' });
    }
    const card = await cardsService.create({ title, content, tags });
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
}

async function updateCard(req, res, next) {
  try {
    const { title, content, tags } = req.body;
    const card = await cardsService.update(req.params.id, { title, content, tags });
    res.json({ success: true, data: card });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Card not found' });
    next(err);
  }
}

async function deleteCard(req, res, next) {
  try {
    await cardsService.softDelete(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Card not found' });
    next(err);
  }
}

module.exports = { getCards, getCard, createCard, updateCard, deleteCard };
