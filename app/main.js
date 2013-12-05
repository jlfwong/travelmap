var data = require("data");
var aggregate = require("aggregate");
var uniqueCounter = require("lib/unique_counter");

var COLORS = [
  d3.rgb(0, 150, 0),
  d3.rgb(150, 0, 0),
  d3.rgb(0, 0, 150),
  d3.rgb(150, 150, 0)
];

var renderPath = function(svg, projection, cities, name, color) {
  console.log('Loading data for', name);

  var cityCodesPromise = $.when.apply($.when, _.map(cities, function(city) {
    return cachedGeocode(city);
  }));

  cityCodesPromise.then(function() {
    var cityCoords = Array.prototype.slice.apply(arguments);

    console.log('Rendering', name, cityCoords.length);

    var counts = _.countBy(cityCoords, function(x) {
      return JSON.stringify(x);
    });

    svg.selectAll(".city." + name)
      .data(_.uniq(cityCoords))
      .enter()
      .append("circle")
      .attr("fill", color)
      .attr("fill-opacity", 0.75)
      .attr("class", "city " + name)
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

    svg.selectAll(".travelpath." + name)
      .data(pairs)
      .enter()
      .append("path")
      .attr("class", "travelpath " + name)
      .attr("stroke-opacity", 0.25)
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

    var tooltip = d3.select("body")
      .append("div")
      .style({
        "position": "absolute",
        "z-index": "10",
        "background": "rgba(20, 20, 20, 0.5)",
        "color": "rgba(150, 150, 150, 0.5)",
        "border-radius": "5px",
        "padding": "2px",
        "display": "none"
      });

    aggregate(data).then(function(places) {
      var placePerPerson = _.reduce(places, function(result, place) {
        return result.concat(_.map(place.names, function(name, index) {
          return _.extend({
            name: name,
            nameCount: place.names.length,
            nameIndex: index,
          }, place);
        }));
      }, []);

      var nameCounter = uniqueCounter();
      var arc = d3.svg.arc().innerRadius(0);

      svg.selectAll(".place")
        .data(placePerPerson)
        .enter()
        .append("path")
        .attr({
          "fill": function(d) {
            return COLORS[nameCounter(d.name)];
          },
          "fill-opacity": 0.75,
          "transform": function(d) {
            var proj = projection([d.lon, d.lat]);
            return "translate(" + proj[0] + "," + proj[1] + ")";
          },
          "d": function(d) {
            var sliceAngle = 2 * Math.PI / d.nameCount;
            return arc({
              outerRadius: 2 + 2 * Math.log(1 + d.count),
              startAngle: d.nameIndex * sliceAngle,
              endAngle: (d.nameIndex + 1) * sliceAngle
            });
          }
        })
        .on("mouseover", function(d) {
          tooltip.text(d.humanized + " (" + d.names.join(", ") + ")");
          tooltip.style("display", "block");
        })
        .on("mousemove", function() {
          tooltip.style({
            "top":  (event.pageY - 10) + "px",
            "left": (event.pageX + 10) + "px"
          });
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });
    });
  });

  d3.select(self.frameElement).style("height", height + "px");
};
