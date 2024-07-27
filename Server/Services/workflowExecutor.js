const agenda = require('../agenda');

const executeNode = async (node, nextNode) => {
  if (node.type === 'coldEmail') {
    await agenda.now('coldEmail', { email: node.data.email, subject: node.data.subject, body: node.data.body });
    console.log("Cold email sent");
    return;
  } else if (node.type === 'waitDelay') {
    console.log("Processing waitDelay node:", node);
    const duration = Number(node.data.duration);
    const repeatInterval = Number(node.data.repeatInterval);
    const taskType = node.data.taskType;
    
    console.log("Duration:", duration);
    console.log("Repeat Interval:", repeatInterval);

    if (isNaN(duration)) {
      console.error('Invalid duration:', node.data.duration);
      return;
    }
    if (isNaN(repeatInterval) && taskType === 'repeat') {
      console.error('Invalid repeat interval:', node.data.repeatInterval);
      return;
    }

    if (nextNode) {
      const nextJob = nextNode.type;
      const nextJobData = nextNode.data;

      if (taskType === 'schedule') {
        await agenda.schedule(`in ${duration} minutes`, nextJob, nextJobData);
        console.log(`Scheduled ${nextJob} to run in ${duration} minutes`);
      } else if (taskType === 'repeat') {
        await agenda.every(`${repeatInterval} minutes`, nextJob, nextJobData);
        console.log(`Scheduled ${nextJob} to repeat every ${repeatInterval} minutes`);
      } else if (taskType === 'now') {
        await agenda.now(nextJob, nextJobData);
        console.log(`Scheduled ${nextJob} to run now`);
      }
    }
  } else if (node.type === 'leadSource') {
    await agenda.now('lead source', { source: node.data.source });
    return;
  }
};

const findNextNodes = (currentNode, nodes, edges) => {
  const connectedEdges = edges.filter(edge => edge.source === currentNode.id);
  return connectedEdges.map(edge => nodes.find(node => node.id === edge.target));
};

const executeNextNodes = async (currentNode, nodes, edges) => {
  const nextNodes = findNextNodes(currentNode, nodes, edges);
  for (const nextNode of nextNodes) {
    await executeNode(currentNode, nextNode);
    await executeNextNodes(nextNode, nodes, edges);
  }
};

const executeWorkflow = async (workflow) => {
  const { nodes, edges } = workflow;
  const startNode = nodes.find(node => node.type === 'leadSource');

  if (startNode) {
    await executeNextNodes(startNode, nodes, edges);
  } else {
    console.error('No start node found in the workflow');
  }
};

module.exports = { executeWorkflow };
