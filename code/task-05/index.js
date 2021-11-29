const jscad = require('@jscad/modeling');
const { circle } = jscad.primitives;
const { extrudeRotate } = jscad.extrusions;
const { subtract } = jscad.booleans;
const { translate, rotate } = jscad.transforms;

const main = () => {
  const circleRadius = 1,
        circleSegments = 16,
        grooveOffset = 0.275,
        grooveRadius = 0.375,
        grooveCount = 16,
        ringRadius = 7.5,
        ringSegments = 32,
        ringCount = 16,
        rotationSteps = 8,
        chainRadius = 13.5;

  const circleShape = circle({
    radius: circleRadius,
    segments: circleSegments
  });

  const grooveShape = circle({
    center: [circleRadius + grooveOffset, 0, 0],
    radius: grooveRadius,
    segments: circleSegments
  });

  const grooves = [];

  for (let g = 0; g < grooveCount; g++) {
    grooves.push(
      rotate(
        [0, 0, g * Math.PI * 2 / grooveCount],
        grooveShape
      )
    );
  }

  const cogShape = subtract(circleShape, grooves);

  const ringObject = extrudeRotate(
    { segments: ringSegments },
    translate(
      [ringRadius, 0, 0],
      cogShape
    )
  );

  const rings = [];

  for (let r = 0; r < ringCount; r++) {
    rings.push(
      rotate(
        [0, 0, r * Math.PI * 2 / ringCount],
        translate(
          [0, chainRadius, 0],
          rotate(
            [r * Math.PI / rotationSteps, 0, 0],
            ringObject
          )
        )
      )
    );
  }

  return rings;
};

module.exports = { main };
