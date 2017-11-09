var Squash = require('./Squash');
var uuid = require('../libs/uuid_generator');

module.exports = function () {
  this.gate = new Squash('tanh');
  this.uuid = uuid();
  this.connections = new Array();
  this.backconnections = new Array();
  this.value = 0;
  this.derivative = 1;
  this.chain_derivative = 0;

  this.meta = new Object;
  this.meta.type = 'input';
  this.meta.weighted = false;

  Object.freeze(this.meta.weighted);

  this.setDerivativeChain = function (x) {
    this.chain_derivative = x;
    return this;
  };

  this.forward = function (x) {

    if (x === undefined) {
      if (this.backconnections.length == 0) {
        throw "[Neuras] Cannot forward an undefined value with a starter Input class!";
      };
      x = this.backconnections[0].neurone.value;
    };

    typeof x == 'array' ? x = x[0] : null;

    var output = this.gate.forward(x);
    var forwards = new Array();

    this.chain_derivative = 0;
    this.value = output;

    return output;
  };

  this.changeSquash = function (sq) {
    this.gate = new Squash(sq);
    return this;
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

  this.backpropagate = function () {
    // No weights to backpropagate to, so derivatives are just updated instead
    for (var i = 0; i < this.backconnections.length; i++) {
      this.backconnections[i].neurone.chain_derivative += this.chain_derivative;
    };
  };

};
