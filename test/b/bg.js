var neuras = require('../src/neura');

var linkage = new neuras.Canvas.GRU();

//var out = linkage.forward([0.2]);

var mentor = new neuras.Mentor(linkage);

console.log(linkage.forward([0.2]));

for (var i = 0; i < 10000; i++) {
  mentor.train([0.2], [0.4], 0.04);
};

console.log(linkage.forward([0.2]));
