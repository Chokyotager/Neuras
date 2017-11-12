var neura = require('../src/neura');

var l1 = new neura.Layer('input', 5, 'identity');
var l2 = new neura.Layer('hidden', 3, 'sin');

l1.connect(l2);

var linkage = new neura.Linkage([l1, l2]);

//var res = l1.continuous_forward([1, 1, 3, 3]);
l2.addBiases(1, false, 300)
res = linkage.forward([1, 1, 3, 3, 6]);
console.log(res);
