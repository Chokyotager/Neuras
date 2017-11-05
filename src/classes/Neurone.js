var Gate = require('./Gate');
var uuid = require('../libs/uuid_generator');
var Connection = require('./Connection');
//var Input = require('./Input');

module.exports = function () {
  this.gate = new Gate('tanh');
  this.uuid = uuid();
  this.connections = new Array();
  this.backconnections = new Array();
  this.biases = 0;
  this.cache = new Object();
  this.cache.next = new Array();

  this.addBias = function (weighted, bias) {
    var push = {neurone: {type: 'bias', uuid: uuid()}, dropout: false};
    if (weighted == true) {
      push.weight = Math.random();
    };
    if (typeof bias != 'number') {
      bias = Math.random();
    };
    this.biases++
    push.bias = bias;
    this.backconnections.unshift(push);
    return this.backconnections[0];
  };

  this.matrix = {
    miu: function (m) { return m.reduce(function (a, b) {return a + b;})},
    // partial derivative = 1 w.r.t. factor
    miu_prime: function (m) {return 1},
    zeta: function (m, b) {
      for (var i = 0; i < b.length; i++) {
        if (b[i].dropout == false) {
          b[i].weight !== undefined ? m[i] *= b[i].weight : null;
        } else {
          m[i] = 0;
        };
      };
      return m;
    }
  };

  this.forward = function (matrix) {

    for (var i = 0; i < this.biases; i++) {
      matrix.unshift(this.backconnections[i].bias)
    };

    matrix = this.matrix.zeta(matrix, this.backconnections);
    var x = this.matrix.miu(matrix);

    var fw = this.gate.forward(x);

    this.cache.miu = x;
    this.cache.matrix = matrix;
    this.cache.squashed = fw;
    this.cache.chain_derivative = 0;

    this.derivative = this.gate.derivative(x) * this.matrix.miu_prime();

    return fw;
  };

  this.changeSquash = function (sq) {
    this.gate = new Gate(sq);
    return this;
  };

  this.continuous_forward = function () {
    var output = this.forward(this.cache.next);
    this.cache.next = new Array();
    for (var i = 0; i < this.connections.length; i++) {
      this.connections[i].neurone.cache.next.push(output);
    };
    return output;
  };

  this.connect = function (neurone, weight) {

    if (!(neurone instanceof module.exports)) {
      throw "[NJS] Connection not instance of neurone!";
    };

    if (weight == true || weight == undefined) {
      //weight = Math.random();
      weight = 2 * (Math.random() - 0.5);
    };
    this.connections.push({neurone: neurone});
    neurone.backconnections.push({neurone: this, weight: weight, dropout: false});
    neurone.initialise_chain_derivative();
    /*this.connections.push(new Connection(this, neurone, weight));*/
    return this;
  };

  this.chain_backpropagate = function (additiveRate) {

    if (this.cache.chain_derivative === undefined) {
      throw "[NJS] Neurone class should have been forwarded prior to backpropagation!";
    };
    if (typeof additiveRate !== 'number') {
      additiveRate = 1;
    };
    // backpropagate derivative
    var derivative = this.cache.chain_derivative * this.derivative;
    this.backpropagate(derivative, additiveRate);
    for (var i = 0; i < this.backconnections.length; i++) {
      // additive rate is multiplied to the current derivative to alter the training rate of the current neurone;
      // it does not affect the neurones further back the line

      if ((this.backconnections[i] instanceof module.exports)) {
        if (this.backconnections[i].dropout == false) {
          this.backconnections[i].neurone.cache.chain_derivative += derivative * this.backconnections[i].weight;
        } else {
          this.backconnections[i].neurone.cache.chain_derivative += 0;
        };
      };
    };
  };

  this.initialise_chain_derivative = function () {
    // used for output neurones where there is no neural chain derivative
    var end_of_chain = false;
    if (this.connections.length == 0) {
      this.cache.chain_derivative = 1;
      end_of_chain = true;
    };
    return end_of_chain;
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

  this.backpropagate = function (chain, rate) {
    // backpropagates through all the backconnected weights for this neurone
    for (var i = 0; i < this.backconnections.length; i++) {
      if (this.backconnections[i].dropout == false && this.backconnections[i].weight !== undefined) {
        this.backconnections[i].weight -= rate * this.derivative * this.cache.matrix[i] * chain;
      };
    };
    return this;
  };

  this.monopropagate = function (chain, rate, backconnection) {
    // backpropagates through chosen connection relative to neurone
    var index = find_backconnection(backconnection, this.backconnections);
    if (this.backconnection[index].dropout == false && this.backconnections[i].weight !== undefined) {
      this.backconnection[index] -= this.backconnection[index].weight -= rate * this.derivative * this.cache.matrix[i] * chain;
    };
    return this;
  };

  function find_backconnection (backconnection, backconnections) {
    for (var i = 0; i < backconnections.length; i++) {
      if (backconnection == backconnections[i]) {
        return i;
      };
    };
    throw "[NJS] Cannot find backconnection in neurone!";
  };

};
