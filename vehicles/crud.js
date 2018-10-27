'use strict';

const express = require('express');
const bodyParser = require('body-parser');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * Display a page of at most 20 vehicles at one time..
 */
router.get('/', (req, res, next) => {
  getModel().list(20, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('vehicles/list.pug', {
      vehicles: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * Display a registeration form for creating a new vehicle.
 */
router.get('/add', (req, res) => {
  res.render('vehicles/form.pug', {
    vehicle: {},
    action: 'Add'
  });
});

/**
 * Create a new vehicle.
 */
router.post('/add', (req, res, next) => {
  const data = req.body;

  // Write the submitted data to the database.
  getModel().create(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}`);
  });
});


/**
 * Display a registeration form with chosen id for editing.
 */
router.get('/:vehicle/edit', (req, res, next) => {
  getModel().read(req.params.vehicle, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('vehicles/form.pug', {
      vehicle: entity,
      action: 'Edit'
    });
  });
});

/**
 * Update a vehicle.
 */
router.post('/:vehicle/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.vehicle, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * Display a vehicle based on id.
 */
router.get('/:vehicle', (req, res, next) => {
  getModel().read(req.params.vehicle, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('vehicles/view.pug', {
      vehicle: entity
    });
  });
});

/**
 * Delete a vehicle.
 */
router.get('/:vehicle/delete', (req, res, next) => {
  getModel().delete(req.params.vehicle, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Deal with the errors while using router.
 */
router.use((err, req, res, next) => {
  err.response = err.message;
  next(err);
});

module.exports = router;
