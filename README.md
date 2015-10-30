# Pirate's Booty: An introduction to HTML5 Canvas

### Author: __Chris Young__ [cyoung@mobiquityinc.com](mailto:cyoung@mobiquityinc.com)

Pirate's Booty is a simple game I made for a presentation I gave at Mobiquity on HTML5 Canvas. The game illustrates the basic functionality of the CanvasRenderingContext2D API. You can play it at [chrisyou.ng/pirates_booty](https://www.chrisyou.ng/pirates_booty). Press any key, or touch anywhere on mobile devices, to shoot your ship's cannon. Destroy barrels to earn gold doubloons. Aim for the high score!

## Dependencies
````
➜ brew install node
➜ npm install -g browserify
➜ npm install -g mocha
````

## Setup
````
➜ git clone git@github.com:chris--young/pirates_booty.git
➜ cd pirates_booty
➜ npm install 
````

## Build Front-end
````
➜ browserify public/main.js > public/bundle.js
````

## Start Back-end
````
➜ node server.js
````

## Test
````
➜ npm test
````

