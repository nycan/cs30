
function draw2d() {
  rect(0,0,10,10);
}

/*
function linePlaneCollide(guest) {

}

function mousePressed() {
  if (mouseButton === LEFT) {
    return;
  }
  for (const guest of guests) {
    if (guest === me) {
      continue;
    }
    // immediately filter out people we can't hit
    let dst = dist(guest.x,guest.y,guest.z,me.x,me.y,me.z);
    if (dst > Math.hypot(playerHead/2+playerBody,sqrt(2)*playerWidth)+reach) {
      continue;
    }
  }
}
  */