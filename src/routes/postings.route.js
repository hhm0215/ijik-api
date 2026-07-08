const { Router } = require('express');
const { getPostings, getPosting, createPosting, updatePosting, deletePosting } = require('../controllers/postings.controller');

const router = Router();

router.get('/', getPostings);
router.get('/:id', getPosting);
router.post('/', createPosting);
router.put('/:id', updatePosting);
router.delete('/:id', deletePosting);

module.exports = router;
