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

