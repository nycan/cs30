// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let locked = false;

let maze;
let visited;

let playerID;
let cam;

let me;
let guests;

const speed = 60;
const sensitivity = 0.01;

const cellSize = 40;
const xCells = 25;
const zCells = 25;

const DX = [1,0,-1,0];
const DY = [0,1,0,-1];

// params:
// x = x coord of the search
// y = y coord of the search
// dir = direction used to reach here
function dfs(x, y, dir) {
  visited[x][y] = true;
  // at the start, make all lines except where we came from
  let validRoute = [false,false,false,false];
  validRoute[(dir+2)%4] = true;

  let dirsLeft = [0,1,2,3];

  for (let j = 0; j<4; ++j) {
    let i = random(dirsLeft.filter((x)=>x>=0));
    dirsLeft[i] = -1;
    let nx = x+DX[i];
    let ny = y+DY[i];

    if (0<=nx && nx<xCells && 0<=ny && ny<zCells) {
      if (!visited[nx][ny]) {
        dfs(nx, ny, i);
        // dont make a line where we search
        validRoute[i] = true;
      }
    }
  }

  // update the maze
  maze[x][y] = validRoute;
}

// Starts the DFS
function createMaze() {
  visited = Array(xCells).fill().map((x) => Array(zCells).fill(false));
  dfs(0,0,0);
  maze[0][0][0] = false;
}

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
  // has to have some input first
  requestPointerLock();
  if (locked) {
    return;
  }

  me.x = (0.5+floor(random(-xCells/2,xCells/2)))*cellSize;
  me.z = (0.5+floor(random(-zCells/2,zCells/2)))*cellSize;
  cam.setPosition(me.x,me.y,me.z);
  cam.lookAt(me.x,me.y,me.z+800);

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

  maze = Array(xCells).fill().map(
    (x) => Array(zCells).fill([false,false,false,false])
  );
  createMaze();
}

function moveCamera() {
  const angles = [0, PI/2, PI, -PI/2];
  const keys = [87,65,83,68]; // wasd

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      let ang = -atan((cam.centerX-cam.eyeX)/(cam.centerZ-cam.eyeZ));
      const dx = speed*sin(ang+angles[i])/frameRate();
      const dz = speed*cos(ang+angles[i])/frameRate();

      me.x += dx;
      me.z += dz;
      // we have to change where we look too or we'll rotate
      cam.lookAt(cam.centerX+dx,cam.centerY,cam.centerZ+dz);
    }
  }

  cam.setPosition(me.x, me.y, me.z);
}

function calculateRot() {
  // no breaking your neck!
  let next = constrain(movedY*sensitivity+me.ax,-PI/2,PI/2);
  cam.tilt(next-me.ax);
  me.ax = next;

  cam.pan(-movedX*sensitivity);
  me.az -= movedX*sensitivity;
  me.az %= 2*PI;
}

// draw all the lines
function drawMaze() {
  for(let x = 0; x<xCells; ++x) {
    for(let y = 0; y<zCells; ++y) {
      for(let i = 0; i<4; ++i) {
        // don't draw a line for a valid route
        if(maze[x][y][i]) {
          continue;
        }
        // don't draw if we drew it already
        if(i>=2 && !maze[x+DX[i]]?.[y+DY[i]]) {
          if (x+DX[i]>=0 && y+DY[i]>=0) {
            continue;
          }
        }
        
        push();
        // move to the middle of the cell and then to the side
        translate(
          cellSize*(-xCells/2 + x + 1/2 + DX[i]/2),
          0,
          cellSize*(-zCells/2 + y + 1/2 + DY[i]/2)
        );
        rotate(PI/2 * (1-i%2), [0,1,0]); // rotate for the directions that need it
        plane(cellSize, 20);
        pop();
      }
    }
  }
}

function draw() {
  background(220);

  if (locked) {
    calculateRot();
    moveCamera();
  }

  // floor
  push();
  translate(0,10,0);
  rotate(PI/2,[1,0,0]);
  plane(xCells*cellSize,zCells*cellSize);
  pop();

  drawMaze();

  // players
  for (const player of guests) {
    push();
    translate(player.x, player.y, player.z);
    sphere(10);
    pop();
  }
}