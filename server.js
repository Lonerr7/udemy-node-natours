const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. SHUTTING DOWN THE SERVER!');
  console.log(`${err.name}:`, err.message);

  // Closing a server and exiting node app. 0 - no errors, 1 - an error occured
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`successful connection`);
  });

// Starting a server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION. SHUTTING DOWN THE SERVER!');
  console.log(`${err.name}:`, err.message);

  // Closing a server and exiting node app. 0 - no errors, 1 - an error occured
  server.close(() => {
    process.exit(1);
  });
});
