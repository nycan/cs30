// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//let shared;
let playerID;
let cam;

let me;
let guests;

const speed = 1.5;

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "nycan_server"
  );

  //shared = partyLoadShared("shared", shared);
  // position and camera rotation
  me = partyLoadMyShared({x: 0, y: 0, z: 0, ax: 0, az: 0});
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  setCamera(cam);
}

function handleKeys() {
  const angles = [0, PI/2, -PI/2, PI];
  const keys = [87,65,83,68]; // wasd

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      me.x += speed*sin(-me.az+angles[i]);
      me.z += speed*cos(-me.az+angles[i]);
    }
  }
}

function calculateRot() {
  let xRot = mouseY/height * PI - PI/2;
  cam.tilt(xRot-me.ax);
  me.ax = xRot;

  let zRot = - (mouseX/width * 2*PI - PI);
  cam.pan(zRot-me.az);
  me.az = zRot;
}

function draw() {
  background(220);

  handleKeys();
  cam.setPosition(me.x,me.y,me.z);

  calculateRot();

  push();
  plane(100,100);
  pop();

  for (const player of guests) {
    push();
    translate(player.x, player.y, player.z);
    sphere(10);
    pop();
  }
}