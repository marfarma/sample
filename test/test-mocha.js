"use strict";

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  PLH = require("../lib/polyhedron.js"),
  PouchDB = require('pouchdb'),
  should = chai.should(),
  helper = require('./helper.js'),
  tracer = require('../lib/tools/tracer.js');

chai.use(chaiAsPromised);  
tracer.traceAll(PLH, true);

//var DropboxAPI; // = require(../lib/servers/PouchAPI.js);

describe("Library Interface:", function () {

  describe("create a database", function () {
    
    it("PouchDB", function (done) {
      var ds = new PLH.datastore({database: 'testdb2', server: 'pouchdb'}).then(
        function (reason) {
          ds.should.eventually.be.an.instanceof(PLH.Datastore).notify(done);
        });
    });
  
    it.skip("Dropbox", function (done) {
      var ds = new PLH.datastore({database: 'testdb2', server: 'dropbox'});
      ds.should.eventually.be.an.instanceof(PLH.Datastore).notify(done);
    });
  });
  
  describe("delete a database", function () {
    this.timeout(10000);
    
    it("PouchDB", function (done) {
      var ds = PLH.datastore({database: 'testdb2', server: 'pouchdb'})
      .then(function (result) {
        ds = ds.destroy();
        ds.should.be.fulfilled.and.notify(done);
      })
      .catch(function (reason) {
        ds.should.be.fulfilled.and.notify(done);
      });
    });
    
    it.skip("Dropbox", function (done) {
      var ds = PLH.datastore({database: 'testdb2', server: 'dropbox'})
      .then(function (result) {
        ds.destroy();
        ds.should.be.fulfilled.and.notify(done);
      })
      .catch(function (reason) {
        ds.should.be.fulfilled.and.notify(done);
      });
    });
  });
  
  tracer.untraceAll();
});
