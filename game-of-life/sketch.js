// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let sz = 50;
let live = new Map();

function setup() {
  createCanvas(windowWidth, windowHeight);
  fill("black");
}

function draw() {
  background(220);

  for(const row of live) {
    for(const y of row[1]) {
      square(row[0]*sz,y*sz,sz);
    }
  }
}

function toggleCell(x,y) {
  let xRow = live.get(x);

  if (!xRow) {
    let newRow = new Set();

    live.set(x, newRow);
    newRow.add(y);

  }
  else {
    if (xRow.get(y)) {
      xRow.delete(y);
    }
    else {
      xRow.add(y);
    }
  }
}

function mousePressed() {
  let x = floor(mouseX/sz);
  let y = floor(mouseY/sz);

  toggleCell(x,y);
}