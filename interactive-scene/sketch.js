const width = 400;
const height = 400;

const btnWidth = 200;
const btnHeight = 100;

const ballDiam = 25;
const speed = 75;
const rebound = 12;
const maxAngle = 0.45 * Math.PI;
const trails = 4;
const maxTrailAlpha = 150;
const bounceEnergy = 1.18;
const initVel = 6;

const paddleW = 10;
const paddleH = 80;
const lPaddleX = 20;
const rPaddleX = 370;
const paddleSpeed = 10;
const minMove = 5;

const lineWidth = 10;
const lineHeight = 25;
const lineGap = 25;

const lTextX = 100;
const rTextX = 300;
const textY = 50;

let playing = false;

let time = 0;
let cScale = 0.02;
let tScale = 0.008;

let ballX = width/2;
let ballY = height/2;
let velX = initVel;
let velY = 0;
let lastX = Array(trails).fill(ballX);
let lastY = Array(trails).fill(ballY);

let lPaddle = height/2;
let rPaddle = height/2;


let lScore = 0;
let rScore = 0;

let pointSound;
let bounceSound;

function setup() {
  createCanvas(width,height);
  noStroke();
  pointSound = loadSound("assets/point.mp3");
  bounceSound = loadSound("assets/bounce.mp3");
}

function movePaddles() {
  if (keyIsDown(UP_ARROW))
    rPaddle = Math.max(paddleH/2,rPaddle-paddleSpeed);
  if (keyIsDown(DOWN_ARROW))
    rPaddle = Math.min(height-paddleH/2,rPaddle+paddleSpeed);
  
  if (ballY-minMove > lPaddle)
    lPaddle = Math.min(height-paddleH/2,lPaddle+paddleSpeed);
  else if (ballY+minMove < lPaddle)
    lPaddle = Math.max(paddleH/2,lPaddle-paddleSpeed);
}

function turb(x,y) {
  return noise(cScale*x,cScale*y,tScale*time);
}

function createNoise() {
  for(let i = 0; i<width; ++i){
    for(let j = 0; j<height; ++j){
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
  
  for(let y = 0; y <= height; y+=lineHeight+lineGap) 
    rect(width/2-lineWidth/2,y,lineWidth,lineHeight);
}

function endGame() {
  lScore = 0;
  rScore = 0;
  playing = false;
}

function endScreen() {
  background(0);
  text(lScore>rScore?"You lose!":"You win!",width/2,height/2);
  textSize((btnHeight-30)/2);
  text("Final score: "+lScore.toString()+" : "+rScore.toString(), width/2, height/2+btnHeight);
}

function resetState() {
  pointSound.play();

  ballX = width/2;
  ballY = height/2;
  
  let sign = (lScore+rScore) % 2?-1:1;
  velX = sign*initVel;
  velY = 0;

  if (Math.max(lScore,rScore) >= 10) {
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
  } else if (ballX >= width-ballDiam/2){
    ++lScore;
    resetState();
  }
  
  if (ballY <= ballDiam/2 || ballY >= width-ballDiam/2)
    velY = -bounceEnergy*velY;
  
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
  if (Math.max(lScore,rScore) >= 10) {
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
  const xRange = mouseX >= width/2-btnWidth/2 && mouseX <= width/2+btnWidth/2;
  const yRange = mouseY >= height/2-btnHeight/2 && mouseY <= height/2+btnHeight/2;
  const hovering = xRange && yRange;
  background("black");
  fill(colors[1-hovering]);
  rect(width/2-btnWidth/2,height/2-btnHeight/2,btnWidth,btnHeight); 
  fill(colors[int(hovering)]);
  textSize(btnHeight-30);
  textAlign(CENTER,CENTER);
  text("PLAY",width/2,height/2);
  if (hovering && mouseIsPressed)
    playing = true;
}

function draw() {
  if (playing)
    playGame();
  else
    startScreen();
}