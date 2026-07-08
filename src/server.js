require('dotenv').config();
const app = require('./app');
const { checkConnection } = require('./db/pool');

const PORT = process.env.PORT || 3000;

checkConnection().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
});
