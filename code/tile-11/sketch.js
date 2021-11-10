const canvasWidth = 400,
      gridCellCount = 8,
      squareWidth = canvasWidth / gridCellCount,
      sequenceInterval = 2,
      frameDeviationRange = 50,
      positionAcceleration = 0.5,
      rotationAcceleration = 0.75,
      cycleLength = 220;

function setup() {
  createCanvas(canvasWidth, canvasWidth);
  angleMode(DEGREES);
  rectMode(CENTER);
  colorMode(HSB);
  noStroke();
}

function draw() {
  if (frameCount % cycleLength === 0) {
    noiseSeed(floor(random(999999)));
  }

  background(20);

  let index = 0;

  for (let row = gridCellCount - 1; row >= 0; row--) {
    for (let col = gridCellCount - 1; col >= 0; col--) {
      const x = squareWidth * col,
            y = squareWidth * row;

      const offset = Math.abs(Math.min(
        frameDeviationRange / 2
          + index * sequenceInterval
          - frameCount % cycleLength
          + (frameDeviationRange / 2 - noise(index, 0) * frameDeviationRange),
        0
      ));

      push();

      translate(
        x + squareWidth / 2,
        y + squareWidth / 2 + pow(offset, 2) * positionAcceleration
      );
      rotate(
        (0.5 - noise(index, 64)) * pow(offset, 2) * rotationAcceleration
      );
      fill(50 + noise(index, 128) * 50);
      square(0, 0, squareWidth);

      pop();

      index++;
    }
  }

  // Stop at approx. 3/5 progress for saving image
  // if (frameCount >= 130) noLoop();
}

function keyTyped() {
  if (key === 's') save();
}
