var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Boltzmann_Machine(3, 4, 'identity').seed('ChocoParrot');

for (var i = 0; i < 5; i++) {
  console.log(linkage.forward([3, 2, 1]));
};
