var neuras = require('../src/neura');

var spike = new neuras.Canvas.LSTM();
var layer = new neuras.Layer('input').addNeurones(1, 'tanh');
var sp = new neuras.Layer('hidden').addLinkage(spike);
var consolidator = new neuras.Layer('hidden').addNeurones(2, 'tanh');

var linkage = new neuras.Linkage([layer, sp], true);

var mentor = new neuras.Mentor(linkage);

for (var i = 0; i < 4; i++) {
  var loss = mentor.train([3], [0.2], 0.04);
  console.log(loss);
};

var forward = linkage.forward([3]);
