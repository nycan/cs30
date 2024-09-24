// Traffic Light Starter Code
// Your Name Here
// The Date Here

// GOAL: make a 'traffic light' simulator. For now, just have the light
// changing according to time. You may want to investigate the millis()
// function at https://p5js.org/reference/#/p5/millis

let times = [3000,1000,2000];
let pos = [65,0,-65];
let colors = ["green", "amber", "red"];
let state = 0;
let lastSwitched = 0;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);
  drawOutlineOfLights();
}

function drawOutlineOfLights() {
  //box
  rectMode(CENTER);
  fill(0);
  rect(width/2, height/2, 75, 200, 10);

  if (millis() >= lastSwitched+times[state]) {
    lastSwitched += times[state];
    state = (state+1)%3;
  }

  fill(colors[state]);
  ellipse(width/2, height/2 + pos[state], 50, 50);
}