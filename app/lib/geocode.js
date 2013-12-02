module.exports = function geocode(q) {
  return $.ajax("http://nominatim.openstreetmap.org/search/", {
    data: {
      q: q,
      format: "json"
    }
  }).then(function(data) {
    return {
      lat: parseFloat(data[0].lat, 10),
      lon: parseFloat(data[0].lon, 10)
    };
  });
};
