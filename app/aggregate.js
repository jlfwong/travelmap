var localStorageMemoize = require("lib/localstorage_memoize");
var geocode = require("lib/geocode");

var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);
var cachedReverseGeocode = localStorageMemoize.promise("reverseGeocoder", geocode.reverse);

module.exports = function(rawData) {
  var data = [];
  var nameNum = 0;
  _.forOwn(rawData, function(placesForPerson, name) {
    _.each(placesForPerson, function(place) {
      data.push({
        name: name,
        place: place,
        promise: cachedGeocode(place)
      });
    });
  });

  return $.when.apply($.when, _.pluck(data, 'promise'))
    .then(function() {
      var geocodeResults = Array.prototype.slice.apply(arguments);
      _(geocodeResults).each(function(result, index) {
        data[index].lat = result.lat;
        data[index].lon = result.lon;
        data[index].reversePromise = cachedReverseGeocode(result);
      });

      return $.when.apply($.when, _.pluck(data, 'reversePromise'));
    })
    .then(function() {
      var reverseResults = Array.prototype.slice.apply(arguments);

      _.each(reverseResults, function(result, index) {
        data[index].humanized = result;
      });

      return _.values(_.reduce(data, function(result, d) {
        var key = d.humanized;
        var place;
        if (!(place = result[key])) {
          place = result[key] = {
            lat: d.lat,
            lon: d.lon,
            humanized: d.humanized,
            city: d.city,
            country: d.country,
            count: 0,
            names: []
          };
        }
        place.count++;
        place.names = _.uniq([d.name].concat(place.names));
        return result;
      }, {}));
    });
};
