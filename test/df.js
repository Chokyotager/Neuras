var neuras = require('../src/neura');

var network = new neuras.Architecture.Feedforward([3, 2, 5], 'tanh');

var neurones = network.getIONeurones(0, 'input');
console.log(neurones);
