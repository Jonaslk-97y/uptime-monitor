const Monitor = require('../models/Monitor');

// @desc    Get all monitored sites
// @route   GET /api/monitors
exports.getMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find({}).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, count: monitors.length, data: monitors });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new site to monitor
// @route   POST /api/monitors
exports.createMonitor = async (req, res) => {
  try {
    const { name, url, pingIntervalMs } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, error: 'Provide name and URL' });
    }
    const newMonitor = await Monitor.create({ name, url, pingIntervalMs });
    return res.status(201).json({ success: true, data: newMonitor });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a monitored site
// @route   DELETE /api/monitors/:id
exports.deleteMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    await monitor.deleteOne();
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};
