const { Router } = require('express');
const { getCards, getCard, createCard, updateCard, deleteCard } = require('../controllers/cards.controller');

const router = Router();

router.get('/', getCards);
router.get('/:id', getCard);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;
