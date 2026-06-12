const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const monitorRoutes = require('./routes/monitorRoutes');
const { startPinger } = require('./workers/pinger');

dotenv.config();

const app = express();

// Replace your old app.use(cors()); with this configuration:
app.use(cors({
  origin: '*', // Allows any deployed frontend domain to fetch data securely
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/api/monitors', monitorRoutes);

app.get('/', (req, res) => {
  res.send('Uptime Monitor API running smoothly...');
});

const PORT = process.env.PORT || 5000;

// Wrap the startup sequence inside a clean async execution
const startServer = async () => {
  try {
    // 1. Force database connection to succeed first
    await connectDB();
    
    // 2. Start listening on the port once connected
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // 3. Fire up the background worker safely
      startPinger();
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();
