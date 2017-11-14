var Layer = require('../classes/Layer');
var Gate = require('../classes/Gate');
var Linkage = require('../classes/Linkage');
var Neurone = require('../classes/Neurone');
var Buffer = require('../classes/Buffer');

module.exports = function () {

  var input = new Neurone().changeSquash('logistic');
  var output = new Neurone().changeSquash('logistic');
  var buffer = new Buffer();

  var central_multiplicative = new Gate('multiplicative');
  var central = new Neurone();

  var output_multiplicative = new Neurone().changeSquash('tanh');

  input.connect(central_multiplicative);
  central_multiplicative.connect(central);
  buffer.connect(central).connect(input).connect(output);
  central.connect(output_multiplicative);
  output.connect(output_multiplicative);

  output_multiplicative.connect(output).connect(input).connect(central_multiplicative).connect(output_multiplicative);

  var one = new Layer().addUnits([buffer]);
  var two = new Layer().addUnits([input, output, central_multiplicative, central]);
  var three = new Layer().addUnits([output_multiplicative]);

  return new Linkage([one, two, three], false);

};
