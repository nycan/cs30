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
let paddleSpeed;
const minMove = 5;

const lineWidth = 10;
const lineHeight = 25;
const lineGap = 25;

const lTextX = 100;
let rTextX;
let textY;

const pointsToWin = 10;

let playing = false;

let time = 0;
let cScale = 0.02;
let tScale = 0.008;

let ballX;
let ballY;
let velX;
let velY = 0;
let lastX;
let lastY;

let lPaddle;
let rPaddle;

let lScore = 0;
let rScore = 0;

let pointSound;
let bounceSound;

let bgBuffer;

function setup() {
  createCanvas(windowWidth,windowHeight);
  noStroke();
  pointSound = loadSound("assets/point.mp3");
  bounceSound = loadSound("assets/bounce.mp3");

  btnWidth = round(windowWidth/2);
  btnHeight = round(windowHeight/4);

  speed = round(windowWidth*2);
  rebound = round(windowWidth*0.45);
  initVel = round(windowWidth*0.225);

  rPaddleX = windowWidth-lPaddleX-paddleW;
  rTextX = windowWidth-lTextX;
  textY = btnHeight;

  ballX = round(windowWidth/2);
  ballY = round(windowHeight/2);

  lPaddle = round(windowHeight/2);
  rPaddle = round(windowHeight/2);

  lastX = Array(trails).fill(ballX);
  lastY = Array(trails).fill(ballY);

  velX = initVel;

  paddleSpeed = round(windowHeight);

  bgBuffer = createGraphics(windowWidth, windowHeight);

  setInterval(async () => {
    if (playing) {
      createNoise();
    }
  }, 1000);
}

function movePaddles() {
  let fps = frameRate();

  if (keyIsDown(UP_ARROW)) {
    rPaddle = Math.max(paddleH/2,rPaddle-paddleSpeed/fps);
  }
  if (keyIsDown(DOWN_ARROW)) {
    rPaddle = Math.min(windowHeight-paddleH/2,rPaddle+paddleSpeed/fps);
  }
  if (ballY-minMove > lPaddle) {
    lPaddle = Math.min(windowHeight-paddleH/2,lPaddle+paddleSpeed/fps);
  }
  else if (ballY+minMove < lPaddle) {
    lPaddle = Math.max(paddleH/2,lPaddle-paddleSpeed/fps);
  }
}

function turb(x,y) {
  return noise(cScale*x,cScale*y,tScale*time);
}

async function createNoise() {
  bgBuffer.loadPixels();
  for(let i = 0; i<windowWidth; ++i){
    for(let j = 0; j<windowHeight; ++j){
      let ns = 255-255*turb(i,j);
      let ind = (j*windowWidth + i)*4;
      
      for(let c = 0; c<3; ++c) {
        bgBuffer.pixels[ind+c] = ns;
      }
      bgBuffer.pixels[ind+3] = 255;
    }
  }
  bgBuffer.updatePixels();
}

function drawGame() {
  image(bgBuffer,0,0);
  
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
  velX = sign*initVel/frameRate();
  velY = 0;

  if (Math.max(lScore,rScore) >= pointsToWin) {
    setTimeout(endGame, 5000);
    return;
  }
}

function hitPaddles() {
  let fps = frameRate();

  if (ballY >= lPaddle-paddleH/2 && ballY <= lPaddle+paddleH/2) {
    if (ballX-ballDiam/2 <= lPaddleX+paddleW){
      bounceSound.play();
      let angle = (ballY-lPaddle)/paddleH*2*maxAngle;
      velX = Math.cos(angle)*rebound/fps;
      velY = Math.sin(angle)*rebound/fps;
      ballX = lPaddleX+paddleW+ballDiam/2;
    }
  }
  
  if (ballY >= rPaddle-paddleH/2 && ballY <= rPaddle+paddleH/2) {
    if (ballX+ballDiam/2 >= rPaddleX){
      bounceSound.play();
      let angle = (ballY-rPaddle)/paddleH*2*maxAngle;
      velX = -Math.cos(angle)*rebound/fps;
      velY = Math.sin(angle)*rebound/fps;
      ballX = rPaddleX-ballDiam/2;
    }
  }
}

function updateState() {
  let fps = frameRate();

  velX += speed/fps*(turb(ballX+1,ballY)-turb(ballX-1,ballY));
  velY += speed/fps*(turb(ballX,ballY+1)-turb(ballX,ballY-1));
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
  
  if (ballY <= ballDiam/2 || ballY >= windowHeight-ballDiam/2) {
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
    createNoise();
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