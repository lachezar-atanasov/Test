import app from './app.js';
import config from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║       Task Manager API Server Running          ║
╠════════════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}               ║
║  Health:  http://localhost:${PORT}/api/health    ║
║  Mode:    ${config.nodeEnv.padEnd(35)}║
╚════════════════════════════════════════════════╝
  `);
});
