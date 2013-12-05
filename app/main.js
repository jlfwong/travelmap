var data = require("data");
var aggregate = require("aggregate");
var uniqueCounter = require("lib/unique_counter");

var COLORS = [
  d3.rgb(0, 150, 0),
  d3.rgb(150, 0, 0),
  d3.rgb(0, 0, 150),
  d3.rgb(150, 150, 0)
];

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

    aggregate(data).then(function(processed) {
      var nameCounter = uniqueCounter();
      var arc = d3.svg.arc().innerRadius(0);

      _.forOwn(processed.pairsByPerson, function(pairs, name) {
          svg.selectAll(".travelpath." + name)
            .data(pairs)
            .enter()
            .append("path")
            .attr("class", "travelpath " + name)
            .attr("stroke-opacity", 0.25)
            .attr("stroke", COLORS[nameCounter(name)])
            .attr("fill-opacity", 0)
            .attr("d", function(pair) {
              var c1 = projection([pair[0].lon, pair[0].lat]);
              var c2 = projection([pair[1].lon, pair[1].lat]);
              // TODO(jlfwong): The rx and ry arguments should be scaled
              // relative to width/height
              return (
                "M" + c1[0] + "," + c1[1] +
                " A800,800 0 0,1 " + c2[0] + "," + c2[1]
              );
            });
      });

      svg.selectAll(".place")
        .data(_.sortBy(processed.placesPerPerson, "totalCount"))
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
            var sliceAngle = 2 * Math.PI / d.names.length;
            return arc({
              outerRadius: 1 + 2 * Math.log(1 + d.totalCount),
              startAngle: d.nameIndex * sliceAngle,
              endAngle: (d.nameIndex + 1) * sliceAngle
            });
          }
        })
        .on("mouseover", function(d) {
          tooltip.text(d.placeRaw + " (" + d.names.join(", ") + ")");
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
