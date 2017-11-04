var neura = require('../src/neura')
var neurone = new neura.Neurone()
var n2 = new neura.Neurone()
neurone.changeSquash('gaussian').connect(n2).connect(n2)
n2.connect(neurone)

console.log(neurone.forward([3]))
console.log(neurone)
