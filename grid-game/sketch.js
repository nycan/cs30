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
const sensitivity = 0.01;

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

function doubleClicked() {
  requestPointerLock();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  setCamera(cam);

  noCursor();
}

function moveCamera() {
  const angles = [0, PI/2, PI, -PI/2];
  const keys = [87,65,83,68]; // wasd

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      me.x += speed*sin(me.az+angles[i]);
      me.z += speed*cos(me.az+angles[i]);
    }
  }
}

function calculateRot() {
  let next = constrain(movedY*sensitivity+me.ax,-PI/2,PI/2);
  cam.tilt(next-me.ax);
  me.ax = next;

  cam.pan(-movedX*sensitivity);
  me.az -= movedX*sensitivity;
}

function draw() {
  console.log(me.ax,me.az);
  background(220);

  moveCamera();

  cam.setPosition(me.x,me.y,me.z);
  calculateRot();

  push();
  translate(0,15,0);
  rotate(PI/2,[1,0,0]);
  plane(100,100);
  pop();

  for (const player of guests) {
    push();
    translate(player.x, player.y, player.z);
    sphere(10);
    pop();
  }
}