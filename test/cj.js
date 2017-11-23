var neuras = require('../src/neura');
var fs = require('fs');

var one = new neuras.Layer().addNeurones(1, 'identity');
var onepointfive = new neuras.Layer().addNeurones(1, 'logistic')//.addBiases(1, false);
var onepoint7 = new neuras.Layer().addNeurones(2, 'tanh').addBiases(1, true);
var onepoint8 = new neuras.Layer();
var two = new neuras.Layer().addNeurones(1, 'tanh');

for (var i = 0; i < 10; i++) {
  onepoint8.addUnits([new neuras.Canvas.LSTM()]);
};

var divisor = 1000;

var b = function (x) {
  return Math.tan(incrementLog);
  //return x * incrementLog % 3
  //return Math.sin((x + incrementLog) * 0.4);
  //return Math.pow(x, 3);
};

for (var i = 0; i < 3; i++) {
  //onepoint8.addUnits([new neuras.Canvas.GRU()]);
  //onepoint8.addUnits([new neuras.Canvas.LSTM()]);
};

//two.connect(onepointfive);

onepoint8.connect(onepoint8);

var ff = new neuras.Linkage([one, onepointfive, onepoint7, onepoint8, two], true);

one.lock();
//mentor.setOptimiser('compound-momentum');

//onepoint8.connect(onepoint7);

for (var i = 0; i < 100; i++) {
  console.log(ff.forward([0]));
};
