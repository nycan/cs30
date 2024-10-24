// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const SZ = 100;
let xCells;
let yCells;

let lines = [];
let visited;

const DX = [1,0,-1,0];
const DY = [0,1,0,-1];
const CORNER_X = [1,1,0,0];
const CORNER_Y = [0,1,1,0];


// params:
// x = x coord of the search
// y = y coord of the search
// dir = direction used to reach here
function dfs(x,y, dir) {
  visited[x][y] = true;
  // at the start, make all lines except where we came from
  let linesToMake = [true,true,true,true];
  linesToMake[(dir+2)%4] = false;

  let dirsLeft = [0,1,2,3];

  console.log(x,y);
  for (let j = 0; j<4; ++j) {
    i = random(dirsLeft.filter((x)=>x>=0));
    dirsLeft[i] = -1;
    let nx = x+DX[i];
    let ny = y+DY[i];

    if (0<=nx && nx<xCells && 0<=ny && ny<yCells) {
      if (!visited[nx][ny]) {
        console.log(i);
        dfs(nx, ny, i);
        // dont make a line where we search
        linesToMake[i] = false;
      }
    }
  }

  console.log(linesToMake);

  // add the lines to the array
  for (let i = 0; i<4; ++i) {
    if (linesToMake[i]) {
      lines.push({
        x: x,
        y: y,
        dir: i
      });
    }
  }
}

// Starts the DFS
function createMaze() {
  dfs(0,0,0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(4);

  xCells = floor(width/SZ);
  yCells = floor(height/SZ);

  visited = Array(xCells).fill().map((x) => Array(yCells).fill(false));
  createMaze();
}

function drawEdges() {
  line(0,0,xCells*SZ,0);
  line(0,0,yCells*SZ,0);
  line(xCells*SZ,yCells*SZ,xCells*SZ,0);
  line(xCells*SZ,yCells*SZ,0,yCells*SZ);
}

function drawMaze() {
  for(const ln of lines) {
    let x1 = ln.x+CORNER_X[ln.dir];
    let y1 = ln.y+CORNER_Y[ln.dir];
    let x2 = ln.x+CORNER_X[(ln.dir+1)%4];
    let y2 = ln.y+CORNER_Y[(ln.dir+1)%4];
    line(x1*SZ,y1*SZ,x2*SZ,y2*SZ);
  }
}

function draw() {
  background(220);
  drawEdges();
  drawMaze();
}
