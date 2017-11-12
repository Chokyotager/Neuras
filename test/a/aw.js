var neuras = require('../src/neura');

var network = new neuras.Architecture.Feedforward([1, 3, 2]);

console.log(network.forward([2]));

var mentor = new neuras.Mentor(network);

mentor.train([0.2], [0.4, 0.4], 0.04);

console.log(network.forward([2]));
