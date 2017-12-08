var neuras = require('../src/neura');

var ll = new neuras.Layer().addNeurones(1, 'identity');
var l2 = new neuras.Layer().addNeurones(12, 'tanh');
var l3 = new neuras.Layer().addNeurones(22, 'relu');
var l4 = new neuras.Layer().addNeurones(2, 'tanh');

var linkage = new neuras.Linkage([ll, l2, l3, l4], true);

linkage.seed(3);

console.log(linkage.forward([3]));
