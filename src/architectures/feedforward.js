// Feedforward

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (layers) {
  var layered = new Array();

  for (var i = 0; i < layers.length; i++) {
    layered.push(new Layer().addNeurones(layers[i]));
  };

  return new Linkage(layered, true);
};
