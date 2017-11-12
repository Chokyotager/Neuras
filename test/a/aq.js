var neuras = require('../src/neura');

var input = new neuras.Layer('input').addNeurones(1, 'identity');
var l1 = new neuras.Layer('hidden').addNeurones(2, 'logistic').addGates(1, 'multiplicative', {squash: 'tanh'});

input.connect(l1);

var linkage = new neuras.Linkage([input, l1]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});

console.log('Init: %s', linkage.forward([0.6]));

for (var i = 0; i < 10; i++) {
  var loss = mentor.train([0.6], [0.8, 0.4, -0.3], 0.04);
  console.log(loss);
};

console.log('End: %s', linkage.forward([0.6]));
