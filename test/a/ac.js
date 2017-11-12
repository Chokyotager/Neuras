var neura = require('../src/neura');

var input = new neura.Layer('input', 3, 'identity');
var output = new neura.Layer('hidden', 3, 'identity');

input.connect(output, 1)

console.log(input.neurones[0]);
