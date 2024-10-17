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

  normalMaterial();
  
  cam = createCamera();
  setCamera(cam);
  
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
  image(video,0,0);
  
  cam.lookAt(0,0,0);
  
  if (flow.zones) {
    for (const zone of flow.zones) {
      
    }
  }

  //push();
  //translate(0,0,70);
  ////rotateY(rotationZ);
  ////rotateX(rotationX);
  ////rotateZ(rotationY);
  //box(70,70,70);
  //pop();
  
}