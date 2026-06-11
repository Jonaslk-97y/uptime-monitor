const axios = require('axios');
const Monitor = require('../models/Monitor');

const pingAllUrls = async () => {
  try {
    // Ensure we are explicitly calling the Mongoose model query
    const monitors = await Monitor.find({}).exec();
    
    if (!monitors || monitors.length === 0) {
      console.log('No websites found in database to ping yet.');
      return;
    }
    
    for (const monitor of monitors) {
      const startTime = Date.now();
      let status = 'DOWN';
      let statusCode = null;
      let responseTime = 0;

      try {
        const response = await axios.get(monitor.url, { timeout: 5000 });
        statusCode = response.status;
        status = response.status >= 200 && response.status < 300 ? 'UP' : 'DOWN';
        responseTime = Date.now() - startTime;
      } catch (error) {
        statusCode = error.response ? error.response.status : 500;
        status = 'DOWN';
        responseTime = Date.now() - startTime;
      }

      await Monitor.findByIdAndUpdate(monitor._id, {
        $set: { 
          currentStatus: status, 
          lastChecked: new Date() 
        },
        $push: { 
          history: { status, responseTime, statusCode, timestamp: new Date() } 
        }
      });
      
      console.log(`Pinged ${monitor.name} (${monitor.url}): ${status} - ${responseTime}ms`);
    }
  } catch (error) {
    console.error('Error running background pinger:', error.message);
  }
};

const startPinger = () => {
  console.log('Background pinger service initialized...');
  // Only set the interval loop so it doesn't fire instantly before DB connects
  setInterval(pingAllUrls, 60000); 
};


module.exports = { startPinger };
