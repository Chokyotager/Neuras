var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Hopfield(2, 'logistic').seed('ChocoParrot');

for (var i = 0; i < 10; i++) {
  console.log(linkage.forward([3, 4]));
};
