const cardsService = require('../services/cards.service');
const { validateCreate, validateUpdate } = require('../validators/cards.validator');

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
    next(err);
  }
}

async function createCard(req, res, next) {
  try {
    const card = await cardsService.create(validateCreate(req.body));
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
}

async function updateCard(req, res, next) {
  try {
    const card = await cardsService.update(req.params.id, validateUpdate(req.body));
    res.json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
}

async function deleteCard(req, res, next) {
  try {
    await cardsService.softDelete(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCards, getCard, createCard, updateCard, deleteCard };
