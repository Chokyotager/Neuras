var neura = require('../src/neura');

var l1 = new neura.Layer('input').addNeurones('2', 'tanh');
var l2 = new neura.Layer('hidden').addNeurones('5', 'tanh');
var l3 = new neura.Layer('hidden').addNeurones(2, 'logistic');

l1.connect(l2, 0.5);
l1.connect(l3, 0.5);
l2.connect(l3, 0.5);
l3.connect(l2, 0.5);

var linkage = new neura.Linkage([l1, l2, l3]);

var mentor = new neura.Mentor(linkage, {lossFunction: 'mean-squared'});
console.log('Init: %s', linkage.forward([2, 2]));

for (var i = 0; i < 1000; i++) {
  console.log(mentor.train([2, 2], [0.6, 0.4], 0.0004));
  //console.log(l2.neurones[0].backconnections[0].weight);
};

console.log('End: %s', linkage.forward([2, 2]));
//console.log(mentor);
