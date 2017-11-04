var Gate = require('./Gate');
var uuid = require('../libs/uuid_generator');
var Connection = require('./Connection');

module.exports = function () {
  this.gate = new Gate('tanh');
  this.uuid = uuid();
  this.connections = new Array();
  this.backconnections = new Array();

  this.matrix = {
    miu: function (m) { return m.reduce(function (a, b) {return a + b;});},
    // partial derivative = 1 w.r.t. factor
    miu_prime: function (m) {return 1}
  };

  this.forward = function (matrix) {

    var x = this.matrix.miu(matrix);

    var fw = this.gate.forward(x);
    var forwards = new Array();
    for (var i = 0; i < this.connections.length; i++) {
      forwards.push(this.connections[i].weight * fw);
    };
    this.derivative = this.gate.derivative(x) * this.matrix.miu_prime()
    return forwards;
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
    neurone.backconnections.push({neurone: this, weight: weight});
    /*this.connections.push(new Connection(this, neurone, weight));*/
    return this;
  };

};
