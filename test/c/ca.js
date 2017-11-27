var neuras = require('../src/neura');

var l1 = new neuras.Layer().addNeurones(1);
var l2 = new neuras.Layer().addNeurones(5);
var l3 = new neuras.Layer().addNeurones(1, 'binary-step');

var linkage = new neuras.Linkage([l1, l2, l3], true);

l3.freezeNeurones('bleh');

var mentor = new neuras.Mentor(linkage);

var out = linkage.forward([0.3]);
//console.log(out);

for (var i = 0; i < 100; i++) {
  var loss = mentor.train([0.3], [0], 0.4);
  console.log(loss);
};

var out = linkage.forward([0.3]);
console.log(out);
