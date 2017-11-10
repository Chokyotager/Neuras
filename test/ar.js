var neuras = require('../src/neura');

var input = new neuras.Layer('input').addNeurones(1, 'identity');
var l1 = new neuras.Layer('hidden').addNeurones(3, 'tanh');
var l2 = new neuras.Layer('hidden').addNeurones(2, 'tanh');

input.connect(l1).connect(l2);

var linkage = new neuras.Linkage([input, l1, l2]);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});

console.log('Init: %s', linkage.forward([0.6]));

for (var i = 0; i < 150; i++) {
  var loss = mentor.train([0.6], [0.8, 0.4], 0.04);
  if (i == 50) {
    l1.freezeNeurones(1);
  };
  console.log(l1.neurones[0].backconnections[0].weight);
  //console.log(loss);
};

console.log('End: %s', linkage.forward([0.6]));
