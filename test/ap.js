var neuras = require('../src/neura');

var input = new neuras.Layer('input').addNeurones(1, 'identity');
var l11 = new neuras.Layer('hidden').addNeurones(2, 'tanh');
var l12 = new neuras.Layer('hidden').addNeurones(2, 'tanh');
var l13 = new neuras.Layer('hidden').addNeurones(2, 'tanh');
var l14 = new neuras.Layer('hidden').addNeurones(2, 'tanh');
var l2 = new neuras.Layer('hidden').addNeurones(1, 'tanh');

input.connect(l11);
l11.connect(l12).connect(l13).connect(l14).connect(l2)

var linkage = new neuras.Linkage([input, l11, l12, l13, l14, l2]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});

console.log('Init: %s', linkage.forward([0.4]));

for (var i = 0; i < 200; i++) {
  var loss = mentor.train([0.6], [], 1);
  console.log(loss);
};

console.log('End: %s', linkage.forward([0.6]));
