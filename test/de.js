var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Hopfield(8, 'logistic');

/*
for (var i = 0; i < 5; i++) {
  console.log(linkage.forward([3, 2, 1]));
};*/

var training_sets = [[1, 1, 1, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 0, 1], [1, 0, 1, 0, 1, 0, 1, 0]];
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

/*
function rar (arx) {
  return arx;
};*/

for (var i = 0; i < 100000; i++) {
  train(training_sets);
};

console.log(rar(linkage.passivelyForward([1, 0, 0, 0, 1, 0, 0, 0], 3, {loop: true}))); // [10101]
console.log(rar(linkage.passivelyForward([0, 0, 0, 1, 0, 1, 0, 0], 3, {loop: true}))); // [00011]
console.log(rar(linkage.passivelyForward([1, 1, 0, 0, 0, 0, 0, 0], 3, {loop: true}))); // [11100]
