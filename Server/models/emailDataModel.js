const mongoose = require('mongoose');

const emailDataSchema = new mongoose.Schema({
  emailAddresses: String,
  subject: String,
  emailBody: String,
}, { timestamps: true });

const EmailData = mongoose.model('EmailData', emailDataSchema);

module.exports = EmailData;
