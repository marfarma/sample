"use strict";

// polyfill for phantomjs is missing bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this: oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Q = require("q"),
  PouchDB = require('pouchdb'),
  should = chai.should(),
  helper = require('./helper.js');

chai.use(chaiAsPromised);  
Q.longStackSupport = true;

function Datastore(server) {
  this.server = server;
}

Datastore.prototype.destroy = function (name) {
  var deferred = Q.defer(); 
  this.server.destroy(name, {}, function (err, db) {
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
  this.db = deferred.promise;
};

Datastore.prototype.open = function (name) {
  this.database = name;
  
  var deferred = Q.defer(); 
  new this.server(this.database, {}, function (err, db) {
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
  this.db = deferred.promise;
};

describe("Library Interface:", function () {
  var Promise;
  
  beforeEach(function (done) {
    var deferred = Q.defer(); 
    new PouchDB('testdb', {}, function (err, db) {
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
    Promise = deferred.promise;
    done();
  });
    
  it("should create a database", function (done) {
    Promise.should.eventually.be.an.instanceof(PouchDB).notify(done);
  });

  it("Datastore should create a database", function (done) {
    var ds = new Datastore(PouchDB);
    ds.open('testdb2');
    ds.db.should.eventually.be.an.instanceof(PouchDB).notify(done);
  });
  
  it("Datastore should delete a database", function (done) {
    var ds = new Datastore(PouchDB);
    ds.destroy('testdb2');
    ds.db.should.be.fulfilled.and.notify(done);
  });

  it("should delete a database", function (done) {
    var deferred2 = Q.defer(); 
    
    Promise
    .then(function (ds) {
      PouchDB.destroy('testdb', {}, function (err, info) {
        if (err) {
          if (err instanceof Error) {
            deferred2.reject(err);
          } else if (err instanceof String) {
            deferred2.reject(new TypeError(err));
          } else {
            deferred2.reject(err);
          }
        } else {
          deferred2.resolve(info);
        }
      });
    },
    function (reason) {
      deferred2.reject(reason);
    });
    
    var Promise2 = deferred2.promise;
    Promise2.should.be.fulfilled.and.notify(done);
  });

  
});
