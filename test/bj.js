var neuras = require('../src/neura');

var one = new neuras.Layer().addNeurones(1);
var two = new neuras.Layer().addNeurones(1);

var linkage = new neuras.Linkage([one, two], true)

var ff = linkage.forward([0.2]);
console.log(ff);

var mentor = new neuras.Mentor(linkage);

/*
for (var i = 0; i < 100; i++) {
  mentor.train([0.2], [0.4], 0.4);
};*/

var ff = linkage.forward([0.2]);
console.log(ff);
