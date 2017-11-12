// LSTM

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');
var Canvas = require('../canvas');

module.exports = function (layers) {
  var layered = new Array();

  if (layers.length < 2) {
    throw "[Neuras] Should have at least two layers!";
  };

  layered.push(new Layer('input').addNeurones(layers[0]));

  for (var i = 1; i < layers.length; i++) {
    var current = new Layer('hidden');
    for (var j = 0; j < layers[i]; j++) {
      current.addLinkage(new Canvas.LSTM());
    };
    layered.push(current);
  };

  return new Linkage(layered, true);
};
