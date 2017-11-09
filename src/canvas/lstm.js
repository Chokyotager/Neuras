var Layer = require('../classes/Layer');
var Gate = require('../classes/Gate');
var Linkage = require('../classes/Linkage');

module.exports = function () {
  var one = new Layer().addNeurones(1, 'tanh').addNeurones(3, 'logistic');
  var two = new Layer().addGates(2, 'multiplicative');
  var three = new Layer().addGates(1, 'additive').addGates(1, 'multiplicative');
};
