'use strict';

const express = require('express');
const bodyParser = require('body-parser');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * Retrieve a page of at most 20 vehicles at one time.
 */
router.get('/', (req, res, next) => {
  getModel().list(20, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.json({
      items: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * Writie a new vehicle into back-end.
 */
router.post('/', (req, res, next) => {
  getModel().create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * Retrieve a vehicle from back-end based on the id through api.
 */
router.get('/:vehicle', (req, res, next) => {
  getModel().read(req.params.vehicle, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * Update a vehicle for "Edit" function, resubmiting the registeration form.
 */
router.put('/:vehicle', (req, res, next) => {
  getModel().update(req.params.vehicle, req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * Delete a vehicle by removing the dataset of this id from back-end.
 */
router.delete('/:vehicle', (req, res, next) => {
  getModel().delete(req.params.vehicle, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).send('OK');
  });
});

/**
 * Deal with the errors while using router.
 */
router.use((err, req, res, next) => {
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = router;
