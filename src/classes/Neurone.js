var Squash = require('./Squash');
var Seeder = require('./Seeder');
var NMatrix = require('./NeuroneMatrix');
var Protoneurone = require('./prototypes/Protoneurone');
//var Input = require('./Input');

module.exports = class extends Protoneurone {

  constructor () {

    super();

    this.squash = new Squash('tanh');
    this.backconnections = new Array();
    this.biases = 0;
    this.cache = new Object();
    this.value = 0;
    this.chain_derivative = 0;

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

  };

  messUpWeights (probability, delta, seed) {
    (typeof probability !== 'number') ? probability = 1 : null;
    (typeof delta !== 'number') ? delta = 0.05 : null;

    seed = Seeder.from(seed);

    for (var i = 0; i < this.backconnections.length; i++) {
      if (this.backconnections[i].frozen === false) {
        this.backconnections[i].weight -= this.backconnections[i].weight * (seed.random() - 0.5) * 2 * delta;
      };
    };

  };

  setWeights (weight) {
    (typeof weight !== 'number') ? weight = 1 : null;

    for (var i = 0; i < this.backconnections.length; i++) {
        this.backconnections[i].weight = weight;
    };

    return this;
  };

  addBias (weighted, bias) {
    var push = {neurone: {type: 'bias'}, dropout: false};
    if (weighted == true) {
      push.weight = 2 * (Math.random()-.5);
    };

    if (typeof bias != 'number') {
      bias = 2 * (Math.random()-.5);
    };
    this.biases++
    push.neurone.value = bias;
    this.backconnections.unshift(push);
    return this;
  };

  forward (x) {

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

  backpropagate (additiveRate) {

    (typeof additiveRate !== 'number') ? additiveRate = 1 : null;

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

  jumbleTrainRate (probability, seed) {
    (typeof probability !== 'number') ? probability = 1 : null;
    seed = Seeder.from(seed);
    for (var i = 0; i < this.backconnections.length; i++) {
      if (seed.add(1).random() < probability && this.backconnections[i].frozen === false) {
        this.backconnections[i].local_trainrate = Math.random();
      };
    };
  };

  freeze (probability, seed) {
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

  unfreeze (probability, seed) {
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

  dropout (probability) {
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

  extinguish () {
    this.dropout(1);
    return this;
  }

  rekindle () {
    for (var i = 0; i < this.backconnections.length; i++) {
      this.backconnections[i].dropout == false;
    };
  };

  seedWeights (seed) {
    seed = Seeder.from(seed);

    for (var i = 0; i < this.backconnections.length; i++) {
      this.backconnections[i].weight !== undefined ? this.backconnections[i].weight = 2 * (seed.add('W').random() - 0.5) : null;
    };
    return this;
  };

  seedBiases (seed) {
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

  seed (seed) {
    this.seedWeights(seed);
    this.seedBiases(seed);
  };

};
