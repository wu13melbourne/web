'use strict';

const Datastore = require('@google-cloud/datastore');
const config = require('../config');

// Configuration for the datatbase
const ds = Datastore({
  projectId: config.get('GCLOUD_PROJECT')
});
const kind = 'vehicles';


function fromDatastore (obj) {
  obj.id = obj[Datastore.KEY].id;
  return obj;
}


function toDatastore (obj, nonIndexed) {
  nonIndexed = nonIndexed || [];
  const results = [];
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) {
      return;
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    });
  });
  return results;
}

// Display function: lists all vehicles in the Datastore sorted alphabetically by title.
function list (limit, token, cb) {
  const q = ds.createQuery([kind])
    .limit(limit)
    .order('title')
    .start(token);

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err);
      return;
    }
    const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
    cb(null, entities.map(fromDatastore), hasMore);
  });
}


// Update function: creates a new vehicle or update an existing vehicle with new dataset.
function update (id, data, cb) {
  let key;
  if (id) {
    key = ds.key([kind, parseInt(id, 10)]);
  } else {
    key = ds.key(kind);
  }

  const entity = {
    key: key,
    data: toDatastore(data, ['description'])
  };

  ds.save(
    entity,
    (err) => {
      data.id = entity.key.id;
      cb(err, err ? null : data);
    }
  );
}


function create (data, cb) {
  update(null, data, cb);
}

function read (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.get(key, (err, entity) => {
    if (!err && !entity) {
      err = {
        code: 404,
        message: 'Not found'
      };
    }
    if (err) {
      cb(err);
      return;
    }
    cb(null, fromDatastore(entity));
  });
}

// Delete function
function _delete (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.delete(key, cb);
}


module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list
};

