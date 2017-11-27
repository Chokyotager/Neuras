var neuras = require('../src/neura');

var l = new neuras.Layer().addGates(1, 'multiplicative');

var linkage = new neuras.Linkage([l]);

console.log(linkage);

linkage.dropoutWeights(1);
