/**
 * tests.js
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

// stub the document object and Audio for globals.js
document = { body: { offsetWidth: 1024, offsetHeight: 768 } };
Audio = function () {};

require(__dirname + '/globals.js');

var assert = require('assert'),
    utilities = require(__dirname + '/utilities');

describe('utilities', function () {
  describe('#checkCollision()', function () {
    assert.notEqual(undefined, utilities.checkCollision); 

    it('should return true if two rectangle overlap', function () {
      var r1 = {
        position: { x: 0, y: 0 },
        size: { w: 10, h: 10 }
      };

      var r2 = {
        position: { x: 5, y: 5 },
        size: { w: 10, h: 10 }
      };

      assert.equal(utilities.checkCollision(r1, r2), true);
    });

    it('should return false if two rectangle do not overlap', function () {
      var r1 = {
        position: { x: 0, y: 0 },
        size: { w: 10, h: 10 }
      };

      var r2 = {
        position: { x: 20, y: 20 },
        size: { w: 10, h: 10 }
      };

      assert.equal(utilities.checkCollision(r1, r2), false);
    });

    it('should return true if two circles overlap', function () {
      var c1 = {
        position: { x: 0, y: 0 },
        radius: 10
      };

      var c2 = {
        position: { x: 5, y: 5 },
        radius: 10
      };

      assert.equal(utilities.checkCollision(c1, c2), true);
    });

    it('should return false if two circles do not overlap', function () {
      var c1 = {
        position: { x: 0, y: 0 },
        radius: 10
      };

      var c2 = {
        position: { x: 20, y: 20 },
        radius: 10
      };

      assert.equal(utilities.checkCollision(c1, c2), true);
    });

    it('should return true if a rectangle and circle overlap', function () {
      var r = {
        position: { x: 0, y: 0 },
        size: { w: 10, h: 10 }
      };

      var c = {
        position: { x: 5, y: 5 },
        radius: 10
      };

      assert.equal(utilities.checkCollision(r, c), true);
    });

    it('should return false if a rectangle and circle do not overlap', function () {
      var r = {
        position: { x: 0, y: 0 },
        size: { w: 10, h: 10 }
      };

      var c = {
        position: { x: 20, y: 20 },
        radius: 10
      };

      assert.equal(utilities.checkCollision(r, c), false);
    });
  });
});

