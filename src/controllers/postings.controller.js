const postingsService = require('../services/postings.service');

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
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Posting not found' });
    next(err);
  }
}

async function createPosting(req, res, next) {
  try {
    const { company, title, url, status = 'open' } = req.body;
    if (!company || !title) {
      return res.status(400).json({ success: false, error: 'company and title are required' });
    }
    const posting = await postingsService.create({ company, title, url, status });
    res.status(201).json({ success: true, data: posting });
  } catch (err) {
    next(err);
  }
}

async function updatePosting(req, res, next) {
  try {
    const posting = await postingsService.update(req.params.id, req.body);
    res.json({ success: true, data: posting });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Posting not found' });
    next(err);
  }
}

async function deletePosting(req, res, next) {
  try {
    await postingsService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Posting not found' });
    next(err);
  }
}

module.exports = { getPostings, getPosting, createPosting, updatePosting, deletePosting };
