

// Portions extracted from NeDB (MIT license)
// Copyright (c) 2013 Louis Chatriot <louis.chatriot@gmail.com>
// https://github.com/louischatriot/nedb

"use strict";

var Index = require('./index.js');


// ============================ PLH ===========================
function PLH() {
  // application lifetime factory
  this.version = '1.0';

  this.apis = {
    pouchdb: require('../lib/servers/pouchapi.js')
    //,
    //dropbox: require('../lib/servers/dropboxapi.js')
  };

  // set of open databases (server+database pairs)
  // Key: unique key: 'server id'+'database name'
  //   server id -> server+url+databaseName for remote databases
  //             -> apiName+mode for REST API stores
  //             -> server+databaseName for local stores
  //             -> filename for filesystem based stores
  //
  // Value: {Datastore object, 
  //         registered types[ types references], 
  //         pending operations[ array of promises] }
  //
  this.datastores = {};

  // set of registered types
  // Key: 'type id'
  //
  // Value: {name, prototype, datastores[ datastores references] }
  //
  this.types = {};

  // set of database+registered type pairs
  // Key: 'datastore_id'+'type id'
  //
  // Value: {Datastore reference, Type reference, items[ item references] }
  //        observable array for collection change events 
  //
  this.typeMap = {};

  // identity map indexed by internal id and type
  // Value: {item_id, type_id, value, datastores{datastore_id: {lastSavedValue, lastSavedTime}}, }
  // items are observable

  this.indexes = {};
  this.indexes.id = new Index({ fieldName: '__PLH__.id', unique: true });
  this.indexes.type_id = new Index({ fieldName: '__PLH__.type_id', unique: false });

  // pending operations queue
  // Item:  {  operation_id: id, 
  //           action: "save", 
  //           args: args, 
  //           status: [{datastore_id, promise, result]}, 
  //           settled: [true|false]
  //         }
  // TODO: Event on settled 
  // TODO: Dequeue on all fullfilled
  // TODO: Rollback on any rejected
  this.pending = [];

  //this.Datastore = Datastore;
  /**
   * Create / Open Database 
   */
  this.datastore = function (config) {
    
    console.log(this);

    var self = this,
      server,
      database = config.database,
      server = (typeof config.server !== 'function') ? 
                self.apis[config.server] : config.server,
      opts = {};

    for (var j in config) {
      if (config.hasOwnProperty(j) && j !== 'server' && j !== 'database') {
        opts[j] = config[j]; 
      }
    }

    return new Datastore({server: server, database: database, opts: opts}
    ).then(
        (function (results) {
          this.datastores[results.key(database)] = results;
          return results;
        }).bind(this)
      );
  
  };
}

// TODO: Modify all to return promise

/**
 * Reset all currently defined indexes
 */
PLH.prototype.resetIndexes = function (newData) {
  var self = this;

  Object.keys(this.indexes).forEach(function (i) {
    self.indexes[i].reset(newData);
  });
  
  // TODO: reset the observable type arrays in typeMap
};

/**
 * Add one or several document(s) to all indexes
 */
PLH.prototype.addToIndexes = function (doc) {
  var i, failingIndex, error
    , keys = Object.keys(this.indexes)
    ;

  for (i = 0; i < keys.length; i += 1) {
    try {
      this.indexes[keys[i]].insert(doc);
      // TODO: update applicable observable type arrays
      // TODO: convert to promises -- update all participating datastores
      // TODO: assign state to each item [dirty|pending|saved]
      // TODO: insert each operation/action into datastore's pending list
    } catch (e) {
      failingIndex = i;
      error = e;
      break;
    }
  }

  // If an error happened, we need to rollback the insert on all other indexes
  if (error) {
    for (i = 0; i < failingIndex; i += 1) {
      this.indexes[keys[i]].remove(doc);
      // TODO: update applicable observable type arrays
    }

    throw error;
  }
};

/**
 * Remove one or several document(s) from all indexes
 */
PLH.prototype.removeFromIndexes = function (doc) {
  var self = this;

  Object.keys(this.indexes).forEach(function (i) {
    self.indexes[i].remove(doc);
    // TODO: update applicable observable type arrays
  });
};

/**
 * Update one or several documents in all indexes
 * To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs
 * If one update violates a constraint, all changes are rolled back
 */
PLH.prototype.updateIndexes = function (oldDoc, newDoc) {
  var i, failingIndex, error
    , keys = Object.keys(this.indexes)
    ;

  for (i = 0; i < keys.length; i += 1) {
    try {
      this.indexes[keys[i]].update(oldDoc, newDoc);
      // TODO: update applicable observable type arrays
    } catch (e) {
      failingIndex = i;
      error = e;
      break;
    }
  }

  // If an error happened, we need to rollback the update on all other indexes
  if (error) {
    for (i = 0; i < failingIndex; i += 1) {
      this.indexes[keys[i]].revertUpdate(oldDoc, newDoc);
      // TODO: update applicable observable type arrays
    }

    throw error;
  }
};

/**
 * Insert a new document
 * @param {Function} cb Optional callback, signature: err, insertedDoc
 *
 */
PLH.prototype._insert = function (newDoc, cb) {
  var callback = cb || function () {}
    ;

  try {
    this._insertInCache(newDoc);
  } catch (e) {
    return callback(e);
  }

};

/**
 * Prepare a document (or array of documents) to be inserted into identity map
 * @api private
 */
PLH.prototype.prepareDocumentForInsertion = function (newDoc) {
  var preparedDoc, self = this;

  if (util.isArray(newDoc)) {
    preparedDoc = [];
    newDoc.forEach(function (doc) { preparedDoc.push(self.prepareDocumentForInsertion(doc)); });
  } else {
    // TODO: update preparedDoc data
    //
    //newDoc._id = customUtils.uid(16);
    //preparedDoc = model.deepCopy(newDoc);
    
    // TODO: make the __PLH__ property non-enumerable
    // TODO: create mapper object with functions curried for type_id 
    // newDoc.__PLH__ = {};
    // newDoc.__PLH__.id = customUtils.uid(16);
    // newDoc.__PLH__.type_id = ;
  }
  
  return preparedDoc;
};

/**
 * If newDoc is an array of documents, this will insert all documents in the cache
 * @api private
 */
PLH.prototype._insertInCache = function (newDoc) {
  if (util.isArray(newDoc)) {
    this._insertMultipleDocsInCache(newDoc);
  } else {
    this.addToIndexes(this.prepareDocumentForInsertion(newDoc));  
  }
};

/**
 * If one insertion fails (e.g. because of a unique constraint), roll back all previous
 * inserts and throws the error
 * @api private
 */
PLH.prototype._insertMultipleDocsInCache = function (newDocs) {
  var i, failingI, error
    , preparedDocs = this.prepareDocumentForInsertion(newDocs)
    ;
  
  for (i = 0; i < preparedDocs.length; i += 1) {
    try {
      this.addToIndexes(preparedDocs[i]);
    } catch (e) {
      error = e;
      failingI = i;
      break;
    }
  }
  
  if (error) {
    for (i = 0; i < failingI; i += 1) {
      this.removeFromIndexes(preparedDocs[i]);
    }
    
    throw error;
  }
};

// ============================ PLH ===========================


// ============================ Datastore =====================
function Datastore(config) {
  
  if (!(this instanceof Datastore)) {
    return new Datastore(config);
  }
  
  this.database = config.database;
  this.server = config.server;
  this.db;
  
  // copy server api properties into Datastore instance
  for (var j in this.server) {
    if (this.server.hasOwnProperty(j)) {
      if (typeof this.server[j] === 'function') {
        this[j] = this.server[j].bind(this);
      } else {
        this[j] = this.server[j]; 
      }
    }
  }
  
  return this.getDb(this.database)
         .then((function (result) {
            this.db = result; 
            return this;
         }).bind(this));
}

Datastore.prototype.destroy = function () {
  
  return this.db.destroy()
         .then((function (result) {
            this.db = result; 
            return this;
         }).bind(this));
};

Datastore.prototype.getDb = function (name) {
  this.database = name;

  return this.open(this.database)
         .then((function (result) {
            this.db = result; 
            return this;
         }).bind(this));
};

// ============================ Datastore =====================

module.exports = exports = new PLH();
