var data = require("data");
var aggregate = require("aggregate");
var render = require("render");

module.exports = function() {
  // TODO(jlfwong): This crops part of the map
  var width = $(window).width(),
      height = 960;

  var projection = d3.geo.mercator()
      .scale((width + 1) / 2 / Math.PI)
      .translate([width / 2, height / 2])
      .precision(0.1);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var world50mPromise = $.get("world-50m.json").then(_.identity);
  $.when(aggregate(data), world50mPromise).then(function(processed, world) {
    render({
      svg: svg,
      projection: projection,
      world: world,
      processed: processed,
      width: width,
      height: height
    });
  });

  d3.select(self.frameElement).style("height", height + "px");
};
