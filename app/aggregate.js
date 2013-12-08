var localStorageMemoize = require("lib/localstorage_memoize");
var geocode = require("lib/geocode");

var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);
var cachedReverseGeocode = localStorageMemoize.promise("reverseGeocoder", geocode.reverse);

module.exports = function(rawData) {
  var data = [];
  var nameNum = 0;

  _.forOwn(rawData, function(placesForPerson, name) {
    _.each(_.flatten(placesForPerson), function(placeRaw) {
      data.push({
        name: name,
        placeRaw: placeRaw,
        promise: cachedGeocode(placeRaw)
      });
    });
  });

  var slim2Promise = $.get("slim-2.json");

  return $.when.apply($.when, _.pluck(data, 'promise'))
    .then(function() {
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
      var reverseResults = Array.prototype.slice.apply(arguments);

      _.each(reverseResults, function(result, index) {
        _.extend(data[index], {
          humanized: result.display_name,
          country: result.address.country,
          countryCode: result.address.country_code
        });
      });
    })
    .then(function() {
      return slim2Promise;
    })
    .then(function(slim2) {
      var alpha2ToId = _.reduce(slim2, function(result, d) {
        result[d['alpha-2'].toLowerCase()] = parseInt(d['country-code'], 10);
        return result;
      }, {});

      var places = _.values(_.reduce(data, function(result, d) {
        var key = d.humanized;
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

      var placesPerPerson = _.reduce(places, function(result, place) {
        return result.concat(_.map(place.names, function(name, index) {
          return {
            name: name,
            nameIndex: index,
            names: place.names,
            lat: place.lat,
            lon: place.lon,
            humanized: place.humanized,
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

      var placesByPerson = _.groupBy(data, 'name');
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
