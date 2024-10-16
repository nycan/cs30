// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let video;
let font;
let cam;

let vel = {
  x: 0,
  y: 0,
  z: 0
}

let pos = {
  x: 0,
  y: 0,
  z: 0
}

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
}

function draw() {
  background(220);
  //image(video,0,0);
  
  vel.x += 10*accelerationX;
  vel.y += 10*accelerationY;
  vel.z += 10*accelerationZ;
  
  pos.x = vel.x;
  pos.y = vel.y;
  pos.z = vel.z;
  
  text(`${pos.x},${pos.y},${pos.z}`)
  
  cam.setPosition(pos.x, pos.y, pos.z);
  cam.lookAt(0,0,0);

  push();
  translate(0,0,70);
  //rotateY(rotationZ);
  //rotateX(rotationX);
  //rotateZ(rotationY);
  box(70,70,70);
  pop();
}
