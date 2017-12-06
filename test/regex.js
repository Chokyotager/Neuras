var neuras = require('../src/neura');

var layer = new neuras.Layer().addNeurones(1, 'random-custom', {include: ['identity', 'tanh']});
