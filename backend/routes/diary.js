const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const auth = require('../middleware/auth');
const createNotification = require('../utils/createNotification');

// @route   GET api/diary
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/diary
router.post('/', auth, async (req, res) => {
  console.log('[Diary POST] req.body:', req.body);
  const { company, role, rounds, result, struggles, keyLearnings, topics } = req.body;
  try {
    const newEntry = new Diary({
      userId: req.user.id,
      company,
      role,
      rounds,
      result,
      struggles,
      keyLearnings,
      topics,
    });
    const entry = await newEntry.save();
    console.log('[Diary POST] Saved entry:', { struggles: entry.struggles, keyLearnings: entry.keyLearnings, topics: entry.topics });

    createNotification(req.user.id, {
      title: 'Interview Logged',
      message: `${company}${role ? ` — ${role}` : ''} interview entry has been added.`,
      type: 'info',
      actionLink: '/dashboard/diary',
    });

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/diary/:id
router.put('/:id', auth, async (req, res) => {
  console.log('[Diary PUT] req.body:', req.body);
  const { company, role, rounds, result, struggles, keyLearnings, topics } = req.body;
  const diaryFields = { company, role, rounds, result, struggles, keyLearnings, topics };

  try {
    let entry = await Diary.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    entry = await Diary.findByIdAndUpdate(req.params.id, { $set: diaryFields }, { new: true });
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/diary/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    let entry = await Diary.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Diary.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
