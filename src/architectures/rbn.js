// Radial Basis Network

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (layers, biasProbability, weightedBiases) {

  if (layers.length < 2) {
    throw "[Neuras] Radial Basis Networks should have at least two layers!";
  };

  var layering = new Array();

  for (var i = 0; i < layers.length - 1; i++) {
    layering.push(new Layer().addNeurones(layers[i], 'tanh').addBiases(biasProbability, weightedBiases));
  };

  layering.push(new Layer().addGates(layers[layers.length - 1], 'additive'));

  return new Linkage(layering, true);

};
