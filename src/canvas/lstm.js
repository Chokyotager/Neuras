var Layer = require('../classes/Layer');
var Gate = require('../classes/Gate');
var Linkage = require('../classes/Linkage');
var Neurone = require('../classes/Neurone');
var Buffer = require('../classes/Buffer');

module.exports = function () {
  /*var one = new Layer().addNeurones(1, 'tanh').addNeurones(3, 'logistic');
  var two = new Layer().addGates(2, 'multiplicative');
  var three = new Layer().addGates(1, 'additive').addGates(1, 'multiplicative');*/

  var entrance = new Neurone();
  var input = new Neurone().changeSquash('logistic');
  var forget = new Neurone().changeSquash('logistic');

  var output = new Neurone().changeSquash('logistic');
  var output_buffer = new Buffer().connect(output);

  var ei_multiplicative = new Gate('multiplicative');
  var f_multiplicative = new Gate('multiplicative');

  var central_additive = new Gate('additive');
  var central_squash = new Gate('additive', {squash: 'tanh'});

  var co_multiplicative = new Gate('multiplicative');

  entrance.connect(ei_multiplicative);
  input.connect(ei_multiplicative);
  ei_multiplicative.connect(central_additive);

  forget.connect(f_multiplicative);
  f_multiplicative.connect(central_additive);

  // Peepholes
  central_additive.connect(input).connect(forget).connect(output).connect(central_squash);
  central_squash.connect(co_multiplicative);

  var one = new Layer('hidden').addUnits([entrance, input, forget, output_buffer]);
  var two = new Layer('hidden').addUnits([ei_multiplicative, f_multiplicative]);
  var three = new Layer('hidden').addUnits([central_additive, central_squash]);
  var four = new Layer('hidden').addUnits([output]);
  var five = new Layer('hidden').addUnits([co_multiplicative])

  //console.log(new Layer('hidden').addUnits([central_additive, central_squash]));

  return new Linkage([one, two, three, four]);

};
