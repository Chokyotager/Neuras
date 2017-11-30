var Squash = require('./Squash');
var uuid = require('../libs/uuid_generator');
var NMatrix = require('./NeuroneMatrix');
//var Input = require('./Input');

module.exports = function () {
  this.squash = new Squash('tanh');
  this.uuid = uuid();
  this.backconnections = new Array();
  this.biases = 0;
  this.cache = new Object();
  this.value = 0;

  this.meta = new Object();
  this.meta.weighted = true;
  this.meta.type = 'neurone';

  this.matrix = {
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

  this.messUpWeights = function (probability, delta) {
    (typeof probability !== 'number') ? probability = 1 : null;
    (typeof delta !== 'number') ? delta = 0.05 : null;

    for (var i = 0; i < this.backconnections.length; i++) {
      if (this.backconnections[i].frozen === false) {
        this.backconnections[i].weight -= this.backconnections[i].weight * (Math.random() - 0.5) * 2 * delta;
      };
    };

  };

  this.limitConnections = function (connections) {
    if (connections < this.backconnections.length) {
      throw "[Neuras] Cannot lower backconnection limits than already existing number of connections!";
    };

    if (typeof connections !== 'number' || connections < 0) {
      throw "[Neuras] Invalid limit on connections!";
    };

    this.meta.max_connections = connections;
    return this;
  };

  this.lock = function () {
    this.meta.max_connections = this.backconnections.length;
    return this;
  };

  this.unlock = function () {
    this.meta.max_connections = Infinity;
    return this;
  };

  this.addBias = function (weighted, bias) {
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

  this.forward = function (x) {

    if (x === undefined) {
      var matrix = this.matrix.zeta(this.backconnections);

      matrix.length == 0 ? matrix[0] = 0 : null;

      x = this.matrix.miu(matrix);
    };

    var output = this.squash.forward(x);

    this.cache.miu = x;
    this.cache.matrix = matrix;
    this.chain_derivative = 0;

    this.value = output;

    this.derivative = this.squash.derivative(x) * this.matrix.miu_prime();;

    return output;
  };

  this.jumbleTrainRate = function (probability) {
    (typeof probability !== 'number') ? probability = 1 : null;
    for (var i = 0; i < this.backconnections.length; i++) {
      if (Math.random() <= probability && this.backconnections[i].frozen === false) {
        this.backconnections[i].local_trainrate = Math.random();
      };
    };
  };

  this.connect = function (unit, weight) {
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
        unit.backconnections.push({neurone: this, weight: weight, dropout: false, frozen: false, local_trainrate: Math.random()});
      };
    return this;
  };

  this.freeze = function (probability) {
    // freezes weights of the neurone

    var frozen = new Array();
    (typeof probability !== 'number') ? probability = 1 : null;

    for (var i = 0; i < this.backconnections.length; i++) {
      if (Math.random() <= probability && this.backconnections[i].weight !== undefined && this.backconnections[i].frozen == false) {
        this.backconnections[i].frozen = true;
        frozen.push(this.backconnections[i]);
      };
    };
    return frozen;
  };

  this.unfreeze = function (probability) {
    // freezes weights of the neurone
    var frozen = new Array();
    (typeof probability !== 'number') ? probability = 1 : null;

    for (var i = 0; i < this.backconnections.length; i++) {
      if (Math.random() <= probability && this.backconnections[i].weight !== undefined && this.backconnections[i].frozen == true) {
        this.backconnections[i].frozen = false;
        frozen.push(this.backconnections[i]);
      };
    };
    return frozen;
  };

  this.getUnsquashedOutput = function () {
    return this.cache.miu;
  };

  this.backpropagate = function (additiveRate) {

    if (this.chain_derivative === undefined) {
      throw "[Neuras] Neurone class should have been forwarded prior to backpropagation!";
    };
    if (typeof additiveRate !== 'number') {
      additiveRate = 1;
    };
    // backpropagate derivative
    var derivative = this.chain_derivative * this.derivative * additiveRate;
    for (var i = 0; i < this.backconnections.length; i++) {
      // additive rate is multiplied to the current derivative to alter the training rate of the current neurone;
      // it does not affect the neurones further back the line
      if (this.backconnections[i].dropout == false && this.backconnections[i].weight !== undefined) {

        if (this.backconnections[i].frozen == false) {
          this.backconnections[i].weight -= derivative * this.backconnections[i].neurone.value * this.backconnections[i].local_trainrate;
        };

        //update previous derivatives
        this.backconnections[i].neurone.chain_derivative += derivative * this.backconnections[i].weight * this.backconnections[i].local_trainrate; //this.squash.derivative(this.cache.miu) * this.chain_derivative * this.backconnections[i].weight;
      };
    };
    this.chain_derivative = 0;
    return this;
  };

  this.changeSquash = function (sq) {
    this.squash = new Squash(sq);
    return this;
  };

  this.dropout = function (probability) {

    if (typeof probability != 'number') {
      probability = 1;
    };

    var drops = new Array();
    for (var i = 0; i < this.backconnections.length; i++) {
      if (Math.random() <= probability) {
        drops.push(this.backconnections[i]);
        this.backconnections[i].dropout = !this.backconnections[i].dropout;
      };
    };
    return drops;
  };

  this.monodropout = function (backconnection) {
    var index = find_backconnection(backconnection, this.backconnections);
    this.backconnections[index].dropout = !this.backconnections[index].dropout;
    return this.backconnections[index].dropout;
  };

  this.extinguish = function () {
    this.dropout(1);
    return this;
  }
  this.rekindle = function () {
    for (var i = 0; i < this.backconnections.length; i++) {
      this.backconnections[i].dropout == false;
    };
  };

  this.disconnectDuplicates = function () {
    for (var i = 0; i < this.backconnections.length - 1; i++) {
      for (var j = this.backconnections.length - 1; j > i; j--) {
        if (this.backconnections[j].neurone === this.backconnections[i].neurone) {
          this.backconnections.splice(j, 1);
        };
      };
    };
    return this;
  };

  this.setDerivativeChain = function (x) {
    this.chain_derivative = x;
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

};
