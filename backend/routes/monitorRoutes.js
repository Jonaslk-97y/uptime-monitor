const express = require('express');
const router = express.Router();
const { getMonitors, createMonitor, deleteMonitor } = require('../controllers/monitorController');

// Route for fetching and creating monitors
router.route('/')
  .get(getMonitors)
  .post(createMonitor);

// Route for deleting a specific monitor by its MongoDB ID
router.route('/:id')
  .delete(deleteMonitor);

module.exports = router;
