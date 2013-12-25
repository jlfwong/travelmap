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
  $(function() {
    var width = $(window).width() * 0.9;

    var world50mPromise = $.getJSON("world-50m.json").then(_.identity);

    $.when(aggregate(data), world50mPromise).then(function(processed, world) {
      render.makeBars(processed.visitedByAtLeastN);
      render.makeToggles(_.keys(data));

      d3.select(".outer-container")
        .append("div")
        .attr("class", "container")
        .style("width", width + "px");

      d3.select(".container").append("h2").text("United Kingdom");
      makeMap(".container", projections.uk(width * 0.5), processed, world);
      d3.select(".container").append("h2").text("Europe");
      makeMap(".container", projections.europe(width), processed, world);
      d3.select(".container").append("h2").text("North America");
      makeMap(".container", projections.northAmerica(width), processed, world);
      d3.select(".container").append("h2").text("World");
      makeMap(".container", projections.world(width), processed, world);
    });
  });
};
