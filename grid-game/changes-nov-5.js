function lightScene() {
    noLights();
    ambientLight(20);
  
    for (const player of guests) {
      spotLight(
        color(150),
        player.x,player.y,player.z,
        sin(player.rot),sin(player.tilt),cos(player.rot)
      );
    }
  }

  lightScene();

  noStroke();
  ambientMaterial(255);
  specularMaterial(150);