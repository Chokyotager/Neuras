var Squash = require('./Squash');
var uuid = require('../libs/uuid_generator');
var NMatrix = require('./NeuroneMatrix');
//var Input = require('./Input');

module.exports = function () {
  this.gate = new Squash('tanh');
  this.uuid = uuid();
  this.connections = new Array();
  this.backconnections = new Array();
  this.biases = 0;
  this.cache = new Object();
  this.value = 0;

  this.meta = new Object();
  this.meta.weighted = true;
  this.meta.type = 'neurone';

  Object.freeze(this.meta);

  this.addBias = function (weighted, bias) {
    var push = {neurone: {type: 'bias', uuid: uuid()}, dropout: false};
    if (weighted == true) {
      push.weight = Math.random();
    };
    if (typeof bias != 'number') {
      bias = Math.random();
    };
    this.biases++
    push.neurone.value = bias;
    this.backconnections.unshift(push);
    return this.backconnections[0];
  };

  this.matrix = {
    miu: function (m) { return m.reduce(function (a, b) {return a + b;})},
    // partial derivative = 1 w.r.t. factor
    miu_prime: function (m) {return 1},
    zeta: function (b) {
      var m = new Array();
      for (var i = 0; i < b.length; i++) {
        if (b[i].dropout == false) {
          b[i].weight !== undefined ? m.push(b[i].neurone.value * b[i].weight) : m.push(0);
        } else {
          m[i] = 0;
        };
      };
      return m;
    }
  };

  this.forward = function () {

    var matrix = this.matrix.zeta(this.backconnections);

    matrix.length == 0 ? matrix[0] = 0 : null;

    var x = this.matrix.miu(matrix);

    var output = this.gate.forward(x);

    this.cache.miu = x;
    this.cache.matrix = matrix;
    this.chain_derivative = 0;

    this.value = output;

    this.derivative = this.gate.derivative(x) * this.matrix.miu_prime();;

    return output;
  };

  this.connect = function (unit, weight) {
    var unweightedInstance = unit.meta.weighted == false;
    var weightedInstance = unit.meta.weighted == true;
    if (!unweightedInstance && !weightedInstance) {
      throw "[Neuras] Inappropriate connection (to) instance.";
    };

    if (unweightedInstance) {
      if (unit.meta.type == 'input' && unit.backconnections.length > 0) {
        throw "[Neuras] Input classes can only have a maximum of one backconnection!";
      };
      unit.backconnections.push({neurone: this});
    } else {
      if (typeof weight !== 'number') {
        weight = Math.random();
      };
      unit.backconnections.push({neurone: this, weight: weight, dropout: false});
    };
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
        this.backconnections[i].weight -= derivative * this.backconnections[i].neurone.value;
        this.backconnections[i].neurone.chain_derivative += derivative * this.backconnections[i].weight;
      } else {
        this.backconnections[i].neurone.chain_derivative += 0;
      };
    };
    return this;
  };

  this.changeSquash = function (sq) {
    this.gate = new Squash(sq);
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

  this.setDerivativeChain = function (x) {
    this.chain_derivative = x;
    return this;
  };

  // not in use
  this.monopropagate = function (chain, rate, backconnection) {
    // backpropagates through chosen connection relative to neurone
    var index = find_backconnection(backconnection, this.backconnections);
    if (this.backconnection[index].dropout == false && this.backconnections[i].weight !== undefined) {
      this.backconnection[index].weight -= rate * this.derivative * this.cache.matrix[i] * chain;
    };
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
