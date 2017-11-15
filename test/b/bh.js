var neuras = require('../src/neura');

var linkage = new neuras.Architecture.Feedforward([2, 2, 2, 2], true);

var li = new neuras.Layer('input').addNeurones(3, 'identity');
var l1 = new neuras.Layer('hidden').addLinkage(linkage);
var l2 = new neuras.Layer('hidden').addGates(2, 'hardmax');

li.connectSequentially(l1);
l1.connectRespectively(l2);

var biglink = new neuras.Linkage([li, l1, l2], false)

//var out = linkage.forward([0.2]);

var mentor = new neuras.Mentor(biglink, {lossFunction: 'mean-squared'});

mentor.setOptimiser('principle-momentum');

for (var i = 0; i < 1000; i++) {
  var loss = mentor.train([0.2, 0.3], [1, 0], 40);
  i % 1 === 0 ? console.log("Iteration: %s; Loss: %s", i, loss) : null;
};

console.log(linkage.forward([0.2]));
