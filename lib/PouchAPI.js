function PouchAPI() {
}

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