var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Markov_Chain(3, 'identity').seed('ChocoParrot');

for (var i = 0; i < 5; i++) {
  console.log(linkage.forward([3, 2, 1]));
};
