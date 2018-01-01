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
  var input = new Neurone().changeSquash('logistic').addBias();
  var forget = new Neurone().changeSquash('logistic');

  var output = new Neurone().changeSquash('logistic');
  var buffer = new Buffer().connect(output).connect(entrance).connect(input).connect(forget);

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

  var one = new Layer().addUnits([buffer]);
  var one_point_five = new Layer().addUnits([entrance, input, forget])
  var two = new Layer().addUnits([ei_multiplicative, f_multiplicative]);
  var three = new Layer().addUnits([central_additive, central_squash]);
  var four = new Layer().addUnits([output]);
  var five = new Layer().addUnits([co_multiplicative])

  //console.log(new Layer().addUnits([central_additive, central_squash]));

  return new Linkage([one, one_point_five, two, three, four, five]);

};
