var neuras = require('../src/neura');

var l1 = new neuras.Layer().addNeurones(1, 'identity');
var l2 = new neuras.Layer().addNeurones(1, 'logistic');
var l3 = new neuras.Layer().addNeurones(1, 'logistic');
var linkage = new neuras.Linkage([l1, l2, l3], true);
var mentor = new neuras.Mentor(linkage);

linkage.seed('Choco');

var out = linkage.forward([1]);
console.log(out);

for (var i = 0; i < 5; i++) {
  mentor.train([1], [1], 0.04);
};

var out = linkage.forward([1]);
console.log(out);
