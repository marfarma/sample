"use strict";

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Q = require("q"),
  PouchDB = require('pouchdb'),
  should = chai.should(),
  helper = require('./helper.js');

chai.use(chaiAsPromised);  
Q.longStackSupport = true;

// ============================ PouchAPI =====================
require('pouchdb');
function PouchAPI() {}

PouchAPI.prototype.open = function (database) {
  var deferred = Q.defer(); 
  new PouchDB(this.database, {}, function (err, db) {
    if (err) {
      if (err instanceof Error) {
        deferred.reject(err);
      } else if (err instanceof String) {
        deferred.reject(new TypeError(err));
      } else {
        deferred.reject(err);
      }
    } else {
      deferred.resolve(db);
    }
  });
  return deferred.promise;
};

PouchAPI.prototype.destroy = function (database, db) {
  var deferred = Q.defer(); 
  this.server.destroy(this.database, {}, function (err, db) {
    if (err) {
      if (err instanceof Error) {
        deferred.reject(err);
      } else if (err instanceof String) {
        deferred.reject(new TypeError(err));
      } else {
        deferred.reject(err);
      }
    } else {
      deferred.resolve(db);
    }
  });
  return deferred.promise;
};

exports = PouchAPI;
// ============================ PouchAPI =====================


// ============================ Datastore =====================
function Datastore(config) {
  this.config = { // user string server to lookup driver in server object (di)?
                database: "database",
                server: new Polyhedron.server.PouchAPI(),
                // server: new Polyhedron.server.DropboxAPI(),
              }
  this.database = config.database;
  this.server = config.server;
  if (this.database && this.database.length > 0) {
    this.db = this.server.open(this.database);
  }
}

Datastore.prototype.destroy = function () {
  // destroy this.database

  // calls api.destroy, which returns a promise
  // deleteDatastore(datastoreId, callback)
  
  this.db =  this.server.destroy(this.database, this.db); 
  return this.db;
};

Datastore.prototype.open = function (name) {
  this.database = name;
  // open does an automatic create if necessary
    
  // calls api.open, which returns a promise
  // createDatastore(callback)
  // openDatastore(datastoreId, callback)

  this.db = this.server.open(this.database); 
  return this.db;

};
// ============================ Datastore =====================


describe("Library Interface:", function () {
  
  it("PouchDB Datastore should create a database", function (done) {
    var ds = new Datastore({database:'testdb2', server: PouchAPI});
    //ds.open('testdb2'); // default open on new 
    ds.db.should.eventually.be.an.instanceof(PouchDB).notify(done);
  });
  
  it("Dropbox Datastore should create a database", function (done) {
    var ds = new Datastore({database:'testdb2', server: DropboxAPI});
    //ds.open('testdb2'); // default open on new 
    ds.db.should.eventually.be.an.instanceof(PouchDB).notify(done);
  });
  
  it("PouchDB Datastore should delete a database", function (done) {
    var ds = new Datastore({database:'testdb2', server: PouchAPI});
    ds.destroy();
    ds.db.should.be.fulfilled.and.notify(done);
  });
    
  it("Dropbox Datastore should delete a database", function (done) {
    var ds = new Datastore({database:'testdb2', server: DropboxAPI});
    ds.destroy();
    ds.db.should.be.fulfilled.and.notify(done);
  });
  
});
