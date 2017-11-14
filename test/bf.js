var neuras = require('../src/neura');

var linkage = new neuras.Canvas.GRU();

var mentor = new neuras.Mentor(linkage);

console.log('Hi');

mentor.setOptimiser('compound-momentum');

console.log(linkage.forward([0.3]));

for (var i = 0; i < 100; i++) {
  var losses = mentor.train([0.3], [0.6], 0.4);
  console.log(losses);
}

console.log(linkage.forward([0.3]));
