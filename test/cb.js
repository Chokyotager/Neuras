var neuras = require('../src/neura');

var ae = new neuras.Architecture.Autoencoder([3, 20], 2, [2, 3]);

var mentor = new neuras.Mentor(ae);

var set = [.1, .2, .5];

for (var i = 0; i < 10000; i++) {
  mentor.train(set, set, 0.04);
};

var vv = ae.forward([1, 2, 3]);
console.log(vv);

var encoded = ae.getEncoded();
console.log(encoded);
var out = ae.decoder.forward(encoded);
console.log(out);
