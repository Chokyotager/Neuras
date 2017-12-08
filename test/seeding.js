var neuras = require('../src/neura');

var ll = new neuras.Layer().addNeurones(3, 'tanh');
var l2 = new neuras.Layer().addNeurones(2, 'tanh')

var linkage = new neuras.Linkage([ll, l2], true);

console.log(l2.neurones[0].backconnections[0].weight);
