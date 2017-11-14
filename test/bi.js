var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Feedforward([1, 3, 1], false);

//var mentor = new neuras.Mentor(linkage);

var ff = linkage.forward([0.2]);
console.log(ff);

var mentor = new neuras.Mentor(linkage);

for (var i = 0; i < 1000; i++) {
  mentor.train([0.2], [0.4], 4);
};

var ff = linkage.forward([0.2]);
console.log(ff);
