// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let video;
let font;
let cam;

let flow;
let pPixels;


let hasSensorPermission = !(DeviceOrientationEvent.requestPermission || DeviceMotionEvent.requestPermission);

function begPermission(){
  if (DeviceOrientationEvent.requestPermission){
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          if (DeviceMotionEvent.requestPermission){
            DeviceMotionEvent.requestPermission()
              .then(response => {
                if (response === 'granted') {
                  hasSensorPermission = true;
                }
              })
              .catch(alert);
          }
        }
      })
      .catch(alert);
  }
}

function touchEnded() {
  if (!hasSensorPermission){
    begPermission();
  }
}


function preload() {
  font = loadFont(
    "https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf"
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(font, 25);
  angleMode(RADIANS);

  const constraints = {
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  };
  video = createCapture(constraints);
  video.hide();
  
  //cam = createCamera();
  //setCamera(cam);
  
  flow = new FlowCalculator(48);
}

function draw() {
  video.loadPixels();
  if (video.pixels.length === 0) {
    return;
  }
  
  if (pPixels) {
    if (same(pPixels, video.pixels, 4, width)) {
      return;
    }
    flow.calculate(pPixels, video.pixels, video.width, video.height);
  }
  
  background(220);
  translate(-width/2, -height/2);
  image(video,0,0);
  
  //cam.lookAt(0,0,0);
  if (flow.zones) {
    for (const zone of flow.zones) {
      push();
      translate(zone.pos.x, zone.pos.y);
      rotate(zone.angle);
      strokeWeight(2);
      stroke(255);
      line(0,0, zone.mag,0);
      line(zone.mag,0, zone.mag-5,-5);
      line(zone.mag,0, zone.mag-5,5);
      pop();
    }
  }
  
  // copying what the library does, to find the nearest vector.
  const winStep = 
  const numX = floor((width-2*(flow.step+1))/(2*flow.step+1));

  let closestX = round((100-flow.step-1)/(2*flow.step+1));
  let closestY = round((100-flow.step-1)/(2*flow.step+1));
  closestX = max(closestX, 0); closestY = max(closestY, 0);
  closestX = min()
  
  push();
  translate(0,0,70);
  box(70,70,70);
  pop();
  
  pPixels = copyImage(video.pixels, pPixels);
}
