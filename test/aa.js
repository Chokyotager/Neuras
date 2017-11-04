var neura = require('../src/neura')
var neurone = new neura.Neurone()
var n2 = new neura.Neurone()
neurone.changeSquash('gaussian').connect(n2).connect(n2)
n2.connect(neurone)

n2.addBias(true, 3)
n2.addBias()
//n2.monodropout(n2.backconnections[1])

var res = n2.forward([1, 3])
n2.backpropagate(1, 0.4)
console.log(n2)
//console.log(neurone)
