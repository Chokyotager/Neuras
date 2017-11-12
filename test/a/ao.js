var neuras = require('../src/neura');

var l21 = new neuras.Layer('hidden').addNeurones(3, 'sin');
var l22 = new neuras.Layer('hidden').addNeurones(2, 'sin');
l21.connect(l22);

var link2 = new neuras.Linkage([l21, l22]);
var ll = new neuras.Layer('hidden').addLinkage(link2);

var l1 = new neuras.Layer('input').addNeurones(2, 'tanh');
var l2 = new neuras.Layer('hidden').addNeurones(3, 'sin');//.addGates(12, 'spike', {threshold: Math.random() * 10, iterative: 0.92});
var l4 = new neuras.Layer('hidden').addNeurones(2, 'sin');

l1.connect(l2);
l2.connect(ll);
ll.connect(l4);

var linkage = new neuras.Linkage([l1, l2, ll, l4]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});
mentor.setOptimiser('compound-momentum');
console.log('Init: %s', linkage.forward([2, 2]));

for (var i = 0; i < 10000; i++) {
  var loss = mentor.train([2, 2], [0.6, 0.4], 0.004);
  i % 1000 == 0 ? console.log('Iteration: %s, Loss: %s', i, loss) : null;
};

//console.log(linkage.chronology[1].neurones)

console.log('End: %s', linkage.forward([2, 2]));

var link = linkage.forward([3, 2]);
/*
console.log(link);
console.log(l4.neurones)*/
