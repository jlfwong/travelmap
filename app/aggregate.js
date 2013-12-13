var localStorageMemoize = require("lib/localstorage_memoize");
var geocode = require("lib/geocode");

var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);
var cachedReverseGeocode = localStorageMemoize.promise("reverseGeocoder", geocode.reverse);

if (window.location.href.indexOf("localhost") === -1) {
  cachedGeocode.cacheOnly();
  cachedReverseGeocode.cacheOnly();
}

module.exports = function(rawData) {
  var data = [];

  var slim2Promise = $.getJSON("slim-2.json");

  return $.when(
    $.getJSON("geocode_cache.json"),
    $.getJSON("reverse_geocode_cache.json")
  )
  .then(function(geocodeCacheData, reverseGeocodeCacheData) {
    cachedGeocode.load(geocodeCacheData[0]);
    cachedReverseGeocode.load(reverseGeocodeCacheData[0]);

    _.forOwn(rawData, function(placesForPerson, name) {
      _.each(_.flatten(placesForPerson), function(placeRaw) {
        data.push({
          name: name,
          placeRaw: placeRaw,
          promise: cachedGeocode(placeRaw)
        });
      });
    });

    return $.when.apply($.when, _.pluck(data, 'promise'));
  })
  .then(function() {
      // Geocode all the places
      var geocodeResults = Array.prototype.slice.apply(arguments);
      _(geocodeResults).each(function(result, index) {
        _.extend(data[index], {
          lat: result.lat,
          lon: result.lon,
          reversePromise: cachedReverseGeocode(result)
        });
      });

      return $.when.apply($.when, _.pluck(data, 'reversePromise'));
    })
    .then(function() {
      // Reverse geocode all the places based on the long/lat we get back from
      // the geocoder.
      var reverseResults = Array.prototype.slice.apply(arguments);

      _.each(reverseResults, function(result, index) {
        _.extend(data[index], {
          country: result.address.country,
          countryCode: result.address.country_code
        });
      });
    })
    .then(function() {
      return slim2Promise;
    })
    .then(function(slim2) {
      // alpha2Toid is a map from ISO-3166 alpha-2 code to ISO-3166 numeric id
      //
      // https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes
      var alpha2ToId = _.reduce(slim2, function(result, d) {
        result[d['alpha-2'].toLowerCase()] = parseInt(d['country-code'], 10);
        return result;
      }, {});

      // Places is a unique list of all places. Each city should appear exactly
      // once in this list.
      var places = _.values(_.reduce(data, function(result, d) {
        // We deduplicate places based on their lat,lon. This allows "Ottawa",
        // "Ottawa, Canada", and "Ottawa, Ontario, Canada", to all end up being
        // part of the same data point.
        var key = d.lat + "," + d.lon;
        var place;
        if (!(place = result[key])) {
          place = result[key] = _.extend({
            count: 0,
            names: [],
            countByName: {}
          }, d);
        }
        place.count++;
        place.names = _.uniq([d.name].concat(place.names));
        if (!place.countByName[d.name]) {
          place.countByName[d.name] = 0;
        }
        place.countByName[d.name]++;
        return result;
      }, {}));

      // Map from person's name to a list of all the places they've been, not
      // necssarily in order.
      var placesPerPerson = _.reduce(places, function(result, place) {
        return result.concat(_.map(place.names, function(name, index) {
          return {
            name: name,
            nameIndex: index,
            names: place.names,
            lat: place.lat,
            lon: place.lon,
            countryCode: place.countryCode,
            country: place.country,
            // TODO(jlfwong): Rename count to something more helpful, then just
            // use extend
            count: place.countByName[name],
            totalCount: place.count,
            placeRaw: place.placeRaw
          };
        }));
      }, []);

      // List of all the places a person has been in order
      var placesByPerson = _.groupBy(data, 'name');

      // List of pairs of trips taken from place 1 to place 2
      var pairsByPerson = _.reduce(placesByPerson, function(result, places, name) {
        result[name] = _(places)
          .zip([null].concat(places))
          .filter(function(x) { return x[0] && x[1]; })
          .value();

        return result;
      }, {});

      var countriesById = _.reduce(placesPerPerson, function(result, place) {
        var key = alpha2ToId[place.countryCode];
        var country;
        if (!(country = result[key])) {
          result[key] = {
            count: 0,
            name: place.country
          };
        }
        // One point per person per city in the country
        result[key].count++;
        return result;
      }, {});

      return {
        placesPerPerson: placesPerPerson,
        pairsByPerson: pairsByPerson,
        countriesById: countriesById
      };
    });
};

module.exports.logCaches = function() {
  console.log({
    'cachedGeocode': cachedGeocode.dump(),
    'cachedReverseGeocode': cachedReverseGeocode.dump()
  });
};

// Invoke in browser with: require("aggregate").saveCaches()
module.exports.saveCaches = function() {
  var saveToFile = require("lib/save_to_file");
  saveToFile(cachedGeocode.dump(), 'geocode_cache.json');
  saveToFile(cachedReverseGeocode.dump(), 'reverse_geocode_cache.json');
};

// Invoke in browser with: require("aggregate").clearCaches()
module.exports.clearCaches = function() {
  cachedGeocode.clear();
  cachedReverseGeocode.clear();
};
