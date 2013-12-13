var data = require("data");
var aggregate = require("aggregate");
var render = require("render");
var projections = require("projections");

var makeMap = function(container, projection, processed, world) {
  var svg = d3.select(container)
    .append("svg")
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

  var world50mPromise = $.get("world-50m.json").then(_.identity);

  render.makeToggles(_.keys(data));

  $.when(aggregate(data), world50mPromise).then(function(processed, world) {
    d3.select("body")
      .append("div")
      .attr("class", "container")
      .style("width", width + "px");

    makeMap(".container", projections.world(width), processed, world);
    makeMap(".container", projections.northAmerica(width), processed, world);
    makeMap(".container", projections.europe(width), processed, world);
    makeMap(".container", projections.uk(width), processed, world);
  });
};
