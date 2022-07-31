
// Define your processes and export them from here.

const { Worker } = require('worker_threads')

// const hostStatusManager = new Worker(require.resolve('./hostStatusManager.js'), { command:"start-looking" });


function watchHosts_Service(workerData) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(require.resolve('./hostStatusManager.js'), { workerData });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      })
    })
}

module.exports ={
    // hostStatusManager,
    watchHosts_Service
}
