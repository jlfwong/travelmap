var geocode = module.exports = function (q) {
  return $.ajax("http://nominatim.openstreetmap.org/search/", {
    data: {
      q: q,
      format: "json"
    }
  }).then(function(data) {
    if (!data || !data[0]) {
      throw new Error("Geocoding '" + q + "' failed.");
    }
    return {
      lat: parseFloat(data[0].lat, 10),
      lon: parseFloat(data[0].lon, 10)
    };
  });
};

geocode.reverse = function(args) {
  return $.ajax("http://nominatim.openstreetmap.org/reverse", {
    data: {
      lat: args.lat,
      lon: args.lon,
      zoom: 8,
      format: "json",
      addressdetails: 1
    }
  }).then(function(data) {
    if (!data) {
      throw new Error("Reverse Geocoding '" + args + "' failed.");
    }
    return data.display_name;
  });
};
