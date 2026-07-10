const postingsService = require('../services/postings.service');
const { validateCreate, validateUpdate } = require('../validators/postings.validator');

async function getPostings(req, res, next) {
  try {
    const postings = await postingsService.findAll();
    res.json({ success: true, data: postings });
  } catch (err) {
    next(err);
  }
}

async function getPosting(req, res, next) {
  try {
    const posting = await postingsService.findById(req.params.id);
    res.json({ success: true, data: posting });
  } catch (err) {
    next(err);
  }
}

async function createPosting(req, res, next) {
  try {
    const posting = await postingsService.create(validateCreate(req.body));
    res.status(201).json({ success: true, data: posting });
  } catch (err) {
    next(err);
  }
}

async function updatePosting(req, res, next) {
  try {
    const posting = await postingsService.update(req.params.id, validateUpdate(req.body));
    res.json({ success: true, data: posting });
  } catch (err) {
    next(err);
  }
}

async function deletePosting(req, res, next) {
  try {
    await postingsService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPostings, getPosting, createPosting, updatePosting, deletePosting };
