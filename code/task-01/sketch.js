const canvasWidth = 400,
      canvasHeight = 400,
      gridCells = 18,
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

  for (w = 1; w < gridCells; w++) {
    for (h = 1; h < gridCells; h++) {
      push();

      translate(
        canvasWidth  / gridCells * w + random(-gridDeviation, gridDeviation),
        canvasHeight / gridCells * h + random(-gridDeviation, gridDeviation)
      );
      circle(0, 0, gridPointSize);

      pop();
    }
  }

  for (o = 1; o <= objectCount; o++) {    
    push();

    translate(
      canvasWidth  / (objectCount + 1) * o,
      canvasHeight / (objectCount + 1) * o
    );
    rotate(floor(random(8)) * 45);

    for (r = 4; r >= 0; r--) {
      fill(random(360), random(200), random(200));
      circle(0, 0, ringWidth * r * 2 + ringWidth);
    }

    for (r = 2; r >= 0; r--) {
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
