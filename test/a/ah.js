var neura = require('../src/neura');

var l1 = new neura.Layer('input', 2, 'tanh');
var l2 = new neura.Layer('hidden', 3, 'tanh');
var l3 = new neura.Layer('hidden', 5, 'tanh').addBiases(1, true);
var l4 = new neura.Layer('hidden', 2, 'tanh');
var l5 = new neura.Layer('hidden', 5, 'tanh');
var l6 = new neura.Layer('hidden', 2, 'sin');

l1.connect(l2);
l2.connect(l3);
l3.connect(l4);
l4.connect(l5);
l5.connect(l6);
//l5.connect(l2);

var linkage = new neura.Linkage([l1, l2, l3, l4, l5, l6]);

var mentor = new neura.Mentor(linkage, {lossFunction: 'mean-squared'});

for (var i = 0; i < 10000; i++) {
  console.log(mentor.train([2, 2], [0.2, 0.4], 0.04));
};

console.log(linkage.forward([2, 2]));
//console.log(mentor);
