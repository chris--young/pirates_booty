(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * globals.js
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

SCREEN_WIDTH = document.body.offsetWidth;
SCREEN_HEIGHT = document.body.offsetHeight;
SAMPLE_RATE = 64;

scoreAudio = new Audio();
highScoreAudio = new Audio();
highScore = undefined;
isHighScore = false;

partials = [
  { amplitude: 20, period: 0.0004, phase: 0.75, shift: 0.005 },
  { amplitude: 15, period: 0.001, phase: 0.5, shift: 0.04 },
  { amplitude: 10, period: 0.003, phase: 0.6, shift: 0.1 },
  { amplitude: 10, period: 0.004, phase: 0.8, shift: 0.04 },
  { amplitude: 4, period: 0.02, phase: 0.5, shift: 0.08 }
];

ship = {
  position: { x: -SCREEN_WIDTH * 0.2, y: 110 },
  size: { w: 233, h: 264 },
  rotation: 0,
  score: 0,
  dead: false
};

ball = {
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  radius: 10,
  speed: 10,
  dead: true
};

barrel = {
  position: { x: SCREEN_WIDTH / 2 + 43, y: 0 },
  size: { w: 89, h: 67 },
  rotation: 0,
  velocity: 2,
  dead: false
};


},{}],2:[function(require,module,exports){
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
    context.fillStyle = '#73abc9';
    context.fillRect(0, 0, canvas.width, canvas.height);
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
    context.fillStyle = 'rgba(10, 67, 118, 0.8)';
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
    context.fillStyle = '#676767';
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
    drawScore();

    context.save();
    context.translate(0, 100);
      updateBall();
      updateBarrel();
      updateShip();
      updateWater();
    context.restore();

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
  window.addEventListener('keyup', shoot);

  // END HANDLE INPUT -------------------------

})();


},{"./globals.js":1,"./utilities.js":3}],3:[function(require,module,exports){
/**
 * utilites.js
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

require('./globals.js');

/**
 * vector()
 * @param: <Number> x
 * @param: <Number> y
 * @returns: <Object>
 */
function vector(x, y) {
  return {
    x: (x) ? x : 0,
    y: (y) ? y : 0
  };
}

/**
 * distance()
 * @param: <Vector> v1
 * @param: <Vector> v2
 * @returns: <Number>
 */
function distance(v1, v2) {
  var a = v2.x - v1.x,
      b = v2.y - v1.y;

  return Math.sqrt(Math.pow(a, 2), Math.pow(b, 2));
}

/**
 * loadImages()
 * @param: <Array> sources
 * @param: <Function> callback
 */
exports.loadImages = function (sources, callback) {
  var images = [],
      loaded = 0,
      failed = 0;

  function error(event) {
    if (++failed + loaded == images.length)
      callback();
  }

  function load(event) {
    if (++loaded + failed == images.length)
      callback(images);
  }

  for (var s = 0; s < sources.length; s++) {
    images[s] = new Image();
    images[s].src = sources[s];
    images[s].addEventListener('error', error);
    images[s].addEventListener('load', load);
  }
};

/**
 * checkCollision()
 * @param: <Object> o1
 * @param: <Object> o2
 * @returns: <Boolean>
 */
exports.checkCollision = function (o1, o2) {
  if (!isNaN(o1.radius) && o2.size) {
    var temp = o1;

    o1 = o2;
    o2 = temp;
  }

  if (o1.size && !isNaN(o2.radius)) {
    var d = vector(Math.abs(o2.position.x - o1.position.x), Math.abs(o2.position.y - o1.position.y));

    if (d.x > o1.size.w / 2 + o2.radius || d.y > o1.size.h / 2 + o2.radius)
      return false;

    if (d.x <= o1.size.w / 2 || d.y <= o1.size.h / 2)
      return true;

    return (Math.pow(d.x - o1.size.w / 2, 2) + Math.pow(d.y - o1.size.h / 2, 2) <= Math.pow(o2.radius, 2));
  }

  if (o1.size && o2.size) {
    var top1 = o1.position.y + o1.size.h / 2,
        top2 = o2.position.y + o2.size.h / 2,
        right1 = o1.position.y + o1.size.w / 2,
        right2 = o2.position.x + o2.size.w / 2,
        bottom1 = o1.position.y - o1.size.h / 2,
        bottom2 = o2.position.y - o2.size.h / 2,
        left1 = o1.position.x - o1.size.w / 2,
        left2 = o2.position.x - o2.size.w / 2;

    return (left1 <= right2 && right1 >= left2 && top1 >= bottom2 && bottom1 <= top2);
  }
};

/**
 * checkOnScreen()
 * @param: <Object> o
 * @returns: <Boolean>
 */
exports.checkOnScreen = function (o) {
  var screen = {
    position: vector(0, 0),
    size: { w: SCREEN_WIDTH, h: SCREEN_HEIGHT }
  };

  return exports.checkCollision(screen, o);
};

/**
 * getWaveHeight()
 * @param: <Array> partials
 * @param: <Number> x
 * @returns: <Number>
 */
exports.getWaveHeight = function (partials, x) {
  var y = 0;

  for (var p = 0; p < partials.length; p++)
    y += partials[p].amplitude * Math.sin(partials[p].period * x + partials[p].phase);

  return y;
};

/**
 * getWaveRotation()
 * @param: <Array> ps
 * @param: <Object> o
 * @returns: <Number>
 */
exports.getWaveRotation = function (partials, o) {
  var x1 = o.position.x - o.size.w / 4,
      x2 = o.position.x + o.size.w / 4,
      y1 = exports.getWaveHeight(partials, x1),
      y2 = exports.getWaveHeight(partials, x2);

  return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * resetBarrel()
 * @description: causes the barrel to re-enter the scene after a few seconds
 */
exports.resetBarrel = function () {
  function moveBarrel() {
    barrel.dead = false;
    barrel.position.x = SCREEN_WIDTH / 2 + barrel.size.w / 2 - 1;
    barrel.position.y = 100;
  }

  setTimeout(moveBarrel, Math.floor(Math.random() * 4000 - 1000) + 1000);
};

/**
 * increaseScore()
 * @description: slowly updates the score by a few points
 */
exports.increaseScore = function () {
  var points = Math.floor(Math.random() * 10 - 1) + 10; 

  function updateScore(points) {
    if (!points)
      return exports.checkHighScore();

    ship.score++;
    setTimeout(function () {
      updateScore.call(this, --points);
    }, 100);
  }
  
  scoreAudio.play();
  updateScore(points);
};

/**
 * getHighScore()
 * @description: gets the current high score from the back end
 * @param: <Function> callback
 */
exports.getHighScore = function (callback) {
  var request = new XMLHttpRequest(),
      response;

  request.onreadystatechange = function () {
    if (request.readyState != 4)
      return;

    if (request.status != 200)
      return callback();

    try {
      response = JSON.parse(request.responseText);
    } catch (exception) {
      return callback();
    }

    callback(response);
  };

  request.open('GET', '/score', true);
  request.send();
};

/**
 * checkHighScore()
 * @description: checks with the server to see if the user's score is the new high score
 */
exports.checkHighScore = function () {
  var request = new XMLHttpRequest(),
      requestBody = JSON.stringify({ score: ship.score }),
      response;

  request.onreadystatechange = function () {
    if (request.readyState != 4)
      return;

    if (request.status == 201) {
      if (!isHighScore)
        highScoreAudio.play();

      isHighScore = true;
    }

    if (request.status == 204)
      isHighScore = false;
  };

  request.open('POST', '/score', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
};


},{"./globals.js":1}]},{},[2]);
