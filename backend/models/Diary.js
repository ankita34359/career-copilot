const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:      { type: String, required: true },
  role:         { type: String },
  rounds:       { type: Number, default: 1 },
  result:       { type: String }, // Passed | Failed | Pending
  struggles:    { type: String }, // what the candidate found hard
  keyLearnings: { type: String }, // what they took away
  topics:       { type: String }, // comma-separated topic tags, e.g. "DSA, React, System Design"
  // Legacy fields — kept so old documents still read correctly
  weakness:     { type: String },
  learnings:    { type: String },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Diary', diarySchema);
