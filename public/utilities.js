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

