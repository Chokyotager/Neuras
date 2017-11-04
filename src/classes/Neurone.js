var Gate = require('./Gate');
var uuid = require('../libs/uuid_generator');
var Connection = require('./Connection');

module.exports = function () {
  this.gate = new Gate('tanh');
  this.uuid = uuid();
  this.connections = new Array();
  this.backconnections = new Array();
  this.biases = 0;

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
    var forwards = new Array();

    this.cache = {miu: x, matrix: matrix, squashed: fw}

    this.derivative = this.gate.derivative(x) * this.matrix.miu_prime();

    return fw;
  };

  this.changeSquash = function (sq) {
    this.gate = new Gate(sq);
    return this;
  };

  this.connect = function (neurone, weight) {
    if (weight == true || weight == undefined) {
      weight = 2 * (Math.random() - 0.5);
    };
    this.connections.push({neurone: neurone});
    neurone.backconnections.push({neurone: this, weight: weight, dropout: false});
    /*this.connections.push(new Connection(this, neurone, weight));*/
    return this;
  };

  this.dropout = function (probability) {

    if (typeof probability != 'number') {
      probability = 1;
    }

    for (var i = 0; i < this.backconnections.length; i++) {
      if (Math.random() <= probability) {
        this.backconnections[i].dropout = !this.backconnections[i].dropout;
      };
    };

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
  };

  this.monopropagate = function (chain, rate, backconnection) {
    // backpropagates through chosen connection relative to neurone
    var index = find_backconnection(backconnection, this.backconnections);
    if (this.backconnection[index].dropout == false && this.backconnections[i].weight !== undefined) {
      this.backconnection[index] -= this.backconnection[index].weight -= rate * this.derivative * this.cache.matrix[i] * chain;
    };
  };

  function find_backconnection (backconnection, backconnections) {
    console.log(backconnections);
    for (var i = 0; i < backconnections.length; i++) {
      if (backconnection == backconnections[i]) {
        return i;
      };
    };
    throw "[NJS] Cannot find backconnection in neurone!";
  };

};
