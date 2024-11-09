// Maze game
// N Young
// Nov 15
// this code feels too spaghetti to work
//
// Extra for Experts:
// 3d, multiplayer, MST, 

let locked = false;

let dsu;
let dsuSize;

let playerID;
let cam;

let me;
let guests;
let shared;

let xp;
let meXP;
let xpSpawner;

const speed = 80;
const sensitivity = 0.007;

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
const xpInterval = 800;

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

// search up "disjoint set union"
function find(n) {
  if (dsu[n[0]][n[1]]===n) {
    return n;
  }
  return dsu[n[0]][n[1]] = find(dsu[n[0]][n[1]]);
}

// dont let bezos see this
function unionize(a, b) {
  a = find(a);
  b = find(b);
  if (a===b) {
    return false;
  }

  // js doesn't have a built-in swap function :(
  if (dsuSize[a[0]][a[1]]<dsuSize[b[0]][b[1]]) {
    dsu[a[0]][a[1]] = b;
    dsuSize[b[0]][b[1]] += dsuSize[a[0]][a[1]];
  } else {
    dsu[b[0]][b[1]] = a;
    dsuSize[a[0]][a[1]] += dsuSize[b[0]][b[1]];
  }

  return true;
}

// MST with random weights != random tree but wilsons algo is too slow
function createMaze() {
  // populate the arrays
  shared.maze = Array.from({length: xCells}, ()=>
    Array.from({length: zCells}, ()=>
      Array.from([false,false,false,false])
    )
  );
  dsu = Array(xCells).fill().map( (x,i) =>
    Array(zCells).fill().map((y,j)=> [i,j])
  );
  dsuSize = Array.from({length: xCells}, ()=>
    Array.from({length: zCells}, ()=>1)
  );

  // assign random weights
  let edges = [];
  for (let i = 0; i<xCells; ++i) {
    for (let j = 0; j<zCells; ++j) {
      if (i<xCells-1) {
        edges.push({
          x: i,
          z: j,
          dir: 0,
          weight: random()
        });
      }

      if (j<zCells-1) {
        edges.push({
          x: i,
          z: j,
          dir: 1,
          weight: random()
        });
      }
    }
  }

  // sort
  edges.sort((a,b) => a.weight-b.weight);

  // join the next smallest edge if it adds a new element to the tree
  for (const edge of edges) {
    let nx = edge.x + dirX[edge.dir];
    let nz = edge.z + dirZ[edge.dir];

    if (unionize([edge.x,edge.z],[nx,nz])) {
      shared.maze[edge.x][edge.z][edge.dir] = true;
      shared.maze[nx][nz][(edge.dir+2)%4] = true;
    }
  }
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
    colour: random(colours),
    active: false
  });
  guests = partyLoadGuestShareds();
  shared = partyLoadShared("shared");
}

function doubleClicked() {
  // has to have some input first
  requestPointerLock();
  if (me.active) {
    return;
  }

  me.x = (-xCells/2 + 0.5 + floor(random(xCells/2)))*cellSize;
  me.z = (-zCells/2 + 0.5 + floor(random(zCells/2)))*cellSize;
  cam.setPosition(me.x,me.y,me.z);
  cam.lookAt(me.x,me.y,me.z+800); // keep center relative to eye

  xpSpawner = setInterval(spawnXP, 400);

  me.active = true;
}

function spawnXP() {
  let randX = floor(random(xCells));
  let randZ = floor(random(zCells));

  shared.xp[randX][randZ] = min(shared.xp[randX][randZ]+1, maxXP);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  setCamera(cam);

  // allow objects closer to the camera than default
  perspective(2*atan(height / 1600),width/height,0,1000);
  strokeWeight(0.1);

  cam.setPosition(0,-800,0);
  cam.tilt(PI/2);

  noCursor();

  if(!shared.maze) {
    createMaze();
    shared.xp = Array(xCells).fill().map(
      (x) => Array(zCells).fill(0)
    );
  }

  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

// world coords --> maze coords
function getCell(x,z) {
  return {
    x: floor(x/cellSize)+xCells/2,
    z: floor(z/cellSize)+zCells/2
  };
}

// note that since the character is a square,
// rotation can be taken mod pi/2
// thus, we only need to check one corner for each side
// important: this would break if playerWidth > cellSize
function checkCollision() {
  const ANGLES = [-PI/4, PI/4, 3*PI/4, -3*PI/4];

  let pCell = getCell(me.x,me.z);

  // may be a better way to do this...
  // represents the constraints for each side
  let mx = Number.MAX_VALUE;
  let mn = -mx;

  let minX = [mn,mn,cellSize*(-xCells/2+pCell.x),mn];
  let minZ = [mn,mn,mn,cellSize*(-zCells/2+pCell.z)];
  let maxX = [cellSize*(-xCells/2+pCell.x+1),mx,mx,mx];
  let maxZ = [mx,cellSize*(-zCells/2+pCell.z+1),mx,mx];

  let mRot = (me.rot+2*PI) % (PI/2);

  let xChange = 0;
  let zChange = 0;
  
  for (let i = 0; i<4; ++i) {
    if (shared.maze[pCell.x][pCell.z][i]) {
      continue;
    }

    let corner = {
      x: me.x + playerWidth/2 * cos(ANGLES[i]+mRot),
      z: me.z + playerWidth/2 * sin(ANGLES[i]+mRot)
    }
    let constrained = {
      x: constrain(corner.x, minX[i], maxX[i]),
      z: constrain(corner.z, minZ[i], maxZ[i])
    }

    if (xChange === 0) {
      xChange = constrained.x - corner.x;
    }
    if (zChange === 0) {
      zChange = constrained.z - corner.z;
    }
  }

  cam.setPosition(
    cam.eyeX+xChange, cam.eyeY, cam.eyeZ+zChange
  );
}

function movePlayer() {
  //const angles = [0, PI/2, PI, -PI/2];
  const keys = [68,83,65,87]; // dsaw

  let dx = 0;
  let dz = 0;

  let perp = 0;

  for (let i = 0; i<4; ++i) {
    if (keyIsDown(keys[i])) {
      dx += speed*dirX[i]/frameRate();
      dz += speed*dirZ[i]/frameRate();

      perp += i%2+1;
    }
  }

  // only way to get perp = 3 is to have 2 perpendicular directions
  if (perp === 3) {
    // make it so that diagonal is the same speed
    dx /= sqrt(2);
    dz /= sqrt(2);
  }
  
  cam.tilt(-me.tilt);
  cam.move(dx,0,dz);
  cam.tilt(me.tilt);

  checkCollision();

  me.x = cam.eyeX;
  me.z = cam.eyeZ;
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
    if (player === me || !player.active) {
      continue;
    }

    ambientMaterial(player.colour);
    specularMaterial(player.colour);
    
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
  }
}

function lightScene() {
  noLights();
  ambientLight(20);

  // makes it easier to spectate
  if (!me.active) {
    pointLight(color(128),0,800,0);
  }

  // headlamps
  for (const player of guests) {
    if (!player.active) {
      continue;
    }
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
      if (!shared.xp[i][j]) {
        continue;
      }
      let rad = lerp(1,maxXPrad, shared.xp[i][j]/maxXP);

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

  if (me.active) {
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
    shared.xp = Array(xCells).fill().map(
      (x) => Array(zCells).fill(0)
    );

    createMaze();
  }
}