// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

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
      console.log(edge);
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
  cam.setPosition(0,20,0);
  cam.lookAt(0,0,0);
  // allow objects closer to the camera than default
  perspective(2*atan(height / 1600),width/height,10,1000);
  strokeWeight(0.1);

  noCursor();

  if(!shared.maze) {
    createMaze();
  }

  xp = Array(xCells).fill().map(
    (x) => Array(zCells).fill(0)
  );
  setInterval(spawnXP, 400);
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

  //checkCollision(dx,dz);
  //let final = checkCollision(dx, dz);
  let final = {x: dx, z: dz};

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
    if (player === me) {
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
    xp = Array(xCells).fill().map(
      (x) => Array(zCells).fill(0)
    );

    createMaze();
  }
}