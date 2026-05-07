const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Diary   = require('../models/Diary');
const Job     = require('../models/Job');

/**
 * GET /api/search?q=keyword
 * Case-insensitive regex search across Interview Diary and Job Tracker.
 * Max 5 results per category. Requires auth.
 */
router.get('/', auth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return res.json({ interviews: [], jobs: [] });

    const regex  = new RegExp(q, 'i');
    const userId = req.user.id;

    const [interviews, jobs] = await Promise.all([
      Diary.find({
        userId,
        $or: [
          { company:      regex },
          { role:         regex },
          { struggles:    regex },
          { keyLearnings: regex },
          { topics:       regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('company role createdAt result')
        .lean(),

      Job.find({
        userId,
        $or: [
          { company: regex },
          { role:    regex },
          { status:  regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('company role status createdAt')
        .lean(),
    ]);

    res.json({ interviews, jobs });
  } catch (err) {
    console.error('[Search] Error:', err.message);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;
