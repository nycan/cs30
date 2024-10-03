// Project Title
// Oct 3, 2024

let ballArray = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 10; i--;) {
    spawnBall(width/2, height/2);
  }
}

function draw() {
  background(220);

  for(const ball of ballArray) {
    ball.x += ball.dx*millis()/1000;
    ball.y += ball.dy*millis()/1000;

    if (ball.x+ball.radius >= width || ball.x-ball.radius <= 0) {
      ball.dx = -ball.dx;
    }

    if (ball.y+ball.radius >= height || ball.y-ball.radius <= 0) {
      ball.dy = -ball.dy;
    }

    noStroke();
    fill(ball.red, ball.green, ball.blue, ball.alpha);
    circle(ball.x, ball.y, ball.radius*2);
  }
}

function mousePressed() {
  for(let i = 3; i--;) {
    spawnBall(mouseX, mouseY);
  }
}

function spawnBall(theX,theY) {
  let theBall = {
    x: theX,
    y: theY,
    radius: random(30,70),
    dx: random(-5,5),
    dy: random(-5,5),
    red: random(0,255),
    green: random(0,255),
    blue: random(0,255),
    alpha: random(0,255),
  };

  ballArray.push(theBall);
}