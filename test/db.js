var neuras = require('../src/neura');

var l = new neuras.Layer().addNeurones(5, 'identity');
var l2 = new neuras.Layer().addNeurones(5, 'logistic');

l.connect(l2).freezeNeurones();
l.lock();

l2.selfconnect().setFiringOrder('random');

var link = new neuras.Linkage([l, l2], true);
var mentor = new neuras.Mentor(link);

var trainsets = [[1, 1, 1, 0, 0], [0, 0, 0, 1, 1], [1, 0, 1, 0, 1]];

function trd (tx) {
  for (var i = 0; i < tx.length; i++) {
    mentor.train(tx[i], tx[i], 0.04);
  };
};

for (var i = 0; i < 10000; i++) {
  trd(trainsets);
};

function rar (arx) {
  for (var i = 0; i < arx.length; i++) {
    arx[i] = Math.round(arx[i]);
  };
  return arx;
};

var out = link.forward([1, 0, 0, 0, 1]);
console.log(rar(out));
