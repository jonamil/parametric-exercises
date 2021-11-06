const canvasWidth = 400,
      canvasHeight = 400,
      circleRadius = 150,
      decelerationFactor = 20000;

let lineCount,
    lineWeight,
    vertexCount,
    backgroundColor,
    lineColors;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  angleMode(DEGREES);
  colorMode(HSB);
  noFill();

  randomizeParameters();
  setInterval(randomizeParameters, 5000);
}

function draw() {
  background(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  strokeWeight(lineWeight);

  for (let l = 0; l < lineCount; l++) {
    stroke(lineColors[l][0], lineColors[l][1], lineColors[l][2]);

    beginShape();

    for (let v = 0; v < vertexCount; v++) {
      let angle = noise(
        l / lineCount * 256 + millis() / decelerationFactor,
        v / (vertexCount * 2 - 2) * 256
      ) * 720;

      let radius = circleRadius;
      let outer = true;

      if (v > 0 && v < vertexCount - 1) {
        radius = noise(
          l / lineCount * 256 + millis() / decelerationFactor,
          (vertexCount - 1 + v) / (vertexCount * 2 - 2) * 256
        ) * circleRadius * 1.15;
        outer = false;
      }

      addVertex(angle, radius, outer);
    }

    endShape();
  }
}

function addVertex(angle, radius, outer) {
  let vertices = outer ? 2 : 1;
  for (let v = 0; v < vertices; v++) {
    curveVertex(
      width  / 2 + radius * cos(angle),
      height / 2 + radius * sin(angle)
    );
  }
}

function randomizeParameters() {
  lineCount = 5 + pow(3, floor(random(1, 5)));
  lineWeight = 10 + floor(random(9));
  vertexCount = floor(random(4, 7));

  backgroundColor = [random(360), 30, 30];
  lineColors = [];
  for (let l = 0; l < lineCount; l++) {
    lineColors[l] = [random(360), random(30, 70), random(70, 100)];
  }
}
