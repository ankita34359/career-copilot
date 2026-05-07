const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Job = require('../models/Job');

// @route   GET api/activity
// @desc    Recent job activity — applied and interviewing only
router.get('/', auth, async (req, res) => {
  try {
    const activeStatuses = ['applied', 'interviewing'];

    const jobs = await Job.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const activities = jobs
      .filter((job) => activeStatuses.includes(job.status?.toLowerCase()))
      .slice(0, 10)
      .map((job) => ({
        type: 'job',
        title: `Applied to ${job.company}`,
        timestamp: job.date,
        meta: { status: job.status, role: job.role },
      }));

    return res.json({ activities });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
