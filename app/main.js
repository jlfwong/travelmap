var geocode = require("lib/geocode");
var localStorageMemoize = require("lib/localstorage_memoize");

module.exports = function() {
  var width = 960,
      height = 960;

  var projection = d3.geo.mercator()
      .scale((width + 1) / 2 / Math.PI)
      .translate([width / 2, height / 2])
      .precision(0.1);

  var path = d3.geo.path()
      .projection(projection);

  var graticule = d3.geo.graticule();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  d3.json("world-50m.json", function(error, world) {
    svg.insert("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.insert("path")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);

    var cities = [
      "Ottawa, Canada",
      "Toronto, Canada",
      "Rome, Italy",
      "Florence, Italy",
      "La Spezia, Italy",
      "Venice, Italy",
      "Copenhagen, Denmark",
      "Amsterdam, Holland",
      "London, England",
      "Lyon, France",
      "Paris, France",
      "Toulouse, France",
      "Barcelona, Spain",
      "Granada, Spain",
      "Madrid, Spain",
      "Dublin, Ireland",
      "Edinburgh, Scotland",
      "London, England",
      "Oslo, Norway",
      "Brussels, Belgium",
      "Berlin, Germany",
      "Toronto, Canada",
      "Waterloo, Canada",
      "San Jose, California",
      "San Francisco, California"
    ];

    var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);

    var cityCodesPromise = $.when.apply($.when, _.map(cities, function(city) {
      return cachedGeocode(city);
    }));

    cityCodesPromise.then(function() {
      var cityCoords = Array.prototype.slice.apply(arguments);

      svg.selectAll("circle")
          .data(cityCoords)
          .enter()
          .append("circle")
          .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0];
          })
          .attr("cy", function(d) {
            return projection([d.lon, d.lat])[1];
          })
          .attr("r", 2)
          .style("fill", "#00ff00")
          .style("opacity", 0.75);
    });
  });

  d3.select(self.frameElement).style("height", height + "px");
};
