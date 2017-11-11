var neuras = require('../src/neura');

var input = new neuras.Layer('input').addNeurones(1, 'identity');
var l1 = new neuras.Layer('hidden').addGates(2, 'delay', {delay: 50}).addNeurones(3, 'sin');
var l2 = new neuras.Layer('hidden').addNeurones(2, 'tanh');

var linkage = new neuras.Linkage([input, l1, l2], true);

var mentor = new neuras.Mentor(linkage);

console.log("Init: %s", linkage.forward([0.5]));

for (var i = 0; i < 100; i++) {
  var loss = mentor.train([0.5], [0.2, 0.3], 0.04);
  console.log(loss);
}

console.log("End: %s", linkage.forward([0.5]));
