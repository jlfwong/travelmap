var localStorageMemoize = function(cachekeyPrefix, fn) {
  return function() {
    var args = Array.prototype.slice.apply(arguments);
    var key = "lsMemoV1_" + cachekeyPrefix + "_" + JSON.stringify(args);
    var ret;
    if (!(ret = JSON.parse(localStorage.getItem(key)))) {
      ret = fn.apply(this, args);
      localStorage.setItem(key, ret);
    }
    return ret;
  };
};

// TODO(jlfwong): Generalize for any number of resolve args?
localStorageMemoize.promise = function(cacheKeyPrefix, fn) {
  return function() {
    var args = Array.prototype.slice.apply(arguments);
    var key = "pMemoV1_" + cacheKeyPrefix + "_" + JSON.stringify(args);
    var deferred = $.Deferred();
    var cached = JSON.parse(localStorage.getItem(key));
    if (cached) {
      deferred.resolveWith(null, cached);
    } else {
      fn.apply(this, args).then(function() {
        var args = Array.prototype.slice.apply(arguments);
        localStorage.setItem(key, JSON.stringify(args));
        deferred.resolveWith(null, args);
      });
    }
    return deferred.promise();
  };
};

module.exports = localStorageMemoize;
