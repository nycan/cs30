// Turbulent pong
// Oct 1, 2024
//
// Extra for Experts:
// Sound effects

let btnWidth;
let btnHeight;

const ballDiam = 25;
let speed;
let rebound;
const maxAngle = 0.45 * Math.PI;
const trails = 4;
const maxTrailAlpha = 150;
const bounceEnergy = 1.18;
let initVel;

const paddleW = 10;
const paddleH = 80;
const lPaddleX = 20;
let rPaddleX;
const paddleSpeed = 10;
const minMove = 5;

const lineWidth = 10;
const lineHeight = 25;
const lineGap = 25;

const lTextX = 100;
let rTextX;
const textY = 50;

const pointsToWin = 10;

let playing = false;

let time = 0;
let cScale = 0.02;
let tScale = 0.008;

let ballX;
let ballY;
let velX = initVel;
let velY = 0;
let lastX = Array(trails).fill(ballX);
let lastY = Array(trails).fill(ballY);

let lPaddle;
let rPaddle;

let lScore = 0;
let rScore = 0;

let pointSound;
let bounceSound;

function setup() {
  createCanvas(windowWidth,windowHeight);
  noStroke();
  pointSound = loadSound("assets/point.mp3");
  bounceSound = loadSound("assets/bounce.mp3");

  btnWidth = windowWidth/2;
  btnHeight = windowHeight/4;
  speed = windowWidth*0.1875;
  rebound = windowWidth*0.03;
  initVel = windowWidth*0.015;
  rPaddleX = windowWidth-lPaddleX-paddleW;
  rTextX = windowWidth-lTextX;
  ballX = windowWidth/2;
  ballY = windowHeight/2;
  lPaddle = windowHeight/2;
  rPaddle = windowHeight/2;
}

function movePaddles() {
  if (keyIsDown(UP_ARROW)) {
    rPaddle = Math.max(paddleH/2,rPaddle-paddleSpeed);
  }
  if (keyIsDown(DOWN_ARROW)) {
    rPaddle = Math.min(windowHeight-paddleH/2,rPaddle+paddleSpeed);
  }
  if (ballY-minMove > lPaddle) {
    lPaddle = Math.min(windowHeight-paddleH/2,lPaddle+paddleSpeed);
  }
  else if (ballY+minMove < lPaddle) {
    lPaddle = Math.max(paddleH/2,lPaddle-paddleSpeed);
  }
}

function turb(x,y) {
  return noise(cScale*x,cScale*y,tScale*time);
}

function createNoise() {
  for(let i = 0; i<windowWidth; ++i){
    for(let j = 0; j<windowHeight; ++j){
      let ns = 255-255*turb(i,j);
      set(i,j,ns);
    }
  }
}

function drawGame() {
  updatePixels();
  
  for(let i = 0; i<trails; ++i) {
    fill(color(0,0,255,maxTrailAlpha*i/trails));
    circle(lastX[i], lastY[i], ballDiam);
  }
  fill("blue");
  circle(ballX, ballY, ballDiam);
  
  rect(rPaddleX,rPaddle-paddleH/2,paddleW,paddleH);
  rect(lPaddleX,lPaddle-paddleH/2,paddleW,paddleH);
  
  text(lScore.toString(),lTextX,textY);
  text(rScore.toString(),rTextX,textY);
  
  for(let y = 0; y <= windowHeight; y+=lineHeight+lineGap) {
    rect(windowWidth/2-lineWidth/2,y,lineWidth,lineHeight);
  }
}

function endGame() {
  lScore = 0;
  rScore = 0;
  playing = false;
}

function endScreen() {
  background(0);
  fill("white");
  textSize(btnHeight-30);
  text(lScore>rScore?"You lose!":"You win!",windowWidth/2,windowHeight/2);
  textSize((btnHeight-30)/2);
  text("Final score: "+lScore.toString()+" : "+rScore.toString(), windowWidth/2, windowHeight/2+btnHeight);
}

function resetState() {
  pointSound.play();

  ballX = windowWidth/2;
  ballY = windowHeight/2;
  
  let sign = (lScore+rScore) % 2?-1:1;
  velX = sign*initVel;
  velY = 0;

  if (Math.max(lScore,rScore) >= pointsToWin) {
    setTimeout(endGame, 5000);
    return;
  }
}

function hitPaddles() {
  if (ballY >= lPaddle-paddleH/2 && ballY <= lPaddle+paddleH/2) {
    if (ballX-ballDiam/2 <= lPaddleX+paddleW){
      bounceSound.play();
      let angle = (ballY-lPaddle)/paddleH*2*maxAngle;
      velX = Math.cos(angle)*rebound;
      velY = Math.sin(angle)*rebound;
      ballX = lPaddleX+paddleW+ballDiam/2;
    }
  }
  
  if (ballY >= rPaddle-paddleH/2 && ballY <= rPaddle+paddleH/2) {
    if (ballX+ballDiam/2 >= rPaddleX){
      bounceSound.play();
      let angle = (ballY-rPaddle)/paddleH*2*maxAngle;
      velX = -Math.cos(angle)*rebound;
      velY = Math.sin(angle)*rebound;
      ballX = rPaddleX-ballDiam/2;
    }
  }
}

function updateState() {
  
  velX += speed*(turb(ballX+1,ballY)-turb(ballX-1,ballY));
  velY += speed*(turb(ballX,ballY+1)-turb(ballX,ballY-1));
  ballX += velX;
  ballY += velY;
  
  if (ballX <= ballDiam/2){
    ++rScore;
    resetState();
  }
  else if (ballX >= windowWidth-ballDiam/2){
    ++lScore;
    resetState();
  }
  
  if (ballY <= ballDiam/2 || ballY >= windowWidth-ballDiam/2) {
    velY = -bounceEnergy*velY;
  }
  hitPaddles();
  
  for(let i = 0; i<trails-1; ++i){
    lastX[i] = lastX[i+1];
    lastY[i] = lastY[i+1];
  }
  lastX[trails-1] = ballX;
  lastY[trails-1] = ballY;
  
  ++time;
}

function playGame() {
  if (Math.max(lScore,rScore) >= pointsToWin) {
    endScreen();
    return;
  }
  movePaddles();
  createNoise();
  drawGame();
  updateState();
}

function startScreen() {
  const colors = ["white", "blue"];
  const xRange = mouseX >= windowWidth/2-btnWidth/2 && mouseX <= windowWidth/2+btnWidth/2;
  const yRange = mouseY >= windowHeight/2-btnHeight/2 && mouseY <= windowHeight/2+btnHeight/2;
  const hovering = xRange && yRange;
  background("black");
  fill(colors[1-hovering]);
  rect(windowWidth/2-btnWidth/2,windowHeight/2-btnHeight/2,btnWidth,btnHeight); 
  fill(colors[int(hovering)]);
  textSize(btnHeight-30);
  textAlign(CENTER,CENTER);
  text("PLAY",windowWidth/2,windowHeight/2);
  if (hovering && mouseIsPressed) {
    playing = true;
  }
}

function draw() {
  if (playing) {
    playGame();
  }
  else {
    startScreen();
  }
}