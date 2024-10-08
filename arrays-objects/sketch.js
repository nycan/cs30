// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// Disclaimer: lots of object detection code is from https://editor.p5js.org/tomas.decamino/sketches/qRTOcPD5N

let video;
let detector;
let surfaces = [];

function preload() {
  detector = ml5.objectDetector('cocossd'); 
}

function addSurfaces(err, results) {
  if (err){
    console.error(err);
  }

  surfaces = results;
  detector.detect(video, addSurfaces);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  const constraints = {
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  };
  video = createCapture(constraints);
  video.hide();
  detector.detect(video, addSurfaces);
}

function draw() {
  background(220);

  image(video,0,0);

  for (const surface of surfaces) {
    stroke(0, 255, 0);
    strokeWeight(1);
    noFill();
    rect(surface.x, surface.y, surface.width, surface.height);
    noStroke();
    fill(255);
    textSize(24);
    text(object.label, object.x + 10, object.y + 24);
  }
}
