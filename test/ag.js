var neura = require('../src/neura');

var l1 = new neura.Layer('input', 2, 'identity');
var l2 = new neura.Layer('hidden', 3, 'tanh');
var l3 = new neura.Layer('hidden', 5, 'gaussian').addBiases(1, true);
var l4 = new neura.Layer('hidden', 2, 'tanh');
var l5 = new neura.Layer('hidden', 5, 'tanh');
var l6 = new neura.Layer('hidden', 2, 'log');

l1.connect(l2);
l2.connect(l3);
l3.connect(l4);
l4.connect(l5);
l5.connect(l6);

var linkage = new neura.Linkage([l1, l2, l3, l4, l5, l6]);
console.log(output = linkage.forward([1, 3]))
for (var i = 0; i < 100000; i++) {
  var output = linkage.forward([1, 3]);

  var loss_derivative = -(Math.PI/10 - output[0]) * 0.04;
  var loss_derivative2 = -(0.4 - output[1]) * 0.04;
  linkage.backpropagate([loss_derivative, loss_derivative2]);
  //console.log(0.5 * Math.pow((0.2 - output), 2));
};
console.log(output);
