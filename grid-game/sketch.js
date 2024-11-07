// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let locked = false;

let visited;

let playerID;
let cam;

let me;
let guests;
let shared;

let xp;
let meXP;

const speed = 80;
const sensitivity = 0.01;

const cellSize = 40;
const xCells = 20;
const zCells = 20;

const dirX = [1,0,-1,0];
const dirZ = [0,1,0,-1];

const playerWidth = 10;
const playerBody = 17; // body height
const playerHead = 6; // head height
const wallHeight = 30;

const maxXP = 100;
const maxXPrad = 15;
const minXPrad = 3;

const colours = [
  "burlywood",
  "cadetblue",
  "chocolate",
  "darkgoldenrod",
  "darkolivegreen",
  "firebrick",
  "orchid",
  "orange",
  "pink",
  "slategrey"
];

// params:
// x = x coord of the search
// y = y coord of the search
// dir = direction used to reach here
function dfs(x, y, dir) {
  visited[x][y] = true;
  // at the start, make all lines except where we came from
  let validRoute = [false,false,false,false];
  if (x !== 0 || y!== 0) {
    validRoute[(dir+2)%4] = true;
  }

  let dirsLeft = [0,1,2,3];

  for (let j = 0; j<4; ++j) {
    let i = random(dirsLeft.filter((x)=>x>=0));
    dirsLeft[i] = -1;
    let nx = x+dirX[i];
    let ny = y+dirZ[i];

    if (0<=nx && nx<xCells && 0<=ny && ny<zCells) {
      if (!visited[nx][ny]) {
        dfs(nx, ny, i);
        // dont make a line where we search
        validRoute[i] = true;
      }
    }
  }

  // update the maze
  shared.maze[x][y] = validRoute;
}

// Starts the DFS
function createMaze() {
  visited = Array(xCells).fill().map((x) => Array(zCells).fill(false));
  dfs(0,0,0);
}

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "nycan_server"
  );

  //shared = partyLoadShared("shared", shared);
  // position and camera rotation
  me = partyLoadMyShared({
    x: 0, y: -5, z: 0,
    tilt: 0, rot: 0,
    colour: random(colours)
  });
  guests = partyLoadGuestShareds();
  shared = partyLoadShared("shared");
}

function doubleClicked() {
  // has to have some input first
  requestPointerLock();
  if (locked) {
    return;
  }

  me.x = (0.5+floor(random(-xCells/2,xCells/2)))*cellSize;
  me.z = (0.5+floor(random(-zCells/2,zCells/2)))*cellSize;
  cam.setPosition(me.x,me.y,me.z);
  cam.lookAt(me.x,me.y,me.z+800); // keep center relative to eye

  locked = true;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  setCamera(cam);
  // allow objects closer to the camera than default
  perspective(2*atan(height / 1600),width/height,10,1000);
  strokeWeight(0.1);

  noCursor();

  if(!shared.maze) {
    shared.maze = Array(xCells).fill().map(
      (x) => Array(zCells).fill([false,false,false,false])
    );
    createMaze();
  }

  xp = Array(xCells).fill().map(
    (x) => Array(zCells).fill(0)
  );
  setInterval(spawnXP, 200);
}

function spawnXP() {
  let randX = floor(random(xCells));
  let randZ = floor(random(zCells));

  xp[randX][randZ] = min(xp[randX][randZ]+1, maxXP);
}

function checkCollision(dx, dz) {
  const CORNER_X = [1,1,-1,-1];
  const CORNER_Z = [-1,1,1,-1];

  let corners = {
    x: Array(4).fill().map((x,i) =>
        playerWidth/2*(CORNER_X[i]*cos(me.az)-CORNER_Z[i]*sin(me.az))+me.x
    ),
    z: Array(4).fill().map((x,i) =>
        playerWidth/2*(CORNER_X[i]*sin(me.az)+CORNER_Z[i]*cos(me.az))+me.z
      )
  };

  // get their maze coordinates
  let cell = {
    x: floor((me.x+cellSize*xCells/2)/cellSize),
    z: floor((me.z+cellSize*zCells/2)/cellSize)
  }
  if (cell.x<0 || cell.x>=xCells || cell.z<0 || cell.z>=zCells) {
    return {x: dx, z: dz}; // they found a way to escape!
  }
}

function movePlayer() {
  const angles = [0, PI/2, PI, -PI/2];
  const keys = [87,65,83,68]; // wasd

  let dx = 0;
  let dz = 0;

  let perp = 0;

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      dx += speed*sin(me.rot+angles[i])/frameRate();
      dz += speed*cos(me.rot+angles[i])/frameRate();

      perp += (i%2)+1;
    }
  }

  // only way to get perp = 3 is to have 2 perpendicular directions
  if (perp === 3) {
    // make it so that diagonal is the same speed
    dx /= sqrt(2);
    dz /= sqrt(2);
  }

  //checkCollision(dx,dz);
  //let final = checkCollision(dx, dz);
  let final = {x: dx, z: dz};

  me.x += final.x;
  me.z += final.z;
  cam.setPosition(me.x, me.y, me.z);
  // we have to change where we look too or we'll rotate
  cam.lookAt(cam.centerX+final.z,cam.centerY,cam.centerZ+final.z);
}

function calculateRot() {
  cam.tilt(-me.tilt); // we dont want to rotate on the wrong plane
  cam.pan(-movedX*sensitivity);
  me.rot -= movedX*sensitivity;
  me.rot %= 2*PI;

  // no breaking your neck!
  let next = constrain(movedY*sensitivity+me.tilt,-PI/2+0.1,PI/2-0.1);
  cam.tilt(next);
  me.tilt = next;
}

// draw all the lines
function drawMaze() {
  for(let x = 0; x<xCells; ++x) {
    for(let y = 0; y<zCells; ++y) {
      for(let i = 0; i<4; ++i) {
        // don't draw a line for a valid route
        if(shared.maze[x][y][i]) {
          continue;
        }
        // don't draw if we drew it already
        if(i>=2 && !shared.maze[x+dirX[i]]?.[y+dirZ[i]]) {
          if (x+dirX[i]>=0 && y+dirZ[i]>=0) {
            continue;
          }
        }
        
        push();
        // move to the middle of the cell and then to the side
        translate(
          cellSize*(-xCells/2 + x + 1/2 + dirX[i]/2),
          0,
          cellSize*(-zCells/2 + y + 1/2 + dirZ[i]/2)
        );
        rotate(PI/2 * (1-i%2), [0,1,0]); // rotate for the directions that need it
        plane(cellSize, wallHeight);
        pop();
      }
    }
  }
}

function drawPlayers() {
  for (const player of guests) {
    if (player === me) {
      continue;
    }

    fill(player.colour);
    
    // body
    push();
    translate(player.x, player.y+playerHead/2+playerBody/2, player.z);
    rotateY(player.rot);
    box(playerWidth, playerBody, playerWidth);
    pop();

    // head
    push();
    translate(player.x,player.y,player.z);
    rotateY(player.rot);
    rotateX(-player.tilt);
    box(playerHead);
    pop();

    fill("white");
  }
}

function lightScene() {
  noLights();
  ambientLight(20);

  for (const player of guests) {
    spotLight(
      color(150),
      player.x,player.y,player.z,
      sin(player.rot),sin(player.tilt),cos(player.rot),
      PI/3, 50
    );
  }
}

function drawXP() {
  emissiveMaterial(34, 240, 54);
  specularMaterial(255);
  shininess(10);
  for(let i = 0; i<xCells; ++i) {
    for(let j = 0; j<zCells; ++j) {
      if (!xp[i][j]) {
        continue;
      }
      let rad = lerp(1,maxXPrad, xp[i][j]/maxXP);

      push();
      translate(
        cellSize*(-xCells/2 + i + 1/2),
        wallHeight/2-rad,
        cellSize*(-zCells/2 + j + 1/2)
      );
      sphere(rad);
      pop();
    }
  }
  emissiveMaterial(0);
  specularMaterial(0);
  shininess(0);
}

function draw() {
  background(33, 54, 63);

  if (locked) {
    calculateRot();
    movePlayer();
  }

  lightScene();
  
  drawXP();

  noStroke();
  ambientMaterial(255);
  specularMaterial(150);

  // floor
  push();
  translate(0,wallHeight/2,0);
  rotate(PI/2,[1,0,0]);
  plane(xCells*cellSize,zCells*cellSize);
  pop();

  drawMaze();
  drawPlayers();
}

function keyPressed() {
  if (key === "r" && partyIsHost()) {
    createMaze();
  }
}