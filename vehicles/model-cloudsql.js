'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'vehiclestore'
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

// Show the user all existing registeration dataset in the database.
function list (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `vehicles` LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}


// Create a new vehicle.
function create (data, cb) {
  connection.query('INSERT INTO `vehicles` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}


function read (id, cb) {
  connection.query(
    'SELECT * FROM `vehicles` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}

// Update a vehicle
function update (id, data, cb) {
  connection.query(
    'UPDATE `vehicles` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}

// Delete a vehicle.
function _delete (id, cb) {
  connection.query('DELETE FROM `vehicles` WHERE `id` = ?', id, cb);
}

module.exports = {
  createSchema: createSchema,
  list: list,
  create: create,
  read: read,
  update: update,
  delete: _delete
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();
  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    createSchema(result);
  });
}

// Define a new schema for database to store registerations
function createSchema (config) {
  const connection = mysql.createConnection(extend({
    multipleStatements: true
  }, config));

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`vehiclestore\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`vehiclestore\`;
    CREATE TABLE IF NOT EXISTS \`vehiclestore\`.\`vehicles\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`account\` VARCHAR(255) NOT NULL,
	  \`userPassword\` INT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`address\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(255) NOT NULL,
      \`drivinghistory\` TEXT NOT NULL,
     
    PRIMARY KEY (\`id\`));`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.end();
    }
  );
}
