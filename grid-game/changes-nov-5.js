const maxXP = 100;
const maxXPrad = 15;
const minXPrad = 3;

xp = Array(xCells).fill().map(
  (x) => Array(zCells).fill(0)
);
setInterval(spawnXP, 20);

function spawnXP() {
  let randX = floor(random(xCells));
  let randZ = floor(random(zCells));

  xp[randX][randZ] = min(xp[randX][randZ]+1, maxXP);
}

function drawXP() {
  emissiveMaterial(34, 240, 54);
  for(let i = 0; i<xCells; ++i) {
    for(let j = 0; j<zCells; ++j) {
      if (!xp[i][j]) {
        continue;
      }
      let rad = lerp(1,maxXPrad, xp[i][j]/maxXP);

      push();
      translate(
        cellSize*(-xCells/2 + i + 1/2),
        wallHeight/2-rad,
        cellSize*(-zCells/2 + j + 1/2)
      );
      sphere(rad);
      pop();
    }
  }
  emissiveMaterial(0);
}