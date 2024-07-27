const Agenda = require('agenda');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

if (dotenv.error) {
  throw dotenv.error;
}

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' }, processEvery: '1 minute' });

// Define the 'send email' job
agenda.define('send email', async (job) => {
  const { emailBody, subject, emailAddresses } = job.attrs.data;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.USER,
    to: emailAddresses,
    subject: subject,
    text: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
});

// Define the 'wait delay' job
agenda.define('waitDelay', async (job) => {
  const { duration, nextJob, nextJobData, taskType, repeatInterval } = job.attrs.data;

  const durationInMinutes = Number(duration);
  if (isNaN(durationInMinutes)) {
    console.error('Invalid duration:', duration);
    return;
  }

  if (taskType === 'repeat') {
    const repeatIntervalInMinutes = Number(repeatInterval);
    if (isNaN(repeatIntervalInMinutes)) {
      console.error('Invalid repeat interval:', repeatInterval);
      return;
    }
    await agenda.every(`${repeatIntervalInMinutes} minutes`, nextJob, nextJobData);
    console.log(`Scheduled ${nextJob} to repeat every ${repeatIntervalInMinutes} minutes`);
  } else if (taskType === 'schedule') {
    await agenda.schedule(`in ${durationInMinutes} minutes`, nextJob, nextJobData);
    console.log(`Scheduled ${nextJob} to run in ${durationInMinutes} minutes`);
  } else if (taskType === 'now') {
    await agenda.now(nextJob, nextJobData);
    console.log(`Scheduled ${nextJob} to run now`);
  } else {
    console.error('Invalid taskType:', taskType);
  }
});

// Define the 'lead source' job
agenda.define('lead source', async (job) => {
  const { source } = job.attrs.data;
  console.log(`Lead source: ${source}`);
});

// Define the 'coldEmail' job
agenda.define('coldEmail', async (job) => {
  const { email, subject, body } = job.attrs.data;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.USER,
    to: email,
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Cold email sent successfully');
  } catch (error) {
    console.error('Error sending cold email:', error);
  }
});

// Start the Agenda instance
(async function() {
  try {
    await agenda.start();
    console.log("Agenda started!");
  } catch (error) {
    console.error("Error starting Agenda:", error);
  }
})();

module.exports = agenda;
