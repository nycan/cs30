// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let video;
let detector;
let detections = [];

function preload() {
  detector = ml5.objectDetector('cocossd'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
}

function draw() {
  background(220);

  image(video,0,0);
}
