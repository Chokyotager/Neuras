var neuras = require('../src/neura');

var one = new neuras.Layer('input').addNeurones(3, 'identity');
var two = new neuras.Layer('hidden').addNeurones(2, 'tanh');

one.connect(two);
two.disconnectDuplicates();

console.log(two.neurones[0].backconnections);
