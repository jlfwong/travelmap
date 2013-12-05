module.exports = function() {
  var cache = {};
  var counter = 0;
  return function(val) {
    if (!cache.hasOwnProperty(val)) {
      cache[val] = counter++;
    }
    return cache[val];
  };
};
