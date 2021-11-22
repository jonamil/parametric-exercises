const canvasWidth = 400,
      canvasHeight = 400;

var horizontalOffset = 16,
    horizontalOffsetFirst = 200,
    verticalOffset = 46,
    waveCount = 44,
    startOffset = 0,
    densityModifier = 3.3,
    intensityModifier = 0.85,
    collisionBuffer = 4,
    outlineWeight = 2,
    topColor = '#000000',
    bottomColor = '#ff0000',
    svgMode = false,
    defaultValues;

let gui,
    waves,
    coords,
    clickState,
    shapeOpen = false;

if (window.location.href.includes('?svg')) {
  svgMode = true;
}

function setup() {
  createCanvas(canvasWidth, canvasHeight, svgMode ? SVG : undefined);

  gui = createGui();

  sliderRange(0, width / 2, 1);
  gui.addGlobals('horizontalOffset');
  sliderRange(0, width / 2, 1);
  gui.addGlobals('horizontalOffsetFirst');
  sliderRange(0, height / 2, 1);
  gui.addGlobals('verticalOffset');
  gui.prototype.addRange('waveCount', 1, 64, waveCount, 1, randomizeWaves);
  gui.prototype.addButton('Randomize Waves', randomizeWaves);
  sliderRange(0, 1000, 1);
  gui.addGlobals('startOffset');
  sliderRange(0.2, 6, 0.05);
  gui.addGlobals('densityModifier');
  sliderRange(0, 5, 0.05);
  gui.addGlobals('intensityModifier');
  sliderRange(0, 10, 1);
  gui.addGlobals('collisionBuffer');
  sliderRange(1, 5, 1);
  gui.addGlobals('outlineWeight');
  gui.addGlobals('topColor');
  gui.addGlobals('bottomColor');

  defaultValues = gui.prototype.getValuesAsJSON();
  gui.prototype.addButton('Reset Values', () => { gui.prototype.setValuesFromJSON(defaultValues) });
  gui.prototype.saveInLocalStorage('laserWaves');
  
  gui.prototype.addBoolean('SVG Mode', svgMode, switchRenderMode);
  gui.prototype.addButton('Save ' + (svgMode ? 'SVG' : 'PNG'), () => { save(String(Date.now())) });

  strokeJoin(ROUND);
  noFill();
  noLoop();
  randomizeWaves();
}

function randomizeWaves(newWaveCount = false) {
  if (typeof newWaveCount === 'number') waveCount = newWaveCount;

  noiseSeed(floor(random(999999)));

  waves = [];
  for (let w = 0; w < waveCount; w++) {
    waves.push({
      density: random(35, 80),
      intensity: (0.5 + 0.5 * (w + 1) / waveCount) * 50
    });
  }
}

function draw() {
  clear();
  background(255);
  strokeWeight(outlineWeight);

  coords = [];

  for (let w = 0; w < waves.length; w++) {
    coords[w] = [];

    for (let b = 1; b >= 0; b--) {
      coords[w][b] = [];

      if (b) stroke(bottomColor);
      else stroke(topColor);

      const yBase = (b ?  1 : 0) * height
                  + (b ? -1 : 1) * (verticalOffset + (waves.length - w) * (height / 2 - verticalOffset) / (waves.length + 1))
                  + (b ? -1 : 1) * (height / 2 - verticalOffset) / (waves.length + 1) / 2;

      shapeOpen = true;
      beginShape();

      for (let x = horizontalOffset; x <= width - horizontalOffset; x++) {
        const centerProximity = easeInOutSine(min(0.125 + (width / 2 - abs(x - width / 2)) / (width / 2), 1));
        const y = yBase + (b ? 1 : -1) * (centerProximity * noise((x + startOffset) / waves[w].density * densityModifier, w / waves.length * 256) * waves[w].intensity * intensityModifier);

        let collision = false;

        for (let wo = 0; wo < coords.length - 1; wo++) {
          if (b) {
            if (y - collisionBuffer <= coords[wo][b][x]) collision = true;
          } else {
            if (y + collisionBuffer >= coords[wo][b][x]) collision = true;
          }
        }

        if (!collision && !(w === 0 && (x < horizontalOffset + horizontalOffsetFirst || x > width - horizontalOffset - horizontalOffsetFirst))) {
          if (!shapeOpen) {
            shapeOpen = true;
            beginShape();
          }
          vertex(x, y);
        } else {
          if (shapeOpen) {
            shapeOpen = false;
            endShape();
          }
        }

        coords[w][b][x] = y;
      }

      if (shapeOpen) endShape();
    }
  }
}

// Easing function from https://easings.net/#easeInOutSine
function easeInOutSine(x) {
  return -(cos(PI * x) - 1) / 2;
}

function switchRenderMode() {
  if (svgMode) window.location.href = window.location.href.split('?')[0];
  else window.location.href += '?svg';
}

function mousePressed(event) {
  if (!gui.prototype._panel.contains(event.target)) {
    clickState = {
      mouseX,
      mouseY,
      densityModifier,
      intensityModifier
    }
  }
}

function mouseDragged() {
  if (clickState) {
    gui.prototype.setValue('densityModifier', min(max(clickState.densityModifier + (clickState.mouseX - mouseX) * 0.025, 0.2), 6));
    gui.prototype.setValue('intensityModifier', min(max(clickState.intensityModifier + (clickState.mouseY - mouseY) * 0.025, 0), 5));
  }
}

function mouseReleased() {
  clickState = false;
}
