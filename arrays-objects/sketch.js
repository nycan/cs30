// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let cnv; // Canvas
let video; // Video capture
let cam; // Camera for 3d rendering
let camPos = { // Object for the camera's pos
  x: 0,
  y: 0,
  z: 100
};
let camCenter = {
  x: 0,
  y: 0,
  z: 0
};
const focalX = 50;
const focalY = 50;

// Matrices for the current and previous frame
let currImg, prevImg;
// Features in the current and previous frame
let currFeats, prevFeats;

let loaded = false; // whether openCV is loaded

// Detect features in a frame
function getFeatures() {
  let features = new cv.Mat();
  const maxFeatures = 128;
  const minQuality = 0.01;
  const minDistance = 10;
  
  cv.goodFeaturesToTrack(
    currImg, features, maxFeatures, minQuality, minDistance
  );
  cv.convertPointsToHomogenous(features, prevFeats);
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);

  // Specify the back-facing camera
  const constraints = {
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  };
  //video = createCapture(constraints);
  video = createCapture(VIDEO);
  video.hide();
  
  cam = createCamera();
  setCamera(cam);
}

// given a rotation matrix, apply it to the camera
function applyRotMatrix(mat) {
  let newX = camCenter.X*mat[0]+camCenter.Y*mat[1]+camCenter.Z*mat[2];
  let newY = camCenter.X*mat[3]+camCenter.Y*mat[4]+camCenter.Z*mat[5];
  let newZ = camCenter.X*mat[6]+camCenter.Y*mat[7]+camCenter.Z*mat[8];
  
  camCenter.x = newX;
  camCenter.y = newY;
  camCenter.z = newZ;
}

function draw() {
  if (!loaded) {
    return;
  }
  
  background(220);
  translate(-width/2, -height/2);
  image(video,0,0);
  cnv.image(video,0,0); // extra line so that cnv.elt works
  
  // get frame matrix
  
  currImg = cv.imread(cnv.elt);
  console.log(currImg);
  cv.cvtColor(currImg, currImg, cv.COLOR_RGBA2GRAY);

  if (!prevFeats) {
    getFeatures();
    return;
  }
  
  // calculate optical flow for features
  let status = new cv.Mat();
  let err = new cv.Mat();
  cv.calcOpticalFlowPyrLK(
    prevImg, currImg, prevFeats, currFeats, status, err
  );
  
  //https://en.wikipedia.org/wiki/Essential_matrix
  const cameraMat = cv.matFromArray(3, 3, cv.CV_64F, [
    focalX, 0, cnv.width/2,
    0, focalY, cnv.height/2,
    0, 0, 1
  ]);
  let essentialMat = cv.findEssentialMat(
    prevFeats, currFeats, cameraMat
  );
  
  // get transformations from essential matrix
  let rot = new cv.Mat();
  let trans = new cv.Mat();
  cv.recoverPose(
    essentialMat, prevFeats, currFeats, cameraMat,
    rot, trans, new cv.Mat()
  );
  
  // apply transformations
  camPos.x += trans.data64F[0];
  camPos.y += trans.data64F[1];
  camPos.z += trans.data64F[2];
  
  applyRotMatrix(rot.data64F);
  
  cam.setPosition(camPos.x, camPos.y, camPos.z);
  cam.lookAt(camCenter.x, camCenter.y, camCenter.z);
  
  push();
  translate(0,0,70);
  box(70,70,70);
  pop();
  
  prevFeats = currFeats;
  prevImg = currImg;
}

// load openCV (not my code)
window.addEventListener("load", (event) => {
  let script = document.createElement("script");
  script.addEventListener("load", (event) => {
    cv.onRuntimeInitialized = () => {
      loaded = true;
    };
  });

  script.src = "https://docs.opencv.org/4.x/opencv.js";
  document.body.appendChild(script);
});
