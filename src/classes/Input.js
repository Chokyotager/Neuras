var Gate = require('./Gate');
var uuid = require('../libs/uuid_generator');
var Connection = require('./Connection');
var Neurone = require('./Neurone');

module.exports = function () {
  this.gate = new Gate('tanh');
  this.uuid = uuid();
  this.connections = new Array();

  this.forward = function (x) {

    typeof x == 'array' ? x = x[0] : null;

    var fw = this.gate.forward(x);
    var forwards = new Array();

    return fw;
  };

  this.changeSquash = function (sq) {
    this.gate = new Gate(sq);
    return this;
  };

  this.connect = function (neurone, weight) {

    if (!(neurone instanceof Neurone)) {
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

  this.continuous_forward = function (x) {
    var output = this.forward(x);
    for (var i = 0; i < this.connections.length; i++) {
      this.connections[i].neurone.cache.next.push(output);
    };
    return output;
  };

};
