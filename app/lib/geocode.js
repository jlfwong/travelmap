module.exports = function geocode(q) {
  return $.ajax("http://nominatim.openstreetmap.org/search/", {
    data: {
      q: q,
      format: "json"
    }
  }).then(function(data) {
    if (!data || !data[0]) {
      console.error(data);
      throw new Error("Geocoding '" + q + "' failed.");
    }
    return {
      lat: parseFloat(data[0].lat, 10),
      lon: parseFloat(data[0].lon, 10)
    };
  });
};
