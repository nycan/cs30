// ignore this... this was just for testing something

const sz = 100;
let model;

function setup() {
  createCanvas(200,200, WEBGL);
  model = buildGeometry(()=>menger(5));

  let saveButton = createButton("abc");
  saveButton.mousePressed(()=> model.saveStl('level5.stl',{binary: true}));
}

function menger(n) {
  console.log(n);
  if (n === 0) {
    box(sz);
    return;
  }

  push();
  scale(1/3);
  for(let x = 0; x<3; ++x) {
    for(let y = 0; y<3; ++y) {
      for(let z = 0; z<3; ++z) {
        if((x===1)+(y===1)+(z===1) >= 2) {
          continue;
        }

        push();
        translate(sz*(x-1),sz*(y-1),sz*(z-1));
        menger(n-1);
        pop();
      }
    }
  }
  pop();
}
