// Maze generator
// N Young
// Oct 24
//
// Extra for Experts:
// DFS algorithm for maze generation
//
// Description:
// Solve the maze. The end is the bottom-right corner
// enter resets the maze. R brings you back to the start

const SZ = 20;
let xCells;
let yCells;

let maze = [];
let visited;

const DX = [1,0,-1,0];
const DY = [0,1,0,-1];
const CORNER_X = [1,1,0,0];
const CORNER_Y = [0,1,1,0];

let player = {
  x: 0,
  y: 0
};
let trails = [];

// params:
// x = x coord of the search
// y = y coord of the search
// dir = direction used to reach here
function dfs(x,y, dir) {
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

    if (0<=nx && nx<xCells && 0<=ny && ny<yCells) {
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
  visited = Array(xCells).fill().map((x) => Array(yCells).fill(false));
  dfs(0,0,0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(4);
  fill("blue");

  xCells = floor(width/SZ);
  yCells = floor(height/SZ);

  maze = Array(xCells).fill().map(
    (x) => Array(yCells).fill([false,false,false,false])
  );
  createMaze();
}

// draw all the lines
function drawMaze() {
  for(let x = 0; x<xCells; ++x) {
    for(let y = 0; y<yCells; ++y) {
      for(let i = 0; i<4; ++i) {
        // don't draw a line for a valid route
        if(maze[x][y][i]) {
          continue;
        }
        
        let x1 = x+CORNER_X[i];
        let y1 = y+CORNER_Y[i];
        let x2 = x+CORNER_X[(i+1)%4];
        let y2 = y+CORNER_Y[(i+1)%4];
        
        line(x1*SZ,y1*SZ,x2*SZ,y2*SZ);
      }
    }
  }
}

function drawTrails() {
  // Show the player if they've won
  if(player.x === xCells-1 && player.y === yCells-1) {
    stroke("green");
  }
  else {
    stroke("red");
  }

  let pos = {x:0,y:0};
  pos.x = SZ*player.x+SZ/2;
  pos.y = SZ*player.y+SZ/2;

  for(let i = trails.length-1; i>=0; --i) {
    let nx = pos.x+DX[(trails[i]+2)%4]*SZ;
    let ny = pos.y+DY[(trails[i]+2)%4]*SZ;

    line(pos.x,pos.y,nx,ny);
    
    pos.x = nx;
    pos.y = ny;
  }

  stroke("black");
}

function draw() {
  background(220);
  drawMaze();
  drawTrails();

  // draw the player
  strokeWeight(0);
  circle(SZ*player.x+SZ/2,SZ*player.y+SZ/2,10);
  strokeWeight(4);
}

function handleSpecialKeys() {
  if (keyCode === ENTER) {
    createMaze();
    player = {x:0, y:0};
    trails = [];
  }
  else if (key === "r") {
    player = {x:0, y: 0};
    trails = [];
  }
}

function keyPressed() {
  handleSpecialKeys();

  // keep people at the end
  if (player.x === xCells-1 & player.y === yCells-1) {
    return;
  }

  const keys = {
    d: 0,
    s: 1,
    a: 2,
    w: 3
  };
  let dir = keys[key];
  
  if(dir === undefined) {
    return;
  }
  
  // not a valid route
  if(!maze[player.x][player.y][dir]) {
    return;
  }
  
  player.x += DX[dir];
  player.y += DY[dir];

  // if the player backs out of a path, dont keep it in the trail
  if(trails[trails.length-1] === (dir+2)%4) {
    trails.pop();
  }
  else {
    trails.push(dir);
  }
}
