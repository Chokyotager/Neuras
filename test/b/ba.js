var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Feedforward([1, 200, 200, 1]);

var mentor = new neuras.Mentor(linkage);

console.log('Hi');

for (var i = 0; i < 1000; i++) {
  mentor.train([0.3], [0.6], 0.4);
}

console.log('End');
