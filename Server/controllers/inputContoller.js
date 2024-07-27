const asyncHandler = require("express-async-handler");
const Input = require("../models/inputModel");
const EmailData = require("../models/emailDataModel");
const { constants } = require("../constants");
const agenda = require('../agenda');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');


const inputData = asyncHandler(
  async (req, res) => {
    const { emailBody, subject, emailAddresses } = req.body;

    if (!emailBody || !subject || !emailAddresses) {
      return res.status(400).send('All fields are required');
    }

    //   const input = new Input({time, interval, emailBody, subject, emailAddresses });
    //   await input.save();
    const input = await Input.create({ emailBody, subject, emailAddresses });
    await EmailData.create({ emailBody, subject, emailAddresses });
    //  console.log(input)
    // {
    //   emailBody: 'This is a test email body.',
    //   subject: 'Test Email Subject',
    //   emailAddresses: [ 'devanshgulati00@gmail.com' ],
    //   _id: new ObjectId('66495cdae89d2bec578bfb5b'),
    //   __v: 0
    // }
          //  console.log(emailData)
    //  await agenda.schedule(new Date(Date.now() + 60 * 60 * 1000), 'send email', { emailBody, subject, emailAddresses });

    res.status(201).json({ message: 'Email data saved', input });

  }
)

const uploadcsv = asyncHandler(
  async (req, res) => {
    console.log(req.file)
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const filePath = path.join(__dirname, '../', req.file.path);
    // console.log(filePath)
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // File reading and parsing completed, send the results as JSON
      
        try {
          await EmailData.insertMany(results);
          res.json({ message: 'File uploaded and data parsed successfully', data: results });
        } catch (error) {
          console.error('Error saving data to database:', error);
          res.status(500).send('Error processing file');
        }
      })
      .on('error', (error) => {
        // Handle any errors that occur during file read/parse
        console.error('Error reading CSV file:', error);
        res.status(500).send('Error processing file');
      });
  }
)

const scheduleEmails = asyncHandler(async (req, res) => {
  const emailData = await EmailData.find();
  if (!emailData || emailData.length === 0) {
    return res.status(400).send('No email data available. Please upload a CSV file first.');
  }

  // Schedule emails using Agenda
  for (const email of emailData) {
    const { emailAddresses, subject, emailBody } = email;

    try {
      await agenda.schedule(new Date(Date.now() + 60 * 1000), 'send email', { emailBody, subject, emailAddresses });
    } catch (error) {
      console.error('Error scheduling email:', error);
      return res.status(500).send('Error scheduling emails');
    }
  }
  try {
    await EmailData.deleteMany(); // Deletes all documents in the EmailData collection
    res.status(200).send('Data deleted successfully');
  } catch (error) {
    console.error('Error deleting email data:', error);
    res.status(500).send('Error deleting email data after scheduling');
  }
  res.status(200).send('Emails scheduled successfully');
});

module.exports = { inputData, uploadcsv, scheduleEmails }