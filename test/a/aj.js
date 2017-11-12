var neuras = require('../src/neura');

var l1 = new neuras.Layer('input').addNeurones(2, 'arctan');
var l2 = new neuras.Layer('hidden')//.addNeurones(10, 'sin')//.addGates(12, 'spike', {threshold: Math.random() * 10, iterative: 0.92});
var l3 = new neuras.Layer('hidden').addNeurones(5, 'arctan');
var l4 = new neuras.Layer('hidden').addNeurones(2, 'arctan')

for (var i = 0; i < 12; i++) {
  l2.addGate(new neuras.Gate('spike', {threshold: Math.random() * 3, iterative: Math.random()}));
};

l1.connectSequentially(l2);
l2.connect(l3);
l3.connect(l4);

var linkage = new neuras.Linkage([l1, l2, l3, l4]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-quad'});
console.log('Init: %s', linkage.forward([2, 2]));

for (var i = 0; i < 100000; i++) {
  var loss = mentor.train([2, 2], [0.6, 0.4], 0.4);
  i % 10000 == 0 ? console.log('Iteration: %s, Loss: %s', i, loss) : null;
};

console.log('End: %s', linkage.forward([2, 2]));
//console.log(mentor);

//console.log(l2.forward())
