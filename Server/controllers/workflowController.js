// controllers/workflowController.js
const Workflow = require('../models/workflow');
const { executeWorkflow } = require('../Services/workflowExecutor');

exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    res.json(workflow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveWorkflow = async (req, res) => {
  const { nodes, edges } = req.body;
  const workflow = new Workflow({ nodes, edges });

  try {
    const newWorkflow = await workflow.save();
    res.status(201).json(newWorkflow);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.runWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    await executeWorkflow(workflow);
    res.status(200).json({ message: 'Workflow executed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
