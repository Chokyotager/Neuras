var neuras = require('../src/neura');

var l1 = new neuras.Architecture.Feedforward([1, 3, 1]).toLayer();
var l2 = new neuras.Architecture.GRU([2, 3, 1]).toLayer();

var linkage = new neuras.Linkage([l1, l2], true);

//var mentor = new neuras.Mentor(linkage);

var ff = linkage.forward([0.2]);
console.log(ff);

var mentor = new neuras.Mentor(linkage);

for (var i = 0; i < 1000; i++) {
  mentor.train([0.2], [0.4], 4);
};

var ff = linkage.forward([0.2]);
console.log(ff);
