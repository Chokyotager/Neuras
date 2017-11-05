var neura = require('../src/neura');

var l1 = new neura.Layer('input', 2, 'identity');
var l2 = new neura.Layer('hidden', 1, 'tanh');

l1.connect(l2);

var res = l1.continuous_forward([1, 1]);
console.log(res);
