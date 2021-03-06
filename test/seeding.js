var neuras = require('../src/neura');

var ll = new neuras.Layer().addNeurones(1, 'identity');
var l2 = new neuras.Layer().addNeurones(12, 'tanh');
var l3 = new neuras.Layer().addNeurones(20, 'relu').addBiases(0.3, false, 0.1);
var l4 = new neuras.Layer().addNeurones(2, 'identity');

var linkage = new neuras.Linkage([ll, l2, l3, l4], true).seed(3);

var mentor = new neuras.Mentor(linkage);

/*
for (var i = 0; i < l3.neurones.length; i++) {
  console.log(l3.neurones[i].biases);
};*/

//mentor.train([3], [2, 3], 0.4);

console.log(linkage.forward([3]));
