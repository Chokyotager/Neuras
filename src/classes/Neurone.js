var Squash = require('./Squash');
var Seeder = require('./Seeder');
var uuid = require('../libs/uuid_generator');
var NMatrix = require('./NeuroneMatrix');
//var Input = require('./Input');

module.exports = function () {

  var prototype = module.exports.prototype;

  this.squash = new Squash('tanh');
  this.uuid = uuid();
  this.backconnections = new Array();
  this.biases = 0;

  prototype.value = 0;
  prototype.cache = new Object();
  prototype.meta = new Object();
  prototype.chain_derivative = 0;
  this.meta.weighted = true;
  this.meta.type = 'neurone';

  module.exports.prototype.matrix = {
    miu: function (m) { return m.reduce(function (a, b) {return a + b;})},
    // partial derivative = 1 w.r.t. factor
    miu_prime: function (m) {return 1},
    zeta: function (b) {
      var m = new Array();
      for (var i = 0; i < b.length; i++) {
        if (b[i].dropout === false) {
          b[i].weight !== undefined ? m.push(b[i].neurone.value * b[i].weight) : m.push(b[i].neurone.value);
        } else {
          m[i] = 0;
        };
      };
      return m;
    }
  };

  //Object.freeze(this.meta);

};

var prototype = module.exports.prototype;

prototype.messUpWeights = function (probability, delta, seed) {
  (typeof probability !== 'number') ? probability = 1 : null;
  (typeof delta !== 'number') ? delta = 0.05 : null;

  seed = Seeder.from(seed);

  for (var i = 0; i < this.backconnections.length; i++) {
    if (this.backconnections[i].frozen === false) {
      this.backconnections[i].weight -= this.backconnections[i].weight * (seed.random() - 0.5) * 2 * delta;
    };
  };

};

prototype.limitConnections = function (connections) {
  if (connections < this.backconnections.length) {
    throw "[Neuras] Cannot lower backconnection limits than already existing number of connections!";
  };

  if (typeof connections !== 'number' || connections < 0) {
    throw "[Neuras] Invalid limit on connections!";
  };

  this.meta.max_connections = connections;
  return this;
};

prototype.lock = function () {
  this.meta.max_connections = this.backconnections.length;
  return this;
};

prototype.unlock = function () {
  this.meta.max_connections = Infinity;
  return this;
};

prototype.addBias = function (weighted, bias) {
  var push = {neurone: {type: 'bias', uuid: uuid()}, dropout: false};
  if (weighted == true) {
    push.weight = 2 * (Math.random()-.5);
  };

  if (typeof bias != 'number') {
    bias = 2 * (Math.random()-.5);
  };
  this.biases++
  push.neurone.value = bias;
  this.backconnections.unshift(push);
  return this.backconnections[0];
};

prototype.forward = function (x) {

  if (x === undefined) {
    var matrix = this.matrix.zeta(this.backconnections);

    matrix.length == 0 ? matrix[0] = 0 : null;

    x = this.matrix.miu(matrix);
  };

  var output = this.squash.forward(x);

  prototype.cache.miu = x;
  prototype.cache.matrix = matrix;
  prototype.chain_derivative = 0;

  this.value = output;

  this.derivative = this.squash.derivative(x) * this.matrix.miu_prime();;

  return output;
};

prototype.jumbleTrainRate = function (probability, seed) {
  (typeof probability !== 'number') ? probability = 1 : null;
  seed = Seeder.from(seed);
  for (var i = 0; i < this.backconnections.length; i++) {
    if (seed.add(1).random() < probability && this.backconnections[i].frozen === false) {
      this.backconnections[i].local_trainrate = Math.random();
    };
  };
};

prototype.connect = function (unit, weight) {
  var unweightedInstance = unit.meta.weighted == false;
  var weightedInstance = unit.meta.weighted == true;
  if (!unweightedInstance && !weightedInstance) {
    throw "[Neuras] Inappropriate connection (to) instance.";
  };

  if (unit.meta.max_connections < unit.backconnections.length + 1) {
    throw "[Neuras] Unit can only hold " + unit.meta.max_connections + " connection" + ((unit.meta.max_connections !== 1) ? "s" : "") + "! Stack-trace to find unit!"
  };

  if (unit.meta.type === 'buffer') {
    for (var i = 0; i < unit.connections.length; i++) {
      this.connect(unit.connections[i], weight);
    };
  } else if (unweightedInstance) {
        unit.backconnections.push({neurone: this});
    } else {
      if (typeof weight !== 'number') {
        weight = 2 * (Math.random()-.5);
      };
      unit.backconnections.push({neurone: this, weight: weight, dropout: false, frozen: false, local_trainrate: 1});
    };
  return this;
};

prototype.freeze = function (probability, seed) {
  // freezes weights of the neurone

  seed = Seeder.from(seed);

  var frozen = new Array();
  (typeof probability !== 'number') ? probability = 1 : null;

  for (var i = 0; i < this.backconnections.length; i++) {
    if (seed.add(1).random() < probability && this.backconnections[i].weight !== undefined && this.backconnections[i].frozen == false) {
      this.backconnections[i].frozen = true;
      frozen.push(this.backconnections[i]);
    };
  };
  return frozen;
};

prototype.unfreeze = function (probability, seed) {
  // freezes weights of the neurone
  var frozen = new Array();
  seed = Seeder.from(seed);
  (typeof probability !== 'number') ? probability = 1 : null;

  for (var i = 0; i < this.backconnections.length; i++) {
    if (seed.add(1).random() < probability && this.backconnections[i].weight !== undefined && this.backconnections[i].frozen == true) {
      this.backconnections[i].frozen = false;
      frozen.push(this.backconnections[i]);
    };
  };
  return frozen;
};

prototype.getUnsquashedOutput = function () {
  return prototype.cache.miu;
};

prototype.backpropagate = function (additiveRate) {

  if (typeof additiveRate !== 'number') {
    additiveRate = 1;
  };
  // backpropagate derivative
  var derivative = prototype.chain_derivative * this.derivative * additiveRate;
  for (var i = 0; i < this.backconnections.length; i++) {
    // additive rate is multiplied to the current derivative to alter the training rate of the current neurone;
    // it does not affect the neurones further back the line
    if (this.backconnections[i].dropout == false && this.backconnections[i].weight !== undefined) {

      if (this.backconnections[i].frozen == false) {
        this.backconnections[i].weight -= derivative * this.backconnections[i].neurone.value * this.backconnections[i].local_trainrate;
      };

      //update previous derivatives
      this.backconnections[i].neurone.chain_derivative += derivative * this.backconnections[i].weight * this.backconnections[i].local_trainrate; //this.squash.derivative(prototype.cache.miu) * prototype.chain_derivative * this.backconnections[i].weight;
    };
  };
  prototype.chain_derivative = 0;
  return this;
};

prototype.changeSquash = function (sq, params) {
  this.squash = new Squash(sq, params);
  return this;
};

prototype.dropout = function (probability) {

  if (typeof probability != 'number') {
    probability = 1;
  };

  var drops = new Array();
  for (var i = 0; i < this.backconnections.length; i++) {
    if (Math.random() < probability) {
      drops.push(this.backconnections[i]);
      this.backconnections[i].dropout = !this.backconnections[i].dropout;
    };
  };
  return drops;
};

prototype.monodropout = function (backconnection) {
  var index = find_backconnection(backconnection, this.backconnections);
  this.backconnections[index].dropout = !this.backconnections[index].dropout;
  return this.backconnections[index].dropout;
};

prototype.extinguish = function () {
  this.dropout(1);
  return this;
}

prototype.rekindle = function () {
  for (var i = 0; i < this.backconnections.length; i++) {
    this.backconnections[i].dropout == false;
  };
};

prototype.disconnectDuplicates = function () {
  for (var i = 0; i < this.backconnections.length - 1; i++) {
    for (var j = this.backconnections.length - 1; j > i; j--) {
      if (this.backconnections[j].neurone === this.backconnections[i].neurone) {
        this.backconnections.splice(j, 1);
      };
    };
  };
  return this;
};

prototype.seedWeights = function (seed) {
  seed = Seeder.from(seed);

  for (var i = 0; i < this.backconnections.length; i++) {
    this.backconnections[i].weight !== undefined ? this.backconnections[i].weight = 2 * (seed.add('W').random() - 0.5) : null;
  };
  return this;
};

prototype.seedBiases = function (seed) {
  seed = Seeder.from(seed);

  for (var i = 0; i < this.backconnections.length; i++) {
    if (this.backconnections[i].neurone.type === 'bias') {
      this.backconnections[i].neurone.value = 2 * (seed.add('B').random() - 0.5);
    } else {
      // Biases are always appended to the front of the backconnections array
      break;
    };
  };
  return this;
};

prototype.seed = function (seed) {
  this.seedWeights(seed);
  this.seedBiases(seed);
};

prototype.setDerivativeChain = function (x) {
  prototype.chain_derivative = x;
  return this;
};

function find_backconnection (backconnection, backconnections) {
  for (var i = 0; i < backconnections.length; i++) {
    if (backconnection == backconnections[i]) {
      return i;
    };
  };
  throw "[Neuras] Cannot find backconnection in neurone!";
};
