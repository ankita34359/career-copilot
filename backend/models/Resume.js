const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:      { type: String, required: true },
  fileData:      { type: Buffer  },   // raw PDF bytes — served via GET /:id/file
  extractedText: { type: String, default: '' },
  atsScore:      { type: Number, required: true },
  isPrimary:     { type: Boolean, default: false },
  createdAt:     { type: Date,    default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
