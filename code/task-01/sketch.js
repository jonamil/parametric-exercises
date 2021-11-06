const canvasWidth = 400,
      canvasHeight = 400,
      gridCellCount = 18,
      gridDeviation = 3,
      gridPointSize = 2,
      objectCount = 2,
      ringWidth = 22.5;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();
  noLoop();
}

function draw() {
  background(random(360), 30, 30);
  fill(100);

  for (let w = 1; w < gridCellCount; w++) {
    for (let h = 1; h < gridCellCount; h++) {
      push();

      translate(
        width  / gridCellCount * w + random(-gridDeviation, gridDeviation),
        height / gridCellCount * h + random(-gridDeviation, gridDeviation)
      );
      circle(0, 0, gridPointSize);

      pop();
    }
  }

  for (let o = 1; o <= objectCount; o++) {
    push();

    translate(
      width  / (objectCount + 1) * o,
      height / (objectCount + 1) * o
    );
    rotate(floor(random(8)) * 45);

    for (let r = 4; r >= 0; r--) {
      fill(random(360), random(200), random(200));
      circle(0, 0, ringWidth * r * 2 + ringWidth);
    }

    for (let r = 2; r >= 0; r--) {
      fill(random(360), random(200), random(200));
      arc(
        0,
        0,
        ringWidth * r * 4 + ringWidth,
        ringWidth * r * 4 + ringWidth,
        0,
        180
      );
    }

    pop();
  }
}

function mousePressed() {
  redraw();
}

function keyTyped() {
  if (key === 's') save();
}
