var neuras = require('../src/neura');

var ae = new neuras.Architecture.Autoencoder([3, 2], 1, [5, 3]);

var mentor = new neuras.Mentor(ae);

var set = [.2, .4, .3];

mentor.setOptimiser('compound-momentum');

for (var i = 0; i < 1000; i++) {
  var l = mentor.train(set, set, 0.04);
  i % 100 === 0 ? console.log("Iteration: %s, Loss: %s", i, l) : null;
};

//console.log(l);

var vv = ae.forward(set);
console.log(vv);

/*
var encoded = ae.getEncoded();
console.log(encoded);
var out = ae.decoder.forward(encoded);
console.log(out);*/
