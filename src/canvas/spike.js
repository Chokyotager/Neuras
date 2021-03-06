var Layer = require('../classes/Layer');
var Gate = require('../classes/Gate');
var Linkage = require('../classes/Linkage');

module.exports = function (squash, threshold, iterative) {
  var one = new Layer().addNeurones(1, squash);
  var two = new Layer().addGates(1, 'spike', {threshold: threshold, iterative: iterative});

  var linkage = new Linkage([one, two], true);

  return linkage;
};
