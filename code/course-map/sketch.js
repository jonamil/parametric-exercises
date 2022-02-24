/* global SVG, d3, createGui, sliderRange, collidePointCircle, collideCircleCircle */

var courseIndex = 0,
    seedValue = 0,
    circleGrowth = 0.7,
    circleSize = 35,
    circleDistance = 12,
    categoryDistanceX = 290,
    categoryDistanceY = 200,
    showConnections = false,
    showLabels = false,
    holeSize = 14,
    squiggleVerticalStart = 6,
    squiggleVerticalStop = 2,
    squiggleHorizontalStart = 2,
    squiggleHorizontalStop = 2,
    squiggleAmplitudeStart = 0,
    squiggleAmplitudeStop = 2.5,
    squiggleStroke = 2,
    useMask = true,
    showMask = false,
    particleExpansion = 200,
    particleBuffer = 1.25,
    particleSize = 8,
    particleStroke = 2,
    rotationAngle = 0,
    canvasScale = 0.6,
    strokeScale = 1,
    foregroundColor = '#000000',
    backgroundColor = '#f0e7dd',
    svgRenderer = false;

let courses, courseTitles, course,
    gui, defaultValues, clickState,
    particleMask,
    simulation, root, nodes, links,
    simulationRunning = true;

const previousShapes = [];

if (window.location.href.includes('?svg')) {
  svgRenderer = true;
}

function preload() {
  courses = loadJSON('courses.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight, svgRenderer ? SVG : undefined);
  randomSeed(seedValue);

  prepareCourses();
  initializeGui();
  updateCourse();

  angleMode(DEGREES);
  colorMode(HSB);
  rectMode(CENTER);
  imageMode(CENTER);
  strokeCap(SQUARE);
}

function draw() {
  clear();
  randomSeed(seedValue);

  translate(width / 2, height / 2);
  rotate(rotationAngle);
  scale(canvasScale);

  background(backgroundColor);

  if (simulation.alpha() >= simulation.alphaMin()) {
    simulationRunning = true;
    simulation.tick();
  } else {
    simulationRunning = false;
    previousShapes.length = 0;

    if (useMask) {
      particleMask = createGraphics(width * 2, height * 2);
      particleMask.pixelDensity(1);
      particleMask.translate(width, height);
      particleMask.fill(255, 0, 0);
      particleMask.noStroke();
    }
  }

  nodes.forEach(node => {
    if (!node.children) {
      const x = node.x;
      const y = node.y;
      const diameter = node.data.radius * 2;

      drawProject(x, y, diameter, node.data.people, node.data.stress);

      if (!simulationRunning && !showConnections) {
        if (useMask) {
          particleMask.ellipse(x, y, diameter + particleExpansion * 2);
        }

        previousShapes.push({
          x,
          y,
          diameter,
          distance: dist(0, 0, x, y),
          ...node.data
        });
      }
    }
  });

  if (simulationRunning || showConnections) {
    links.forEach(link => {
      stroke(0, 100, 100);
      strokeWeight(squiggleStroke * strokeScale * (svgRenderer ? canvasScale : 1));

      line(link.source.x, link.source.y, link.target.x, link.target.y);
    });

    if (!simulationRunning) {
      noLoop();
    }
  } else {
    const extremities = [0, 0, 0, 0];

    nodes.forEach(node => {
      if (!node.children) {
        const nodeX = node.x + Math.sign(node.x) * node.data.radius;
        const nodeY = node.y + Math.sign(node.y) * node.data.radius;

        if (nodeX < extremities[0]) extremities[0] = nodeX;
        if (nodeX > extremities[1]) extremities[1] = nodeX;
        if (nodeY < extremities[2]) extremities[2] = nodeY;
        if (nodeY > extremities[3]) extremities[3] = nodeY;
      } else if (showLabels && node.depth > 0) {
        fill(0, 100, 100);
        noStroke();
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        
        ellipse(node.x, node.y, 5 * (node.height + 1));
        text(node.data.title, node.x, node.y + 15 + 2.5 * node.height);
      }
    });

    if (useMask) {
      particleMask.fill(254);
      previousShapes.forEach(shape => {
        particleMask.ellipse(shape.x, shape.y, shape.diameter + circleDistance * (1 + particleBuffer));
      });

      if (showMask) {
        image(particleMask, 0, 0, width * 2, height * 2);
      }
    }

    let maskPixels;
    if (useMask) {
      particleMask.loadPixels();
      maskPixels = particleMask.pixels;
    }

    distributionSuccessful(true);

    for (const key in course.hours) {
      let h = 0;
      let i = 0;

      while (h < course.hours[key]) {
        if (i >= 10000) {
          distributionSuccessful(false);
          break;
        }

        const particle = {};

        particle.diameter = particleSize;
        particle.x = random(extremities[0] - particleExpansion, extremities[1] + particleExpansion);
        particle.y = random(extremities[2] - particleExpansion, extremities[3] + particleExpansion);

        let pixelIndex, withinMask;

        if (useMask) {
          pixelIndex = (round(height + particle.y) * width * 2 + round(width + particle.x)) * 4;
          withinMask = maskPixels[pixelIndex] === 255;
        }

        if (!useMask || withinMask) {
          let collision = false;

          for (let s = 0; s < previousShapes.length; s++) {
            collision = checkCollision(particle, previousShapes[s], circleDistance * (previousShapes[s].distance ? particleBuffer : 1));
            if (collision) break;
          }

          if (!collision) {
            drawHour(particle.x, particle.y, key, foregroundColor);

            previousShapes.push(particle);
            h++;
          }
        }

        i++;
      }
    }

    noLoop();
  }
}

function drawProject(x, y, diameter, people, stress) {
  push();

  translate(x, y);

  if (simulationRunning || showConnections) {
    fill(foregroundColor);
    noStroke();

    ellipse(0, 0, diameter);
  } else {
    rotate(-rotationAngle + random([-45, 0, 45]));

    noFill();
    stroke(foregroundColor);
    strokeWeight(squiggleStroke * strokeScale * (svgRenderer ? canvasScale : 1));
    strokeCap(PROJECT);

    const squiggleHorizontal = map(stress, 1, 4, squiggleHorizontalStart, squiggleHorizontalStop, true);
    const squiggleVertical = map(stress, 1, 4, squiggleVerticalStart, squiggleVerticalStop, true);

    const horizontalOrigin = -diameter / 2 + (diameter % squiggleHorizontal) / 2;
    const verticalOrigin = -diameter / 2 + (diameter % squiggleVertical) / 2;

    for (let y = verticalOrigin; y <= diameter / 2; y += squiggleVertical) {
      beginShape();
      let shapeClosed = false;

      for (let x = horizontalOrigin; x <= diameter / 2; x += squiggleHorizontal) {
        if (collidePointCircle(x, y, 0, 0, diameter)) {
          if (people <= 1 || !collidePointCircle(x, y, 0, 0, holeSize * (1 + map(stress, 1, 4, 0, 0.2)))) {
            if (shapeClosed) {
              beginShape();
              shapeClosed = false;
            }

            const squiggleAmplitude = map(stress, 1, 4, squiggleAmplitudeStart, squiggleAmplitudeStop, true);
            vertex(x, y + random(-squiggleAmplitude, squiggleAmplitude));
          } else if (!shapeClosed) {
            endShape();
            shapeClosed = true;
          }
        }
      }

      endShape();
    }
  }

  pop();
}

function drawHour(x, y, type) {
  push();

  translate(x, y);
  rotate(-rotationAngle);

  noFill();
  stroke(foregroundColor);
  strokeWeight(particleStroke * strokeScale * (svgRenderer ? canvasScale : 1));

  if (type === 'online') {
    const segmentLength = particleSize * 0.5;

    rotate(180);

    beginShape();
    vertex(-segmentLength, 0);
    vertex(0, segmentLength);
    vertex(segmentLength, 0);
    endShape();
  } else {
    const halfLineLength = particleSize * 0.6;

    rotate(45);

    line(-halfLineLength, 0, halfLineLength, 0);
    line(0, -halfLineLength, 0, halfLineLength);
  }

  pop();
}

function prepareCourses() {
  const combinedCourse = {
    title: 'Alle Kurse',
    projects: {},
    projectCount: 0,
    hours: {
      online: 0,
      local: 0
    }
  };

  courses = Object.values(courses);

  courses.forEach(course => {
    course.projectCount = course.projects.length;

    const categoryKey = course.chapter;

    if (!(categoryKey in combinedCourse.projects)) {
      combinedCourse.projects[categoryKey] = {
        title: categoryKey,
        children: []
      }
    }

    combinedCourse.projects[categoryKey].children.push({
      title: course.title,
      children: course.projects
    });

    combinedCourse.projectCount += course.projects.length;
    combinedCourse.hours.online += course.hours.online;
    combinedCourse.hours.local += course.hours.local;
  });

  combinedCourse.projects = Object.values(combinedCourse.projects);
  courses.unshift(combinedCourse);

  courseTitles = courses.map(course => course.title);
}

function updateCourse() {
  course = courses[courseIndex];

  gui.prototype.setValue('courseStats', 'Projects    ' + course.projectCount + '<br>Hrs Online  ' + course.hours.online + '<br>Hrs Local   ' + course.hours.local);

  const computeRadius = item => {
    if (!item.children) {
      item.radius = pow(item.duration, circleGrowth) * circleSize / 2;
    } else {
      item.children.forEach(computeRadius);
    }
  };
  course.projects.forEach(computeRadius);

  root = d3.hierarchy({
    children: course.projects
  });
  links = root.links();
  nodes = root.descendants();

  nodes.forEach(node => {
    if (node.depth === 1) {
      switch (node.data.title) {
        case 'system':
          node.fx = -categoryDistanceX;
          node.fy = -categoryDistanceY / 2;
          break;
        case 'experiment':
          node.fx = 0;
          node.fy = categoryDistanceY / 2;
          break;
        case 'verantwortung':
          node.fx = categoryDistanceX;
          node.fy = -categoryDistanceY / 2;
          break;
      }
    }

    node.x = random(-categoryDistanceX / 2, categoryDistanceX / 2);
    node.y = random(-categoryDistanceY / 2, categoryDistanceY / 2);

    if (node.depth === 2) {
      let maxRadius = 0;

      node.children.forEach(project => {
        if (project.data.radius > maxRadius) {
          maxRadius = project.data.radius;
        }
      });

      node.data.maxRadius = maxRadius;
    }
  });

  const categoryNodes = [];

  simulation = d3.forceSimulation(nodes)
    .force('collision', d3.forceCollide().radius(d => d.data.radius + circleDistance / 2))
    .force('link', d3.forceLink(links).strength(0.75).distance(d => {
      if (d.target.depth === 2) {
        if (!categoryNodes.includes(d.source.index)) {
          categoryNodes.push(d.source.index);
          return 0;
        } else {
          return d.target.data.maxRadius * 2.25;
        }
      } else {
        return 0;
      }
    }))
    .force('charge', d3.forceManyBody().strength(-300).distanceMax(1000))
    .alphaMin(0.0001)
    .stop();
}

function restartSimulation() {
  updateCourse();
  simulation.alpha(1);
  loop();
}

function initializeGui() {
  gui = createGui();
  
  gui.prototype.addDropDown('courseTitle:', courseTitles, item => courseIndex = item.index);
  gui.prototype.addHTML('courseStats');
  gui.prototype.addHTML('simulationTitle', '<h1>Simulation</h1>');
  gui.prototype.hideTitle('simulationTitle');
  sliderRange(0, 100, 1);
  gui.addGlobals('seedValue');
  sliderRange(0, 1, 0.05);
  gui.addGlobals('circleGrowth');
  sliderRange(1, 50, 1);
  gui.addGlobals('circleSize');
  sliderRange(0, 30, 1);
  gui.addGlobals('circleDistance');
  sliderRange(0, 500, 10);
  gui.addGlobals('categoryDistanceX');
  gui.addGlobals('categoryDistanceY');
  gui.addGlobals('showConnections');
  gui.addGlobals('showLabels');
  gui.prototype.addButton('Restart Simulation', restartSimulation);
  gui.prototype.addHTML('circlesTitle', '<h1>Circles</h1>');
  gui.prototype.hideTitle('circlesTitle');
  sliderRange(0, 30, 1);
  gui.addGlobals('holeSize');
  sliderRange(0.5, 10, 0.5);
  gui.addGlobals('squiggleVerticalStart');
  gui.addGlobals('squiggleVerticalStop');
  gui.addGlobals('squiggleHorizontalStart');
  gui.addGlobals('squiggleHorizontalStop');
  sliderRange(0, 10, 0.25);
  gui.addGlobals('squiggleAmplitudeStart');
  gui.addGlobals('squiggleAmplitudeStop');
  sliderRange(0.5, 10, 0.5);
  gui.addGlobals('squiggleStroke');
  sliderRange(1, 200, 1);
  gui.prototype.addHTML('particlesTitle', '<h1>Particles</h1>');
  gui.prototype.hideTitle('particlesTitle');
  gui.addGlobals('useMask');
  gui.addGlobals('showMask');
  sliderRange(0, 300, 1);
  gui.addGlobals('particleExpansion');
  sliderRange(1, 2, 0.05);
  gui.addGlobals('particleBuffer');
  sliderRange(1, 20, 1);
  gui.addGlobals('particleSize');
  sliderRange(0, 10, 0.5);
  gui.addGlobals('particleStroke');
  gui.prototype.addHTML('distributionStatus');
  sliderRange(0, 360, 1);
  gui.prototype.addHTML('appearanceTitle', '<h1>Appearance</h1>');
  gui.prototype.hideTitle('appearanceTitle');
  gui.addGlobals('rotationAngle');
  sliderRange(0.1, 2, 0.05);
  gui.addGlobals('canvasScale');
  gui.addGlobals('strokeScale');
  gui.addGlobals('foregroundColor');
  gui.addGlobals('backgroundColor');

  gui.prototype.addHTML('resetTitle', '<h1>Reset</h1>');
  gui.prototype.hideTitle('resetTitle');
  defaultValues = gui.prototype.getValuesAsJSON();
  gui.prototype.addButton('Reset Values', () => { gui.prototype.setValuesFromJSON(defaultValues) });
  gui.prototype.saveInLocalStorage('course-map');

  gui.prototype.addHTML('exportTitle', '<h1>Export</h1>');
  gui.prototype.hideTitle('exportTitle');
  gui.prototype.addBoolean('svgRenderer', svgRenderer, switchRenderer);
  gui.prototype.addButton('Save ' + (svgRenderer ? 'SVG' : 'PNG'), () => { save(String(Date.now())) });
}

function distributionSuccessful(result) {
  gui.prototype.setValue('distributionStatus', '<span style="color: ' + (result === true ? 'green' : 'red') + '">' + (result === true ? 'success' : 'not enough space') + '</span>');
}

function checkCollision(one, two, distance) {
  return collideCircleCircle(
    one.x,
    one.y,
    one.diameter + distance,
    two.x,
    two.y,
    two.diameter + distance
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(event) {
  if (!gui.prototype._panel.contains(event.target)) {
    clickState = {
      mouseX,
      mouseY,
      rotationAngle,
      canvasScale
    }
  }
}

function mouseDragged() {
  if (clickState) {
    if (!keyIsPressed) {
      gui.prototype.setValue('rotationAngle', ((clickState.rotationAngle + (clickState.mouseX - mouseX) * 0.5) % 360 + 360) % 360);
    } else {
      gui.prototype.setValue('canvasScale', max(min(clickState.canvasScale + (clickState.mouseY - mouseY) * 0.01, 2), 0.1));
    }
  }
}

function mouseReleased() {
  if (clickState && mouseX === clickState.mouseX && mouseY === clickState.mouseY) {
    gui.prototype.setValue('rotationAngle', 0);
  }

  clickState = false;
}

function switchRenderer() {
  if (svgRenderer) window.location.href = window.location.href.split('?')[0];
  else window.location.href += '?svg';
}
