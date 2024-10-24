// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

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
}

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
  dfs(0,0,0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(4);
  fill("blue");

  xCells = floor(width/SZ);
  yCells = floor(height/SZ);

  visited = Array(xCells).fill().map((x) => Array(yCells).fill(false));
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

function keyPressed() {
  const keys = {
    d: 0,
    s: 1,
    a: 2,
    w: 3
  }
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
}

function draw() {
  background(220);
  drawMaze();
  
  // draw the player
  strokeWeight(0);
  circle(SZ*player.x+SZ/2,SZ*player.y+SZ/2,10);
  strokeWeight(4);
}
