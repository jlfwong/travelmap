var geocode = require("lib/geocode");
var localStorageMemoize = require("lib/localstorage_memoize");

module.exports = function() {
  // TODO(jlfwong): This crops part of the map
  var width = $(window).width(),
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
      "Toronto, Canada",
      "San Francisco, California",
      "San Jose, California",
      "San Francisco, California",
      "Ottawa, Canada"
    ];

    var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);

    var cityCodesPromise = $.when.apply($.when, _.map(cities, function(city) {
      return cachedGeocode(city);
    }));

    cityCodesPromise.then(function() {
      var cityCoords = Array.prototype.slice.apply(arguments);

      var counts = _.countBy(cityCoords, function(x) {
        return JSON.stringify(x);
      });

      console.log(counts);

      svg.selectAll(".city")
          .data(cityCoords)
          .enter()
          .append("circle")
          .attr("class", "city")
          .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0];
          })
          .attr("cy", function(d) {
            return projection([d.lon, d.lat])[1];
          })
          .attr("r", function(d) {
            return 2 * (1 + counts[JSON.stringify(d)]);
          });

      var pairs = _(cityCoords)
        .zip([null].concat(cityCoords))
        .filter(function(x) { return x[0] && x[1]; })
        .value();

      svg.selectAll(".travelpath")
        .data(pairs)
        .enter()
        .append("path")
        .attr("class", "travelpath")
        .attr("d", function(pair) {
          var c1 = projection([pair[0].lon, pair[0].lat]);
          var c2 = projection([pair[1].lon, pair[1].lat]);
          // TODO(jlfwong): The rx and ry arguments should be scaled relative to
          // width/height
          return (
            "M" + c1[0] + "," + c1[1] +
            " A400,400 0 0,1 " + c2[0] + "," + c2[1]
          );
          // return "M" + c1[0] + "," + c1[1] + " L" + c2[0] + "," + c2[1];
        });
    });
  });

  d3.select(self.frameElement).style("height", height + "px");
};
