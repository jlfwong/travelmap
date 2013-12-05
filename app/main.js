var geocode = require("lib/geocode");
var localStorageMemoize = require("lib/localstorage_memoize");
var data = require("data");

var cachedGeocode = localStorageMemoize.promise("geocoder", geocode);

var COLORS = [
  d3.rgb(0, 150, 0),
  d3.rgb(150, 0, 0)
];

var renderPath = function(svg, projection, cities, name, color) {
  var cityCodesPromise = $.when.apply($.when, _.map(cities, function(city) {
    return cachedGeocode(city);
  }));


  cityCodesPromise.then(function() {
    var cityCoords = Array.prototype.slice.apply(arguments);

    var counts = _.countBy(cityCoords, function(x) {
      return JSON.stringify(x);
    });

    svg.selectAll(".city")
      .data(_.uniq(cityCoords))
      .enter()
      .append("circle")
      .attr("fill", color)
      .attr("fill-opacity", 0.75)
      .attr("class", "city")
      .attr("cx", function(d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projection([d.lon, d.lat])[1];
      })
      .attr("r", function(d) {
        return 2 + 2 * Math.log(1 + counts[JSON.stringify(d)]);
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
      .attr("stroke", color)
      .attr("fill-opacity", 0)
      .attr("d", function(pair) {
        var c1 = projection([pair[0].lon, pair[0].lat]);
        var c2 = projection([pair[1].lon, pair[1].lat]);
        // TODO(jlfwong): The rx and ry arguments should be scaled relative to
        // width/height
        return (
          "M" + c1[0] + "," + c1[1] +
          " A800,800 0 0,1 " + c2[0] + "," + c2[1]
        );
      });
  });
};

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

    var i = 0;
    _(data).forIn(function(cities, name) {
      renderPath(svg, projection, cities, name, COLORS[i++]);
    });
  });

  d3.select(self.frameElement).style("height", height + "px");
};
