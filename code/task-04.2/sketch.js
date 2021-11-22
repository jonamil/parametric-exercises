const canvasWidth = 500,
      canvasHeight = 500,
      circleRadius = canvasWidth * 0.425,
      flowerCount = 4,
      repeatCount = 5,
      rotationCount = 1,
      vertexCount = 100,
      angleRange = 20,
      radiusRange = 15,
      grainEnabled = true,
      grainSize = 0.5;

let flowers, grain;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(2);
  angleMode(DEGREES);
  noStroke();

  flowers = createGraphics(canvasWidth, canvasHeight, WEBGL);
  flowers.pixelDensity(8);
  flowers.noStroke();

  grain = createGraphics(canvasWidth, canvasHeight);
  grain.pixelDensity(2);
  grain.noStroke();

  if (grainEnabled) {
    for (let x = 0; x < width; x += grainSize) {
      for (let y = 0; y < height; y += grainSize) {
        if (random() < 0.05) grain.fill(0, random(150, 200));
        else grain.fill(0, random(40));
        
        grain.square(x, y, grainSize);
      }
    }
  }
  
  noLoop();
}

function draw() {
  flowers.clear();

  for (let r = 0; r < repeatCount; r++) {
    for (let f = 0; f < flowerCount; f++) {
      flowers.rotate(random(360));
      flowers.beginShape();

      if (f === flowerCount - 1) flowers.fill(120);
      else flowers.fill(0);

      addFlowerVertex(0, 0);

      flowers.fill(255);

      for (let v = 0; v <= vertexCount; v++) {
        addFlowerVertex(
          v / vertexCount * rotationCount * 360 + random(-angleRange, angleRange),
          (1 - f / flowerCount) * circleRadius + random(-radiusRange, radiusRange)
        );
      }

      flowers.endShape(CLOSE);
    }
  }

  background(200);

  for (let i = 0; i < 5; i++) {
    if (i === 1) blendMode(MULTIPLY);
    image(flowers, 0, 0);
  }

  blendMode(BLEND);

  image(grain, 0, 0);

  fill(255);
  circle(width / 2, height / 2, width * 0.006);

  filter(DILATE);
}

function addFlowerVertex(angle, radius) {
  flowers.vertex(
    radius * cos(angle),
    radius * sin(angle)
  );
}

function mousePressed() {
  redraw();
}

function keyTyped() {
  if (key === 's') save();
}
