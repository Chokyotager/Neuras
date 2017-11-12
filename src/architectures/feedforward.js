// Feedforward

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (layers) {
  var layered = new Array();

  if (layers.length < 2) {
    throw "[Neuras] Should have at least two layers!";
  };

  layered.push(new Layer('input').addNeurones(layers[0]));
  for (var i = 1; i < layers.length; i++) {
    layered.push(new Layer('hidden').addNeurones(layers[i]));
  };

  return new Linkage(layered, true);
};
