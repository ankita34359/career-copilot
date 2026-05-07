const Notification = require('../models/Notification');

const MAX_PER_USER = 15;
const MAX_AGE_DAYS = 5;

/**
 * Fire-and-forget notification creator with automatic cleanup.
 * - Keeps only the latest MAX_PER_USER notifications per user
 * - Deletes notifications older than MAX_AGE_DAYS
 * Never throws — notification failure must never break the main feature.
 *
 * @param {string} userId
 * @param {{ title: string, message: string, type?: 'info'|'success'|'warning', actionLink?: string }} payload
 */
async function createNotification(userId, { title, message, type = 'info', actionLink = '' }) {
  try {
    await Notification.create({ userId, title, message, type, actionLink });

    // --- Cleanup pass 1: keep only the latest MAX_PER_USER per user ---
    const keepIds = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(MAX_PER_USER)
      .select('_id')
      .lean();

    if (keepIds.length === MAX_PER_USER) {
      // There are at least MAX_PER_USER docs — delete everything older than the last kept one
      const oldestKeptDate = (await Notification.findById(keepIds[keepIds.length - 1]._id).select('createdAt').lean()).createdAt;
      await Notification.deleteMany({ userId, createdAt: { $lt: oldestKeptDate } });
    }

    // --- Cleanup pass 2: delete notifications older than MAX_AGE_DAYS ---
    const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({ userId, createdAt: { $lt: cutoff } });

  } catch (err) {
    console.error('[Notification] Failed to create/clean notification:', err.message);
  }
}

module.exports = createNotification;
