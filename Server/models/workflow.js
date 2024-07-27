// models/Workflow.js
const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: String,
  type: String,
  data: mongoose.Schema.Types.Mixed,
  position: {
    x: Number,
    y: Number
  }
});

const edgeSchema = new mongoose.Schema({
  id: String,
  source: String,
  target: String,
  type: String
});

const workflowSchema = new mongoose.Schema({
  nodes: [nodeSchema],
  edges: [edgeSchema]
});

module.exports = mongoose.model('Workflow', workflowSchema);
