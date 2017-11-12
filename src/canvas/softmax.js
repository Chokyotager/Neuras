var Layer = require('../classes/Layer');
var Gate = require('../classes/Gate');
var Linkage = require('../classes/Linkage');

module.exports = function (squash) {
  var one = new Layer('input').addNeurones(1, squash).addBuffers(1);
  var two = new Layer('hidden').addGates(1, 'softmax');

  return new Linkage([one, two], true);
};
