var neuras = require('../src/neura');

var one = new neuras.Layer('input').addNeurones(1, 'identity');
var two = new neuras.Layer('hidden').addNeurones(2, 'hard-tanh');

var linkage = new neuras.Linkage([one, two], true);

two.connect(two);

var mentor = new neuras.Mentor(linkage);

var out = linkage.forward([0.3]);
console.log(out);
