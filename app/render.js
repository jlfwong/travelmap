var uniqueCounter = require("lib/unique_counter");

var COLORS = [
  d3.rgb(150, 0, 0),
  d3.rgb(0, 150, 0),
  d3.rgb(0, 0, 240),
  d3.rgb(150, 150, 0),
  d3.rgb(150, 0, 150),
  d3.rgb(0, 150, 150)
];

module.exports = function(opts) {
  var svg = opts.svg;
  var projection = opts.projection;
  var world = opts.world;
  var processed = opts.processed;
  var width = opts.width;
  var height = opts.height;

  var path = d3.geo.path()
      .projection(projection);

  var nameCounter = uniqueCounter();
  var arc = d3.svg.arc().innerRadius(0);

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

  svg.selectAll(".country")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter()
    .insert("path")
    .attr({
      "class": "country",
      "fill": function(d) {
        var country = processed.countriesById[d.id];
        var count = 0;
        var visited = false;
        if (country) {
          visited = true;
          count = country.count;
        }
        var grey = 10 + 5 * visited + 2 * Math.sqrt(count);
        return d3.rgb(grey, grey, grey);
      },
      "d": path
    });

  svg.insert("path")
    .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
      return a !== b;
    }))
    .attr("class", "boundary")
    .attr("d", path);

  // scale factor
  var sf = Math.pow((projection.scale() / 205) * (projection.width / 1400), 1/3);

  _.forOwn(processed.pairsByPerson, function(pairs, name) {
      svg.selectAll(".travelpath." + name)
        .data(pairs)
        .enter()
        .append("path")
        .attr("class", "travelpath " + name)
        .attr("stroke-width", (1 * sf) + 'px')
        .attr("stroke-opacity", 0.25)
        .attr("stroke", COLORS[nameCounter(name)])
        .attr("fill-opacity", 0)
        .attr("d", function(pair) {
          var c1 = projection([pair[0].lon, pair[0].lat]);
          var c2 = projection([pair[1].lon, pair[1].lat]);

          if (!c1 || !c2) {
            return null;
          }

          if ((c1[0] < 0 || c1[0] > projection.width ||
               c1[1] < 0 || c1[1] > projection.height) ||
              (c2[0] < 0 || c2[0] > projection.width ||
               c2[1] < 0 || c2[1] > projection.height)) return null;

          // TODO(jlfwong): Increase jitter for shorter distances
          var radius = (width / 2) * (1 + 0.2 * Math.random());
          return (
            "M" + c1[0] + "," + c1[1] +
            " A" + radius + "," + radius +
            " 0 0,0 " + c2[0] + "," + c2[1]
          );
        });
  });

  var placesPerPerson = _(processed.placesPerPerson)
    .sortBy("totalCount")
    .filter(function(d) { return projection([d.lon, d.lat]); })
    .value();

  svg.selectAll(".place")
    .data(placesPerPerson)
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
          outerRadius: sf * (1 + 2 * Math.log(1 + d.totalCount)),
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
};
