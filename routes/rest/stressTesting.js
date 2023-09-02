const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

// Function to execute the autocannon command and return a promise
function executeAutocannon(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

// Define a route for running autocannon
router.post('/run-autocannon', async (req, res) => {
     const { url, connections, duration, pipelining } = req.body;
    /*"{
        "url": "https://quaidahmed.tech",
        "connections": 1000,
        "duration": 20,
        "pipelining": 10
      }"
    */
    

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
  
    const autocannonCommand = `autocannon -c ${connections || 1000} -d ${duration || 20} -p ${pipelining || 10} ${url}`;
  
    try {
      const { stdout, stderr } = await executeAutocannon(autocannonCommand);
      res.json({
        stdout: stdout,
        stderr: stderr,
      });
    } catch (error) {
      res.status(500).json({ error: `Error: ${error.message}` });
    }
});
  


module.exports = router;
