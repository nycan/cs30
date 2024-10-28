// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let shared;
let playerID;
let cam;

const speed = 1;

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "nycan_server"
  );

  shared = partyLoadShared("players", shared);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  setCamera(cam);

  if (shared.players === undefined) {
    shared.players = [];
  }

  playerID = shared.players.length;
  shared.players.push({
    x: 0,
    y: 0,
    z: 0
  });
}

function handleKeys() {
  const dx = [1,0,-1,0];
  const dz = [0,1,0,-1];
  const keys = [68,87,65,83]; // dwas

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      shared.players[playerID].x += dx[i]*speed;
      shared.players[playerID].z += dz[i]*speed;
    }
  }
}

function draw() {
  background(220);

  handleKeys();

  let pos = shared.players[playerID];
  cam.setPosition(pos.x,pos.y,pos.z);

  for(let i = 0; i<shared.players.length; ++i) {
    if (i===playerID) {
      continue;
    }

    let player = shared.players[i];

    push();
    translate(player.x, player.y, player.z);
    box(5,10,5);
    pop();
  }
}