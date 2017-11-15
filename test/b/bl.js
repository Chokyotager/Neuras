var neuras = require('../src/neura');

var l1 = new neuras.Architecture.Feedforward([1, 3, 1]);
var l2 = new neuras.Architecture.GRU([2, 3, 5]);

l1.merge(l2, true);

//var mentor = new neuras.Mentor(linkage);

var ff = l1.forward([0.2]);
//console.log(ff);

console.log(l2.getUnsquashedOutput());

/*

var mentor = new neuras.Mentor(l1);

for (var i = 0; i < 1000; i++) {
  mentor.train([0.2], [0.4], 4);
};

console.log(l2.getUnsquashedOutput());

var ff = l1.forward([0.2]);
console.log(ff);*/
