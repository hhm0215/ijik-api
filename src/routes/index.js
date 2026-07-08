const { Router } = require('express');
const healthRouter = require('./health.route');
const cardsRouter = require('./cards.route');
const postingsRouter = require('./postings.route');

const router = Router();

router.use('/health', healthRouter);
router.use('/cards', cardsRouter);
router.use('/postings', postingsRouter);

module.exports = router;
