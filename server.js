/**
 * server.js
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express(),
    server;
    
var highScore = require(__dirname + '/high_score.json');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (request, response) {
  response.sendFile('/index.html');
});

app.get('/score', function (request, response) {
  response.json(highScore.score);
});

app.post('/score', function (request, response) {
  if (request.body.score <= highScore.score)
    return response.sendStatus(204);

  var newHighScore = JSON.stringify({ score: request.body.score });
  highScore.score = request.body.score;

  fs.writeFile(__dirname + '/high_score.json', newHighScore, function (error) {
    if (error)
      return response.sendStatus(500);

    response.sendStatus(201);
  });
});

server = app.listen(8421, function () {
  var host = server.address().address,
      port = server.address().port;

  console.log('listening on http://%s:%s', host, port);
});

