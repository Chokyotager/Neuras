var neuras = require('../src/neura');

var one = new neuras.Layer('input').addNeurones(1, 'identity');
var two = new neuras.Layer('hidden').addNeurones(2, 'identity');
var three = new neuras.Layer('hidden').addGates(2, 'softmax');

one.connect(two);
two.connectSequentially(three);
two.connect(three);

three.disconnectDuplicates();

var linkage = new neuras.Linkage([one, two, three], false);

var mentor = new neuras.Mentor(linkage, {lossFunction: 'mean-squared'});

var fw = linkage.forward([0.3]);
console.log(fw);

for (var i = 0; i < 10; i++) {
  var loss = mentor.train([0.3], [0, 1], 0.4);
  console.log(loss);
}

var fw = linkage.forward([0.3]);
console.log(fw);
