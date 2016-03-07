/**
 * main.js
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

(function () {

  'use strict';

  require('./globals.js');
  var utilities = require('./utilities.js');

  // INIT CANVAS -----------------------------------

  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');

  if (!context || !window.addEventListener) {
    var unsupported = document.querySelector('#unsupported');
    unsupported.style.display = 'block';
    return;
  }

  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  // END INIT CANVAS -------------------------------

  // DRAWING / UPDATE FUNCTIONS --------------------------

  /**
   * drawSky()
   * @description: clears the canvas using a sky color
   */
  function drawSky() {
    context.fillStyle = '#407876'; // '#73abc9';
    context.fillRect(0, 0, canvas.width, canvas.height);

    var grd = context.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

    context.fillStyle = grd;
    context.fillRect(0, 0, canvas.width, canvas.height);

    updateRain();
    updateClouds();
  }

  var rain = [];
  var RAIN_PARTICLES = 600;
  function updateRain() {
    for (var i = 0; i < rain.length; i++) {
      if (rain[i].y > canvas.height * 2)
        rain.splice(i, 1);

      rain[i].y += rain[i].speed;
      
      context.save();
      context.fillStyle = 'rgba(120, 120, 200, 0.5)';
      context.translate(canvas.width / -2, canvas.height / -2);
      context.rotate(Math.PI / 8);
      context.fillRect(rain[i].x, rain[i].y, 1, rain[i].length);
      context.restore();
    }

    if (rain.length < RAIN_PARTICLES) {
      for (var i = rain.length; i < RAIN_PARTICLES; i++)
        rain.push({
          x: Math.floor(Math.random() * canvas.width * 2),
          y: Math.floor(Math.random() * -41) - canvas.height / 2,
          speed: Math.random() * 12 + 8,
          length: (Math.random() * 10 + 1) + 10
        }); 
    }
  }

  var clouds = [];
  var CLOUD_PARTICLES = 500;
  function updateClouds() {
    context.save();
    for (var i = 0; i < clouds.length; i++) {
      if (clouds[i].x < -60)
        clouds.splice(i, 1);

      clouds[i].x -= clouds[i].speed;

      context.fillStyle = 'rgba(20, 20, 20, ' + clouds[i].o + ')';
      context.beginPath();

      var centerX = clouds[i].x;
      var centerY = clouds[i].y;
      var width = clouds[i].w;
      var height = clouds[i].h;
        
      context.moveTo(centerX, centerY - height/2); // A1
          
      context.bezierCurveTo(
        centerX + width/2, centerY - height/2, // C1
        centerX + width/2, centerY + height/2, // C2
        centerX, centerY + height/2); // A2

        context.bezierCurveTo(
          centerX - width/2, centerY + height/2, // C3
          centerX - width/2, centerY - height/2, // C4
          centerX, centerY - height/2); // A1

      context.fill();
      context.closePath();
    }
    context.restore();

    if (clouds.length < CLOUD_PARTICLES) {
      for (var i = clouds.length; i < CLOUD_PARTICLES; i++)
        clouds.push({
          x: Math.floor(Math.random() * 200) + canvas.width,
          y: Math.random() * 60,
          w: Math.random() * 160 + 80,
          h: Math.random() * 40 + 20,
          o: Math.random() / 2,
          speed: Math.random() * 3 + 1
        });
    }
  }

  /**
   * drawScore()
   * @description: draws the player's score
   */
  function drawScore() {
    var scoreText = (ship.score) ? ship.score + ' Gold Doubloons!' : '0 Gold Doubloons';

    context.font = '32px Chunk Five';
    context.strokeStyle = '#cec745';
    context.fillStyle = '#fdd017';
    context.lineWidth = 3;
    context.strokeText(scoreText, 10, 41);
    context.fillText(scoreText, 10, 40);

    if (highScore) {
      var highScoreText = (isHighScore) ? 'New High Score: ' + ship.score + '!' : 'High Score: ' + highScore;

      context.strokeText(highScoreText, 10, 81);
      context.fillText(highScoreText, 10, 82);
    }
  }

  /**
   * updateWater()
   * @description: updates the wave and draws the water
   */
  function updateWater() {
    for (var p = 0; p < partials.length; p++)
      partials[p].phase += partials[p].shift;

    context.save();
    context.fillStyle = 'rgba(40, 47, 120, 0.9)'; // 'rgba(10, 67, 118, 0.8)';
    context.translate(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    context.beginPath();
    for (var s = -SAMPLE_RATE / 2; s <= SAMPLE_RATE / 2; s++) {
      var x = canvas.width / SAMPLE_RATE * s,
          y = utilities.getWaveHeight(partials, x);
      context.lineTo(x, y);
    }
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(-canvas.width, canvas.height);
    context.closePath();
    context.fill();

    var grd = context.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

    context.fillStyle = grd;
    context.fill();

    context.restore();
  }

  /**
   * updateBall()
   * @description: updates the ball's position, checks for collisions, and draws the ball
   */
  function updateBall() {
    if (ball.dead || ship.dead)
      return;

    ball.position.x += ball.velocity.x;
    ball.position.y -= ball.velocity.y;
    ball.velocity.y -= 0.2;

    if (!ball.dead && !utilities.checkOnScreen(ball))
      ball.dead = true;
    else if (!ball.dead && !barrel.dead && utilities.checkCollision(ball, barrel)) {
      ball.dead = true;
      barrel.dead = true;

      utilities.increaseScore();
      utilities.resetBarrel();
    }

    context.save();
    context.fillStyle = '#343434';
    context.translate(SCREEN_WIDTH / 2 + ball.position.x, SCREEN_HEIGHT / 2 + ball.position.y);
    context.beginPath();
    context.arc(0, 0, ball.radius, 0, 2 * Math.PI, false);
    context.closePath();
    context.fill();
    context.restore();
  }

  /**
   * updateShip()
   * @description: updates the ship's position and draws the ship
   */
  function updateShip() {
    if (ship.dead)
      return;

    var y = utilities.getWaveHeight(partials, ship.position.x) - ship.position.y;

    ship.rotation = utilities.getWaveRotation(partials, ship);
    ship.position.x += ship.direction * SHIP_SPEED;

    context.save();
    context.translate(SCREEN_WIDTH / 2 + ship.position.x, SCREEN_HEIGHT / 2 + y);
    context.rotate(ship.rotation);
    context.drawImage(shipImage, -ship.size.w / 2, -ship.size.h / 2, ship.size.w, ship.size.h);
    context.restore();
  }

  /**
   * updateBarrel()
   * @description: updates the barrel's position, checks for collisions, and draws the barrel
   */
  function updateBarrel() {
    if (barrel.dead)
      return;

    barrel.position.x -= barrel.velocity;
    barrel.position.y = utilities.getWaveHeight(partials, barrel.position.x);
    barrel.rotation = utilities.getWaveRotation(partials, barrel);

    if (!barrel.dead && !utilities.checkOnScreen(barrel)) {
      barrel.dead = true;
      utilities.resetBarrel();
    } else if (!barrel.dead && !ship.dead && utilities.checkCollision(barrel, ship)) {
      /**
       * Uncomment this block to make the player die when hit by the barrel.
       *
       * barrel.dead = true;
       * ship.dead = true;
       * ball.dead = true;
       * utilities.resetBarrel();
       */
    }

    context.save();
    context.translate(SCREEN_WIDTH / 2 + barrel.position.x, SCREEN_HEIGHT / 2 + barrel.position.y);
    context.rotate(barrel.rotation);
    context.drawImage(barrelImage, -barrel.size.w / 2, -barrel.size.h / 2, barrel.size.w, barrel.size.h);
    context.restore();
  }

  // END DRAWING FUNCTIONS ----------------------

  // LOAD ASSETS & MAIN LOOP -----------------------------

  /**
   * loop()
   * @description: updates the game objects and draws the scene
   */
  function loop() {
    drawSky();
    context.save();
    context.translate(0, 100);
      updateBall();
      // updateBarrel();
      updateShip();
      updateWater();
    context.restore();
    // drawScore();

    requestAnimationFrame(loop);
  }

  scoreAudio.src = 'audio/score.wav';
  highScoreAudio.src = 'audio/high_score.wav';

  var shipImage,
      barrelImage;

  utilities.getHighScore(function (score) {
    if (score)
      highScore = score;
  });

  utilities.loadImages(['images/ship.png', 'images/barrel.png'], function (images) {
    if (!images)
      return alert('Failed to load images!');

    shipImage = images[0];
    barrelImage = images[1];

    loop();
  });

  // END LOAD ASSETS & MAIN LOOP -------------------------

  // HANDLE INPUT ----------------------------

  /**
   * shoot()
   * @description: fires the player's cannon
   */
  function shoot() {
    if (!ball.dead || ship.dead)
      return;

    ball.dead = false;
    ball.position.x = ship.position.x;
    ball.position.y = utilities.getWaveHeight(partials, ship.position.x) - ship.position.y + 100;
    ball.velocity.x = ball.speed * Math.sin(ship.rotation + Math.PI / 4);
    ball.velocity.y = ball.speed * Math.cos(ship.rotation + Math.PI / 4);
  }

  // disable touch scroll "bounce" on mobile devices
  window.addEventListener('touchmove', function (event) {
    event.preventDefault();
  });

  window.addEventListener('touchend', shoot);

  window.addEventListener('keydown', function (event) {
    switch (event.which) {
      case 39:
        ship.direction = 1;
        break;
      case 37:
        ship.direction = -1;
        break;
      default:
        shoot();
    }
  });

  window.addEventListener('keyup', function (event) {
    switch (event.which) {
      case 39:
      case 37:
        ship.direction = 0;
        break;
      default:
        break;
    }
  });

  // END HANDLE INPUT -------------------------

})();

