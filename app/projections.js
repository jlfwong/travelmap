var mercatorProj = function(width, lonLatBounds) {
  var projection = d3.geo.mercator()
      .scale((width + 1) / 2 / Math.PI)
      .translate([0, 0])
      .precision(0.1);

  var bounds = [
    projection(lonLatBounds[0]),
    projection(lonLatBounds[1])
  ];

  console.log(JSON.stringify(bounds));

  var boundWidth = bounds[1][0] - bounds[0][0];
  var boundHeight = bounds[1][1] - bounds[0][1];

  var height = width * (boundHeight / boundWidth);

  projection
    .translate([-bounds[0][0], -bounds[0][1]])
    .clipExtent([[0, 0], [width, height]])
    .rotate([-10, 0, 0]);

  projection.width = width;
  projection.height = height;

  return projection;
};

exports.world = function(width) {
  return mercatorProj(width, [
    [-180, 85],
    [180, -65]
  ]);
};
