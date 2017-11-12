var neuras = require('../src/neura');

var l1 = new neuras.Layer('input').addNeurones(2, 'tanh');
var l2 = new neuras.Layer('hidden').addNeurones(7, 'sin')//.addGates(12, 'spike', {threshold: Math.random() * 10, iterative: 0.92});
var l3 = new neuras.Layer('hidden').addNeurones(6, 'sin');
var l4 = new neuras.Layer('hidden').addNeurones(2, 'gaussian').addBiases(1, true);

l1.connect(l2);
l2.connect(l3);
l3.connect(l4);
l3.connect(l2);

var linkage = new neuras.Linkage([l1, l2, l3, l4]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});
mentor.setOptimiser('compound-momentum');
console.log('Init: %s', linkage.forward([2, 2]));

for (var i = 0; i < 100000; i++) {
  var loss = mentor.train([2, 2], [0.6, 0.4], 0.004);
  i % 10000 == 0 ? console.log('Iteration: %s, Loss: %s', i, loss) : null;
};

console.log('End: %s', linkage.forward([2, 2]));
//console.log(mentor);

//console.log(l2.forward())
