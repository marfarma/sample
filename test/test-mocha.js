"use strict";

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  PLH = require("../lib/polyhedron.js"),
  PouchDB = require('pouchdb'),
  should = chai.should(),
  helper = require('./helper.js')
  ;

chai.use(chaiAsPromised);  

describe("Library Interface:", function () {

  describe("create a database", function () {
    
    it("PouchDB", function (done) {
      var ds = PLH.datastore({database: 'testdb2', server: 'pouchdb'});
      //ds.should.be.fulfilled.and.notify(done);
      ds.should.eventually.be.an.instanceof(PLH.Datastore).notify(done);
    });
  
    it.skip("Dropbox", function (done) {
      var ds = PLH.datastore({database: 'testdb2', server: 'dropbox'});
      ds.should.eventually.be.an.instanceof(PLH.Datastore).notify(done);
    });
  });
  
  describe("delete a database", function () {
    
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
  
});

describe("Datastore", function () {
  var ds;
  
  beforeEach(function (done) {
    ds = PLH.datastore({database: 'testdb2', server: 'pouchdb'})
         .then(function (data) {
           console.log(data);
            return data;
         })
         .then(function (data) {
            done();
         })
         .catch(function (reason) {
           done(reason);
         });  
  });

  afterEach(function (done) {
    // testUtils.cleanupTestDatabases();
    done();
  }); 
  
  it("should be an instance of PLH.Datastore", function (done) {
    ds.should.eventually.be.an.instanceof(PLH.Datastore).notify(done);
  });

});
