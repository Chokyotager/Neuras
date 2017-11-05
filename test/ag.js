var neura = require('../src/neura');

var l1 = new neura.Layer('input', 2, 'identity');
var l2 = new neura.Layer('hidden', 1, 'sigmoid');

l1.connect(l2);

var linkage = new neura.Linkage([l1, l2]);
console.log(output = linkage.forward([1, 3]))
for (var i = 0; i < 100000; i++) {
  var output = linkage.forward([1, 3]);

  var loss_derivative = -(0.2 - output) * 0.3;
  linkage.backpropagate(loss_derivative);
  //console.log(0.5 * Math.pow((0.2 - output), 2));
};
console.log(output);
