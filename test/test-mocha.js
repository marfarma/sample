"use strict";

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  PLH = require('../lib/polyhedron.js'),
  PouchDB = require('pouchdb'),
  should = chai.should(),
  helper = require('./helper.js'),
  circuitbox = require('circuitbox')
  ;

chai.use(chaiAsPromised);

var apis = {
  pouchdb: require('../lib/servers/pouchapi.js')
}; 

// deps.apis
// deps.Index
// deps.Datastore
circuitbox.create({
  modules: [
    function (registry) {
      registry.for('apis').use(apis);

      registry.for('Index').require('./index.js');
        //.dependsOn('message');

      //registry.for('Datastore').use(PLH.Datastore);
        
      registry.for('PLH').use(PLH.Datastore);
        .dependsOn('apis')
        .dependsOn('Index')
        //.dependsOn('Datastore')
        ;
    }
  ]
}).done(function (cbx) {
  cbx.get('PLH').done(function (plh) {
    PLH = plh;
  }, function (err) {
    console.log('Could not load library');
    return;
  });

}, function (err) {
  console.log('Could not create circuitbox');
}); 

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
  var store;
  
  beforeEach(function (done) {
    var ds = PLH.datastore({database: 'testdb2', server: 'pouchdb'})
         .then(function (data) {
            console.log(data);
            store = data;
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
  
  it("should be an instance of PLH.Datastore", function () {
    store.should.be.an.instanceof(PLH.Datastore);
  });

});
