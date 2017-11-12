var neura = require('../src/neura');
var neurone = new neura.Neurone();
var input1 = new neura.Input();
var input2 = new neura.Input();

input1.connect(neurone).changeSquash('identity');
input2.connect(neurone).changeSquash('gaussian');

//input2.connect({'type': 'fake-neurone'});

neurone.changeSquash('square');

neurone.addBias(true);

//var res = neurone.forward([input1.forward([3]), input2.forward([4])]);

var actual = 3;
var prevloss = 0;

for (var i = 0; i < 10000; i++) {
  var res = neurone.forward([input1.forward(3), input2.forward(4)]);
  neurone.backpropagate(-(actual - res), 0.04);

  var loss = 0.5 * Math.pow((actual - res), 2)
  if (prevloss == loss && loss > 10e-10) {
    neurone.dropout(0.2);
  };
  var prevloss = 0.5 * Math.pow((actual - res), 2);
  0.5 * Math.pow((actual - res), 2);

  console.log(loss);
};
console.log(res);
