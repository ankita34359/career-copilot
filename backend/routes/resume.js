const router = require('express').Router();
const auth   = require('../middleware/auth');
const Resume = require('../models/Resume');

// (LIST_SELECT used by /primary only — /all uses parallel queries for hasFile detection)

// ── Static routes MUST precede /:id routes ─────────────────────────────────

// GET /api/resume/primary
router.get('/primary', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id, isPrimary: true })
      .select('-extractedText -fileData')
      .lean();
    res.json(resume || null);
  } catch (err) {
    console.error('[Resume] GET /primary:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/resume/all
router.get('/all', auth, async (req, res) => {
  try {
    // Two parallel queries:
    // 1. All resume metadata (no heavy fields)
    // 2. IDs of resumes that actually have a stored PDF ($type binData = BSON binary)
    const [resumes, withFile] = await Promise.all([
      Resume.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select('-extractedText -fileData')
        .lean(),
      Resume.find({ userId: req.user.id, fileData: { $exists: true, $type: 'binData' } })
        .select('_id')
        .lean(),
    ]);

    const fileSet = new Set(withFile.map((r) => r._id.toString()));

    const mapped = resumes.map((r) => ({
      ...r,
      hasFile: fileSet.has(r._id.toString()),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('[Resume] GET /all:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Parameterized routes ───────────────────────────────────────────────────

// GET /api/resume/:id/file  — streams the raw PDF back to the client
router.get('/:id/file', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id })
      .select('fileData fileName');

    if (!resume)          return res.status(404).json({ message: 'Resume not found' });
    if (!resume.fileData) return res.status(422).json({ message: 'PDF not stored for this resume. Please re-analyze it to enable viewing.' });

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="${resume.fileName}"`,
      'Content-Length':      resume.fileData.length,
    });
    res.send(resume.fileData);
  } catch (err) {
    console.error('[Resume] GET /:id/file:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/resume/set-primary/:id
router.patch('/set-primary/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    await Resume.updateMany({ userId: req.user.id }, { isPrimary: false });
    resume.isPrimary = true;
    await resume.save();

    res.json({ message: 'Primary resume updated', resumeId: req.params.id });
  } catch (err) {
    console.error('[Resume] PATCH /set-primary:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/resume/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    console.error('[Resume] DELETE /:id:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
