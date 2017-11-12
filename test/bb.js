var neuras = require('../src/neura');

var linkage = new neuras.Architecture.LSTM([1, 1, 3, 1]);

var mentor = new neuras.Mentor(linkage);

console.log('Hi');

mentor.setOptimiser('compound-momentum');

for (var i = 0; i < 10; i++) {
  var losses = mentor.train([0.3], [0.6], 0.4);
  console.log(losses);
}

console.log('End');
