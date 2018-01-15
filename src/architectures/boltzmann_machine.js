var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (inputs, additional, terminal, intermediate, ordering_seed) {

  (typeof terminal !== 'string') ? terminal = 'binary-step' : null;

  var l1 = new Layer().addNeurones(inputs, 'identity');
  var l2 = new Layer().addNeurones(inputs, terminal).setFiringOrder('random', ordering_seed);
  var l3 = new Layer().addBuffers(1);

  l1.connect(l2).setWeights(1).selfconnect().connect(l3);
  l1.freezeNeurones().lock();

  l2.addNeurones(additional, terminal);

  return new Linkage([l1, l2, l3]);

};
