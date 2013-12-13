var localStorageMemoize = function(cacheKeyPrefix, fn) {
  var localStorageKey = "lsMemoV1_" + cacheKeyPrefix;
  var cache;

  if (!(cache = JSON.parse(localStorage.getItem(localStorageKey)))) {
    cache = {};
  }

  var memoed = function() {
    var args = Array.prototype.slice.apply(arguments);
    var argKey = JSON.stringify(args);
    if (!(cache[argKey])) {
      cache[argKey] = fn.apply(this, args);
      localStorage.setItem(localStorageKey, JSON.stringify(cache));
    }
    return cache[argKey];
  };

  memoed.clear = function() {
    cache = {};
    localStorage.setItem(localStorageKey, JSON.stringify(cache));
  };

  return memoed;
};

// TODO(jlfwong): Generalize for any number of resolve args?
localStorageMemoize.promise = function(cacheKeyPrefix, fn) {
  var localStorageKey = "pMemoV1_" + cacheKeyPrefix;
  var cache;

  if (!(cache = JSON.parse(localStorage.getItem(localStorageKey)))) {
    cache = {};
  }

  var memoed = function() {
    var args = Array.prototype.slice.apply(arguments);
    var argKey = JSON.stringify(args);
    var deferred = $.Deferred();
    var cachedVal = cache[argKey];
    if (cachedVal) {
      deferred.resolveWith(null, cachedVal);
    } else {
      fn.apply(this, args).then(function() {
        var args = Array.prototype.slice.apply(arguments);
        cache[argKey] = args;
        memoed.save();
        deferred.resolveWith(null, args);
      });
    }
    return deferred.promise();
  };

  memoed.save = function() {
    localStorage.setItem(localStorageKey, JSON.stringify(cache));
  };

  memoed.clear = function() {
    cache = {};
    memoed.save();
  };

  memoed.dump = function() {
    return cache;
  };

  memoed.load = function(savedCache) {
    _.extend(cache, savedCache);
    memoed.save();
  };

  return memoed;
};

module.exports = localStorageMemoize;
