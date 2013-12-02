module.exports = function localStorageMemoize(cachekeyPrefix, fn) {
  return function() {
    var args = Array.prototype.slice.apply(arguments);
    var key = cachekeyPrefix + "_" + JSON.stringify(args);
    var ret;
    if (!(ret = JSON.parse(localStorage.getItem(key)))) {
      ret = fn.apply(this, args);
      localStorage.setItem(key, ret);
    }
    return ret;
  };
};
