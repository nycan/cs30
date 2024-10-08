// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// Disclaimer: lots of object detection code is from https://editor.p5js.org/tomas.decamino/sketches/qRTOcPD5N

let video;

function setup() {
  createCanvas(displayWidth, displayHeight);

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
}

function draw() {
  image(video,0,0);
}
