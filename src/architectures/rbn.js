// Radial Basis Network

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (layers, biasProbability) {

  if (layers.length < 2) {
    throw "[Neuras] Radial Basis Networks should have at least two layers!";
  };

  var layering = new Array();

  for (var i = 0; i < layers.length - 1; i++) {
    layering.push(new Layer().addNeurones(layers[i], 'tanh').freezeNeurones().addBiases(biasProbability, false));
  };

  layering.push(new Layer().addNeurones(layers[i], 'identity'));

  return new Linkage(layering, true);

};
