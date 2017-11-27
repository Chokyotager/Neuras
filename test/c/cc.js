var neuras = require('../src/neura');

var ff = new neuras.Architecture.Feedforward([3, 2, 3, 4], 'sin').toLayer();
var t = new neuras.Linkage([ff, new neuras.Layer().addNeurones(3, 'logistic')], true);

var mentor = new neuras.Mentor(t);

var vv = t.forward([0.3, 0.2, 0.2]);
console.log(vv);
