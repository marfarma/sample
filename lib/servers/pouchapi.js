"use strict";

var PouchDB = require('pouchdb');
//var Q = Q || require('bluebird');
function PouchAPI() {
  this.version = '1.0';
  this.apiName = 'pouchdb';

  this.openDb = function (database) {
    return PouchDB(database, {});
  };
  
  this.destroy = function (database, db) {
    return db.destroy();
  };
  
  this.key = function (database) {
    return this.apiName + '_' + database;
  };  
}

module.exports = new PouchAPI();
