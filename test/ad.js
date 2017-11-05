var neura = require('../src/neura')

var i1 = new neura.Input();
var n1 = new neura.Neurone();

i1.connect(n1);

i1.continuous_forward(3)
var res = n1.continuous_forward()
console.log(res)
