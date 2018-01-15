var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (inputs, terminal, ordering_seed) {

  (typeof terminal !== 'string') ? terminal = 'binary-step' : null;

  var l1 = new Layer().addNeurones(inputs, 'identity');
  var l2 = new Layer().addNeurones(inputs, terminal).setFiringOrder('random', ordering_seed);
  var l3 = new Layer().addGates(inputs, 'softmax');

  l1.connect(l2).setWeights(1).selfconnect().connectRespectively(l3);
  l1.freezeNeurones().lock();

  for (var i = 0; i < l2.neurones.length; i++) {
    l2.neurones[i].removeSelfConnections();
  };

  return new Linkage([l1, l2, l3]);

};
