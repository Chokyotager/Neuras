var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (inputs, terminal, ordering_seed) {

  (typeof terminal !== 'string') ? terminal = 'binary-step' : null;

  var l1 = new Layer().addNeurones(inputs, 'identity');
  var l2 = new Layer().addNeurones(inputs, terminal).setFiringOrder('random', ordering_seed);

  l1.connect(l2).setWeights(1).selfconnect();
  l1.freezeNeurones().lock();

  return new Linkage([l1, l2]);

};
