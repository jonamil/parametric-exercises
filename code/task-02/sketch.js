const canvasWidth = 400,
      canvasHeight = 400,
      gridCellCount = 9;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  noFill();
  noLoop();

  setInterval(redraw, 2000);
}

function draw() {
  background(255);

  for (let col = 1; col < gridCellCount; col++) {
    for (let row = 1; row < gridCellCount; row++) {
      const x = width  / gridCellCount * col,
            y = height / gridCellCount * row;

      const centerProximity = Math.min(
        (width  / 2 - Math.abs(x - width  / 2)) / (width  / 2),
        (height / 2 - Math.abs(y - height / 2)) / (height / 2)
      );

      const gridDeviation = centerProximity * 6,
            circleSize = centerProximity * 10,
            circleStroke = 2.5 + centerProximity * 6,
            circleDeviation = 0.15;

      strokeWeight(circleStroke + random(-circleStroke, circleStroke) * circleDeviation);
      ellipse(
        x + random(-gridDeviation, gridDeviation),
        y + random(-gridDeviation, gridDeviation),
        circleSize + random(-circleSize, circleSize) * circleDeviation,
        circleSize + random(-circleSize, circleSize) * circleDeviation
      );
    }
  }
}
