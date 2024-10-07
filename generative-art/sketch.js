// Project Title
// Your Name

const tw = 20;
const lines = [
  {x1: 0, y1: 0, x2: tw, y2: tw},
  {x1: tw, y1: 0, x2: 0, y2: tw},
  {x1: 0, y1: 0, x2: 0, y2: 0}
];
let dx = [1,0,-1,0];
let dy = [0,1,0,-1];
let mp;

function setup() {
  // set up graphics
  createCanvas(windowWidth, windowHeight);
  background(220);
  noStroke();

  // map of colours
  mp = Array(int(width/tw)+1).fill().map(() => Array(int(height/tw)+1).fill(-1));
  let queue = [];
  
  let blobs = int(random(1,100));
  for(let i = 0; i<blobs; ++i) {
    let rx = random(int(width/tw)+1);
    let ry = random(int(height/tw)+1);
    while(mp[rx][ry] !== -1){
      let rx = random(int(width/tw)+1);
      let ry = random(int(height/tw)+1);
    }

    blobs[rx][ry] = random(10);
    queue.push([rx,ry]);
  }

  // pretty redundant but convenient storage
  let weights = Array(int(width/tw)+1).fill().map(
    () => Array(int(height/tw)+1).fill().map(() => Array(4).fill(-1))
  );
  for(let x = 0; x < int(width/tw); ++x) {
    for(let y = 0; y < int(height/tw); ++y) {
      weights[x][y][0] = weights[x+1][y][2] = random()
    }
  }
}

function draw() {
} 