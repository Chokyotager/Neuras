var neuras = require('../src/neura');

var input = new neuras.Layer('input').addNeurones(1, 'identity');
var l1 = new neuras.Layer('hidden').addNeurones(3, 'tanh');
var l2 = new neuras.Layer('hidden').addNeurones(2, 'tanh');

input.connect(l1).connect(l2);
console.log('hi');
