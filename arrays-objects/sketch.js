// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// Disclaimer: lots of object detection code is from https://editor.p5js.org/tomas.decamino/sketches/qRTOcPD5N

let video;

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL);

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

  normalMaterial();
}

function draw() {
  background(220);
  image(video,0,0);

  push();
  rotateZ(-radians(rotationZ));
  rotateX(-radians(rotationX));
  rotateY(-radians(rotationY));
  box(70,70,70);
  pop();
}
