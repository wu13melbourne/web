'use strict';

const path = require('path');
const express = require('express');
const config = require('./config');

const app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);

// vehicles
app.use('/vehicles', require('./vehicles/crud'));
app.use('/api/vehicles', require('./vehicles/api'));

// Redirect root to page '/vehicles'
app.get('/', (req, res) => {
  res.redirect('/vehicles');
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
  });
}

module.exports = app;
