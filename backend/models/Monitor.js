const mongoose = require('mongoose');

const PingHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['UP', 'DOWN'], required: true },
  responseTime: { type: Number, required: true },
  statusCode: { type: Number }
}, { _id: false });

const MonitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  currentStatus: { type: String, enum: ['UP', 'DOWN'], default: 'UP' },
  lastChecked: { type: Date, default: Date.now },
  pingIntervalMs: { type: Number, default: 60000 },
  history: [PingHistorySchema]
}, { timestamps: true });

// Pre-save hook to limit history logs to the last 20 items
MonitorSchema.pre('save', function (next) {
  if (this.history.length > 20) {
    this.history = this.history.slice(-20);
  }
  next();
});

// This line is what makes Monitor.find work!
module.exports = mongoose.model('Monitor', MonitorSchema);
