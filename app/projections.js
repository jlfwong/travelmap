var getBounds = function(projection, lonLatBounds) {
  var box = [
    projection(lonLatBounds[0]),
    projection(lonLatBounds[1])
  ];

  return {
    box: box,
    width: box[1][0] - box[0][0],
    height: box[1][1] - box[0][1]
  };
};

var mercatorProj = function(width, lonLatBounds) {
  var projection = d3.geo.mercator()
      .translate([0, 0])
      .precision(0.1);

  var bounds;
  bounds = getBounds(projection, lonLatBounds);

  var height = width * (bounds.height / bounds.width);
  projection.scale(projection.scale() * (height / bounds.height));

  bounds = getBounds(projection, lonLatBounds);

  projection
    .translate([-bounds.box[0][0], -bounds.box[0][1]])
    .clipExtent([[0, 0], [width, height]]);

  projection.width = width;
  projection.height = height;

  return projection;
};

exports.world = function(width) {
  return mercatorProj(width, [
    [-180, 85],
    [180, -65]
  ]).rotate([-10, 0, 0]);
};

exports.northAmerica = function(width) {
  return mercatorProj(width, [
    [-130, 55],
    [-50, 25]
  ]);
};

exports.europe = function(width) {
  return mercatorProj(width, [
    [-30, 61],
    [35, 34]
  ]);
};

exports.uk = function(width) {
  return mercatorProj(width, [
    [-20, 60],
    [3, 50]
  ]);
};
