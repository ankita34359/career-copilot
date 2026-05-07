const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Diary = require('../models/Diary');
const ResumeScore = require('../models/ResumeScore');
const Resume = require('../models/Resume');

// @route   GET api/dashboard/stats
// @desc    Aggregated dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [jobs, diaries, primaryResume] = await Promise.all([
      Job.find({ userId: req.user.id }).sort({ date: -1 }).lean(),
      Diary.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
      Resume.findOne({ userId: req.user.id, isPrimary: true }).select('atsScore fileName').lean(),
    ]);

    // 1. ATS Score — from primary resume; null if none set yet
    const atsScore     = primaryResume ? primaryResume.atsScore : null;
    const primaryResumeId   = primaryResume ? primaryResume._id : null;
    const primaryFileName   = primaryResume ? primaryResume.fileName : null;

    // 2. Jobs Applied — only "applied" or "interviewing" statuses
    const activeStatuses = ['applied', 'interviewing'];
    const jobsApplied = jobs.filter(
      (j) => activeStatuses.includes(j.status?.toLowerCase())
    ).length;

    // 3. Interviews — only "interviewing" status
    const interviews = jobs.filter(
      (j) => j.status?.toLowerCase() === 'interviewing'
    ).length;

    // 4. Success Rate — hybrid formula
    // base       = passed / total diary entries                        (50%)
    // strength   = entries with keyLearnings logged / total            (30%)
    // reflection = entries with struggles logged / total               (20%)
    // final      = clamp((base×0.5 + strength×0.3 + reflection×0.2) × 100, 0, 100)
    // Logging struggles is rewarded, not penalised — it signals self-awareness.
    let successRate = 0;
    const totalDiaries = diaries.length;
    if (totalDiaries > 0) {
      const passed = diaries.filter(
        (d) => d.result?.toLowerCase() === 'passed'
      ).length;
      const withLearnings = diaries.filter((d) => (d.keyLearnings || d.learnings)?.trim()).length;
      const withWeakness  = diaries.filter((d) => (d.struggles   || d.weakness)?.trim()).length;

      const base             = passed       / totalDiaries;
      const strengthScore    = withLearnings / totalDiaries;
      const reflectionScore  = withWeakness  / totalDiaries;  // logging struggles is positive

      successRate = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (base * 0.5 + strengthScore * 0.3 + reflectionScore * 0.2) * 100
          )
        )
      );
    }

    // helper: get display text from an entry — prefer text fields, fall back to topics
    const getStrengthText = (d) => {
      if ((d.keyLearnings || d.learnings)?.trim()) return d.keyLearnings || d.learnings;
      if (d.topics?.trim()) return `Topics covered: ${d.topics}`;
      return null;
    };
    const getWeaknessText = (d) => {
      if ((d.struggles || d.weakness)?.trim()) return d.struggles || d.weakness;
      if (d.topics?.trim()) return `Topics to revisit: ${d.topics}`;
      return null;
    };

    // 5. Strong Areas — any entry with keyLearnings or learnings text (result doesn't matter)
    const strongAreas = diaries
      .filter((d) => (d.keyLearnings || d.learnings)?.trim())
      .slice(0, 3)
      .map((d) => ({ company: d.company, role: d.role, text: d.keyLearnings || d.learnings }));

    // 6. Weak Areas — any entry with struggles or topics (non-passed preferred)
    const weakAreas = diaries
      .filter((d) => getWeaknessText(d))
      .slice(0, 3)
      .map((d) => ({ company: d.company, role: d.role, text: getWeaknessText(d) }));

    res.json({
      atsScore,
      primaryResumeId,
      primaryFileName,
      jobsApplied,
      interviews,
      successRate,
      strongAreas,
      weakAreas,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
