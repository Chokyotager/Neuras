var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Boltzmann_Machine(5, 3, 'logistic', 'relu');

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

for (var i = 0; i < 10000; i++) {
  train(training_sets);
};

console.log(rar(linkage.forward([0, 0, 0, 0, 0])));
