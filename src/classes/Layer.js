var Neurone = require('./Neurone');
var Gate = require('./Gate');
var Buffer = require('./Buffer');
var Seeder = require('./Seeder');

module.exports = function () {
  this.neurones = new Array();
};

var prototype = module.exports.prototype;

prototype.addNeurones = function (neurones, squash, params) {
  (squash === undefined) ? squash = 'tanh' : null;
  for (var i = 0; i < neurones; i++) {
    this.neurones.push(new Neurone().changeSquash(squash, params));
  };
  return this;
};

prototype.lock = function () {
  for (var i = 0; i < this.neurones.length; i++) {
    this.neurones[i].lock();
  };
};

prototype.unlock = function () {
  for (var i = 0; i < this.neurones.length; i++) {
    this.neurones[i].unlock();
  };
};

prototype.selfconnect = function (probability, seed) {
  seed = Seeder.from(seed);
  this.connect(this, probability, seed.add(1));
  return this;
};

prototype.addGate = function (gate) {

  if (!(gate instanceof Gate)) {
    throw "[Neuras] Not a Gate!";
  };
  this.neurones.push(gate);
  return this;
};

prototype.addBuffers = function (buffers) {
  for (var i = 0; i < buffers; i++) {
    this.neurones.push(new Buffer());
  };
  return this;
};

prototype.addGates = function (gates, gateType, options) {

  for (var i = 0; i < gates; i++) {
    this.neurones.push(new Gate(gateType, options));
  };
  return this;
};

prototype.addBiases = function (probability, weighted, seed, bias) {

  if (weighted === undefined) {
    weighted = false;
  };

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability && this.neurones[i] instanceof Neurone) {
      this.neurones[i].addBias(weighted, bias);
    };
  };
  return this;
};

prototype.addLinkage = function (linkage) {

  this.neurones.push(linkage);
  return this;
};

prototype.addUnits = function (units) {
  for (var i = 0; i < units.length; i++) {
    if (units[i].meta === undefined) {
      throw "[Neuras] Invalid unit! (Index: " + i.toString() + ")";
    };
  };
  this.neurones = this.neurones.concat(units);
  return this;
};

prototype.dropoutNeurones = function (probability, seed) {

  if (typeof probability !== 'number') {
    throw "[Neuras] Probability for dropouts cannot be undefined!";
  };

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability) {
      if (this.neurones[i].meta.type === 'neurone') {
        this.neurones[i].dropout(1);
      } else if (this.neurones[i].meta.type === 'linkage') {
        this.neurones[i].dropoutNeurones(probability, seed);
      };
    };
  };
};

prototype.jumbleTrainRate = function (probability, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability && (this.neurones[i].meta.type === 'neurone' || this.neurones[i].meta.type === 'linkage')) {
      this.neurones[i].jumbleTrainRate(probability, seed);
    };
  };
};

prototype.messUpWeights = function (probability, delta, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;
  (typeof delta !== 'number') ? delta = 0.05 : null;

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability && (this.neurones[i].meta.type === 'neurone' || this.neurones[i].meta.type === 'linkage')) {
      this.neurones[i].messUpWeights(probability, delta, seed);
    };
  };
};

prototype.dropoutWeights = function (probability, seed) {
  if (typeof probability !== 'number') {
    throw "[Neuras] Probability for dropouts cannot be undefined!";
  };

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability) {
      if (this.neurones[i].meta.type === 'neurone') {
        this.neurones[i].dropout(probability, seed.add(1));
      } else if (this.neurones[i].meta.type === 'linkage') {
        this.neurones[i].dropoutWeights(probability, seed.add(1));
      };
    };
  };
};

prototype.freezeNeurones = function (probability, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;
  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability && this.neurones[i] instanceof Neurone) {
      this.neurones[i].freeze();
    };
  };
  return this;
}

prototype.freezeWeights = function (probability, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;
  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (this.neurones[i] instanceof Neurone) {
      this.neurones[i].freeze(probability, seed.add(1));
    };
  };
  return this;
};

prototype.unfreezeNeurones = function  (probability, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;
  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (seed.add(1).random() < probability) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].unfreeze();
      };
    };
  };
  return this;
};

prototype.unfreezeWeights = function  (probability, seed) {

  (typeof probability !== 'number') ? probability = 1 : null;
  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    if (this.neurones[i] instanceof Neurone) {
      this.neurones[i].unfreeze(probability, seed.add(1));
    };
  };
  return this;
};

prototype.extinguish = function () {
  for (var i = 0; i < this.neurones; i++) {
    if (this.neurones[i] instanceof Neurone) {
      this.neurones[i].extinguish();
    };
  };
  return this;
};

prototype.rekindle = function () {
  for (var i = 0; i < this.neurones; i++) {
    if (this.neurones[i] instanceof Neurone) {
      this.neurones[i].rekindle();
    };
  };
  return this;
};

prototype.connect = function (layer, probability, seed) {
  if (!(layer instanceof module.exports)) {
    throw "[Neuras] Can only connect to Layer classes!";
  };

  if (typeof probability !== 'number') {
    probability = 1;
  };

  seed = Seeder.from(seed);

  for (var i = 0; i < this.neurones.length; i++) {
    for (var j = 0; j < layer.neurones.length; j++) {
      if (seed.add(1).random() < probability) {
        if (layer.neurones[j].meta.type === 'linkage') {
          this.connect(layer.neurones[j].chronology[0]);
        } else {
          this.neurones[i].connect(layer.neurones[j]);
        };
      };
    };
  };
  return layer;
};

prototype.disconnectDuplicates = function () {
  for (var i = 0; i < this.neurones.length; i++) {
    if (this.neurones[i].meta.type !== 'gate') {
      this.neurones[i].disconnectDuplicates();
    };
  };
  return this;
};

prototype.connectSequentially = function (layer, probability, seed) {
  if (!(layer instanceof module.exports)) {
    throw "[Neuras] Can only connect to Layer classes!";
  };

  if (typeof probability != 'number') {
    probability = 1;
  };

  seed = Seeder.from(seed);

  var potential_connections = Math.min(this.neurones.length, layer.neurones.length);

  for (var i = 0; i < potential_connections; i++) {
    if (seed.add(1).random() < probability) {
      this.neurones[i].connect(layer.neurones[i], seed);
    };
  };
  return layer;
};

prototype.connectRespectively = function (layer) {
  if (!(layer instanceof module.exports)) {
    throw "[Neuras] Can only connect to Layer classes!";
  };
  this.connectSequentially(layer);
  this.connect(layer);
  layer.disconnectDuplicates();
  return this;
}

prototype.getOutput = function () {
  var cache = new Array();
  for (var i = 0; i < this.neurones.length; i++) {
    cache.push(this.neurones[i].value);
  };
  return cache;
};

prototype.backpropagate = function () {

  for (var i = this.neurones.length - 1; i >= 0; i--) {
    this.neurones[i].backpropagate();
  };

  return this;
};

prototype.getUnsquashedOutput = function () {
  var ret = new Array();
  for (var i = 0; i < this.neurones.length; i++) {
    var out = this.neurones[i].getUnsquashedOutput();
    Array.isArray(out) ? ret = ret.concat(out) : ret.push(out);
  };
  return ret;
};

prototype.getInputCount = function () {
  var count = 0;
  for (var i = 0; i < this.neurones.length; i++) {
    if (this.neurones[i].meta.type === 'linkage') {
      count += this.neurones[i].configuration[0][0];
    } else {
      count++;
    };
  };
  return count;
};

prototype.seed = function (seed) {
  seed = Seeder.from(seed);
  for (var i = 0; i < this.neurones.length; i++) {
    if (this.neurones[i].meta.type !== 'gate' && this.neurones[i].meta.type !== 'buffer') {
      this.neurones[i].seed(seed.add(3));
    };
  };
  return this;
};

prototype.forward = function (v) {
  var output = new Array();
    if (v === undefined) {
      for (var i = 0; i < this.neurones.length; i++) {
        var out = this.neurones[i].forward();

        Array.isArray(out) ? output = output.concat(out) : output.push(out);
      };
    } else {
      if (this.getInputCount() !== v.length) {
        throw "[Neuras] Forward input array (length: " + v.length + ") does not equate to number of Neurone classes in Layer (length: " + this.neurones.length + ")!";
      };
      for (var i = 0; i < this.neurones.length; i++) {
        if (this.neurones[i].meta.type === 'linkage') {
          var x = this.neurones[i].configuration[0][0];
          output.push(this.neurones[i].forward(v.slice(i, i+x)));
        } else {
          output.push(this.neurones[i].forward(v[i]));
        };
      };
  };
  return output;
};
