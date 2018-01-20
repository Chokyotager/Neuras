// LSTM

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');
var Canvas = require('../canvas');

module.exports = function (layers, selfconnect) {
  var layered = new Array();

  layered.push(new Layer().addNeurones(layers[0], 'identity'));

  for (var i = 0; i < layers.length; i++) {
    var current = new Layer();
    for (var j = 0; j < layers[i]; j++) {
      current.addLinkage(new Canvas.LSTM());
    };
    // Self-connect
    if (selfconnect) {
      current.connect(current);
    };
    layered.push(current);
  };

  console.log('SEQUENTIAL!!!!');

  layered[0].connectSequentially(layered[1]);

  for (var i = 1; i < layered.length - 1; i++) {
    layered[i].connect(layered[i + 1]);
  };

  return new Linkage(layered);
};
