// Feedforward

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (layers, squash, bias_probability, seed) {
  var layered = new Array();

  typeof bias_probability !== 'number' ? bias_probability = 0.5 : null;

  for (var i = 0; i < layers.length; i++) {
    layered.push(new Layer().addNeurones(layers[i], squash).addBiases(bias_probability, false, seed));
  };

  return new Linkage(layered, true);
};
