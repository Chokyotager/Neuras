// LSTM

var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');
var Canvas = require('../canvas');

module.exports = function (layers, selfconnect) {
  var layered = new Array();

  for (var i = 0; i < layers.length; i++) {
    var current = new Layer();
    for (var j = 0; j < layers[i]; j++) {
      current.addLinkage(new Canvas.GRU());
    };
    // Self-connect
    if (selfconnect) {
      current.connect(current);
      current.disconnectDuplicates();
    };
    layered.push(current);
  };

  return new Linkage(layered, true);
};
