// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// Disclaimer: lots of object detection code is from https://editor.p5js.org/tomas.decamino/sketches/qRTOcPD5N

let video;
let font;

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
  createCanvas(displayWidth, displayHeight, WEBGL);
  textFont(font, 25);

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
}

function draw() {
  background(220);
  image(video,0,0);

  text(`${rotationX}, ${rotationY}, ${rotationZ}`,20,20);

  push();
  translate(0,0,70);
  rotateZ(-radians(rotationZ));
  rotateX(-radians(rotationX));
  rotateY(-radians(rotationY));
  box(70,70,70);
  pop();
}
