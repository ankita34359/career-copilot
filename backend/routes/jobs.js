const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const createNotification = require('../utils/createNotification');

// @route   GET api/jobs
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs
router.post('/', auth, async (req, res) => {
  const { company, role, status, date, notes } = req.body;
  try {
    const newJob = new Job({
      userId: req.user.id,
      company,
      role,
      status,
      date,
      notes
    });
    const job = await newJob.save();

    createNotification(req.user.id, {
      title: 'Job Application Added',
      message: `${company} — ${role} has been added to your tracker.`,
      type: 'info',
      actionLink: '/dashboard/jobs',
    });

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/jobs/:id
router.put('/:id', auth, async (req, res) => {
  const { company, role, status, date, notes } = req.body;
  const jobFields = { company, role, status, date, notes };

  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const prevStatus = job.status;
    job = await Job.findByIdAndUpdate(req.params.id, { $set: jobFields }, { new: true });

    if (status && prevStatus !== status) {
      const statusLabels = {
        applied: 'Applied',
        interviewing: 'Interviewing',
        offer: 'Offer Received',
        rejected: 'Rejected',
        saved: 'Saved',
      };
      const label = statusLabels[status?.toLowerCase()] || status;
      createNotification(req.user.id, {
        title: 'Job Status Updated',
        message: `${job.company} — ${job.role} is now marked as "${label}".`,
        type: status?.toLowerCase() === 'offer' ? 'success' : status?.toLowerCase() === 'rejected' ? 'warning' : 'info',
        actionLink: '/dashboard/jobs',
      });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/jobs/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
