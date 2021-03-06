var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Boltzmann_Machine(5, 2, 'logistic', 'continuous-tanh');

/*
for (var i = 0; i < 5; i++) {
  console.log(linkage.forward([3, 2, 1]));
};*/

var training_sets = [[1, 1, 1, 0, 0], [0, 0, 0, 1, 1], [1, 0, 1, 0, 1]];
var mentor = new neuras.Mentor(linkage);

function train (sets) {
  for (var i = 0; i < sets.length; i++) {
    mentor.reciprocalTrain(sets[i], 0.4);
  };
};

function rar (arx) {
  for (var i = 0; i < arx.length; i++) {
    arx[i] = Math.round(arx[i]);
  };
  return arx;
};

for (var i = 0; i < 100000; i++) {
  train(training_sets);
};

console.log(rar(linkage.passivelyForward([1, 0, 0, 0, 1]))); // [10101]
console.log(rar(linkage.passivelyForward([0, 0, 0, 1, 0]))); // [00011]
console.log(rar(linkage.passivelyForward([0, 1, 1, 0, 0]))); // [11100]
