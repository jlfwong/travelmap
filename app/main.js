var data = require("data");
var aggregate = require("aggregate");
var render = require("render");
var projections = require("projections");

var makeMap = function(projection, name, processed, world) {
  var svg = d3.select("body")
    .append("svg")
    .attr("class", name)
    .attr("width", projection.width)
    .attr("height", projection.height);

  render({
    svg: svg,
    projection: projection,
    world: world,
    processed: processed,
    width: projection.width,
    height: projection.height
  });

  return svg;
};

module.exports = function() {
  var width = $(window).width() * 0.9;

  var worldProjection = projections.world(width);

  var world50mPromise = $.get("world-50m.json").then(_.identity);
  $.when(aggregate(data), world50mPromise).then(function(processed, world) {
    makeMap(projections.world(width), "world", processed, world);
  });

  d3.select(self.frameElement).style("height", worldProjection.height + "px");
};
