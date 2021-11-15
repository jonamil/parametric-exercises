const canvasWidth = 400,
      canvasHeight = 400,
      edgeOffset = 64,
      waveCount = 16,
      outlineWeight = 2,
      cycleDuration = 7500;

let backgroundColor,
    waves,
    interval,
    clickState,
    densityModifier = 1,
    intensityModifier = 1;

function randomizeParameters() {
  backgroundColor = [random(200, 280), 30, 30];
  waves = [];

  for (let w = 0; w < waveCount; w++) {
    waves.push({
      color: [random(360), random(40, 55), random(90, 100)],
      speed: random([-1, 1]) * (110 + pow(random(), 2) * 1000),
      density: random(35, 80),
      intensity: (0.75 + 0.25 * (1 - (w + 1) / waveCount)) * 80
    });
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  colorMode(HSB);
  strokeWeight(outlineWeight);
  strokeJoin(ROUND);

  randomizeParameters();
  interval = setInterval(randomizeParameters, cycleDuration);
}

function draw() {
  background(backgroundColor);

  for (let w = 0; w < waveCount; w++) {
    for (let b = 0; b < 2; b++) {
      const yBase = (b ? 1 : 0) * height + (b ? -1 : 1) * (edgeOffset + (w + 1) * (height / 2 - edgeOffset) / (waveCount + 1));

      for (let s = 0; s <= b; s++) {
        if (b && s) {
          // Bottom section, second layer
          fill(waves[w].color.concat([0.15]));
          stroke(waves[w].color);
        } else if (b) {
          // Bottom section, first layer
          fill(backgroundColor);
          noStroke();
        } else {
          // Top section, single layer
          fill(waves[w].color);
          stroke(backgroundColor);
        }

        beginShape();
        vertex(-outlineWeight, height / 2);

        for (let x = -outlineWeight; x <= width + outlineWeight; x++) {
          const centerProximity = easeInOutSine(min(0.125 + (width / 2 - abs(x - width / 2)) / (width / 2), 1));
          const y = yBase + (b ? 1 : -1) * (centerProximity * noise(x / waves[w].density * densityModifier + frameCount / waves[w].speed, w / waveCount * 256) * waves[w].intensity * intensityModifier);

          vertex(x, y);
        }

        vertex(width + outlineWeight, height / 2);
        endShape();
      }
    }
  }
}

// Easing function from https://easings.net/#easeInOutSine
function easeInOutSine(x) {
  return -(cos(PI * x) - 1) / 2;
}

function mousePressed() {
  clickState = {
    mouseX,
    mouseY,
    densityModifier,
    intensityModifier
  }
  clearInterval(interval);
}

function mouseDragged() {
  densityModifier = min(max(clickState.densityModifier + (clickState.mouseX - mouseX) * 0.025, 0.2), 6);
  intensityModifier = min(max(clickState.intensityModifier + (clickState.mouseY - mouseY) * 0.025, 0), 5);
}

function mouseReleased() {
  interval = setInterval(randomizeParameters, cycleDuration);
}
