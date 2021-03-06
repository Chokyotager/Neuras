var Neurone = require('./Neurone');
var Gate = require('./Gate');
var Buffer = require('./Buffer');
var Seeder = require('./Seeder');

module.exports = class {

  constructor () {
    this.neurones = new Array();
    this.order = {type: 'forward', seed: undefined};
    this.forwardCount = 0;
    this.meta = {type: 'layer'};
  };

  setFiringOrder (order, seed) {
    if (order !== 'forward' && order !== 'backward' && order !== 'random') {
      throw "[Neuras] Order can only be 'forward', 'backward' or 'random'!";
    };
    this.order.type = order;
    this.order.seed = seed;
    return this;
  };

  addNeurones (neurones, squash, params) {
    (squash === undefined) ? squash = 'tanh' : null;
    for (var i = 0; i < neurones; i++) {
      this.neurones.push(new Neurone().changeSquash(squash, params));
    };
    return this;
  };

  lock () {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].lock();
    };
  };

  unlock () {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].unlock();
    };
  };

  selfconnect (probability, seed) {
    seed = Seeder.from(seed);
    for (var i = 0; i < this.neurones.length; i++) {
      if (seed.add(1).random() < probability) {
        this.neurones[i].connect(this.neurones[i]);
      };
    };
    return this;
  };

  addGate (gate) {

    if (!(gate instanceof Gate)) {
      throw "[Neuras] Not a Gate!";
    };
    this.neurones.push(gate);
    return this;
  };

  addBuffers (buffers) {
    for (var i = 0; i < buffers; i++) {
      this.neurones.push(new Buffer());
    };
    return this;
  };

  addGates (gates, gateType, options) {

    for (var i = 0; i < gates; i++) {
      this.neurones.push(new Gate(gateType, options));
    };
    return this;
  };

  addBiases (probability, weighted, seed, bias) {

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

  addLinkage (linkage) {
    this.neurones.push(linkage);
    return this;
  };

  addLinkages (linkages, linkage) {

    if (typeof linkages !== 'number' || linkages <= 0) {
      throw "[Neuras] Should add least add one linkage using addLinkages()!";
    };

    this.neurones.push(linkage);
    for (var i = 0; i < linkages - 1; i++) {
      this.neurones.push(linkage.createDeviant());
    };
    return this;
  };

  addUnits (units) {
    for (var i = 0; i < units.length; i++) {
      if (units[i].meta === undefined) {
        throw "[Neuras] Invalid unit! (Index: " + i.toString() + ")";
      };
    };
    this.neurones = this.neurones.concat(units);
    return this;
  };

  dropoutNeurones (probability, seed) {

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

  jumbleTrainRate (probability, seed) {

    (typeof probability !== 'number') ? probability = 1 : null;

    seed = Seeder.from(seed);

    for (var i = 0; i < this.neurones.length; i++) {
      if (seed.add(1).random() < probability && (this.neurones[i].meta.type === 'neurone' || this.neurones[i].meta.type === 'linkage')) {
        this.neurones[i].jumbleTrainRate(probability, seed);
      };
    };
  };

  messUpWeights (probability, delta, seed) {

    (typeof probability !== 'number') ? probability = 1 : null;
    (typeof delta !== 'number') ? delta = 0.05 : null;

    seed = Seeder.from(seed);

    for (var i = 0; i < this.neurones.length; i++) {
      if (seed.add(1).random() < probability && (this.neurones[i].meta.type === 'neurone' || this.neurones[i].meta.type === 'linkage')) {
        this.neurones[i].messUpWeights(probability, delta, seed);
      };
    };
  };

  setWeights (weight) {
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i].meta.type === 'neurone') {
        this.neurones[i].setWeights(weight);
      };
    };

    return this;
  };

  dropoutWeights (probability, seed) {
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

  freezeNeurones (probability, seed) {

    (typeof probability !== 'number') ? probability = 1 : null;
    seed = Seeder.from(seed);

    for (var i = 0; i < this.neurones.length; i++) {
      if (seed.add(1).random() < probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].freeze();
      };
    };
    return this;
  }

  freezeWeights (probability, seed) {

    (typeof probability !== 'number') ? probability = 1 : null;
    seed = Seeder.from(seed);

    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].freeze(probability, seed.add(1));
      };
    };
    return this;
  };

  unfreezeNeurones  (probability, seed) {

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

  unfreezeWeights  (probability, seed) {

    (typeof probability !== 'number') ? probability = 1 : null;
    seed = Seeder.from(seed);

    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].unfreeze(probability, seed.add(1));
      };
    };
    return this;
  };

  extinguish () {
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].extinguish();
      };
    };
    return this;
  };

  rekindle () {
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].rekindle();
      };
    };
    return this;
  };

  connect (layer, probability, seed) {
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

  disconnectDuplicates () {
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i].meta.type !== 'buffer') {
        this.neurones[i].disconnectDuplicates();
      };
    };
    return this;
  };

  connectSequentially (layer, probability, seed) {
    if (!(layer instanceof module.exports)) {
      throw "[Neuras] Can only connect to Layer classes!";
    };

    (typeof probability !== 'number') ? probability = 1 : null;

    seed = Seeder.from(seed);

    // Cycle through linkage chronology
    var latter_inputs = this.__getIONeurones('input');

    var potential_connections = Math.min(this.neurones.length, latter_inputs.length);

    for (var i = 0; i < potential_connections; i++) {
      if (seed.add(1).random() < probability) {
        this.neurones[i].connect(latter_inputs[i], seed);
      };
    };
    return layer;
  };

  connectRespectively (layer) {
    if (!(layer instanceof module.exports)) {
      throw "[Neuras] Can only connect to Layer classes!";
    };
    this.connectSequentially(layer);
    this.connect(layer);
    layer.disconnectDuplicates();
    return layer;
  }

  getOutput () {
    var cache = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      cache.push(this.neurones[i].value);
    };
    return cache;
  };

  backpropagate () {

    var firingSequence = this.__determineFiringSequence(this.order.type, Seeder.from(this.order.seed).add(this.forwardCount));
    for (var i = firingSequence.length - 1; i >= 0; i--) {
      this.neurones[firingSequence[i]].backpropagate();
    };

    return this;
  };

  getUnsquashedOutput () {
    var ret = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      var out = this.neurones[i].getUnsquashedOutput();
      Array.isArray(out) ? ret = ret.concat(out) : ret.push(out);
    };
    return ret;
  };

  seed (seed) {
    seed = Seeder.from(seed);
    this.order.seed = seed.seed;
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i].meta.type !== 'gate' && this.neurones[i].meta.type !== 'buffer') {
        this.neurones[i].seed(seed.add(3));
      };
    };
    return this;
  };

  forward (v) {
    var output = new Array();
      if (v === undefined) {
        var firingSequence = this.__determineFiringSequence(this.order.type, Seeder.from(this.order.seed).add(this.forwardCount));
        var temp = new Array(firingSequence.length);
        for (var i = 0; i < firingSequence.length; i++) {
          var out = this.neurones[firingSequence[i]].forward();
          temp[firingSequence[i]] = out;
        };

        for (var i = 0; i < temp.length; i++) {
          Array.isArray(temp[i]) ? output = output.concat(temp[i]) : output.push(temp[i]);
        };

      } else {
        if (this.__getIONeurones('input').length !== v.length) {
          throw "[Neuras] Forward input array (length: " + v.length + ") does not equate to number of Neurone classes in Layer (length: " + this.__getIONeurones('input').length + ")!";
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
    this.forwardCount++;
    return output;
  };

  __determineFiringSequence (type, seed) {
    var arx = new Array(this.neurones.length);
    for (var i = 0; i < arx.length; i++) {
      arx[i] = i;
    };

    switch (type) {
      case "backward":
        arx.reverse();
        break;

      case "random":
        shuffle(arx, seed);
        break;
    };

    return arx;
  };

  __getIONeurones (type) {

    (type !== 'input' && type !== 'output') ? type = 'input' : null;

    var res = new Array();

    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i].meta.type === 'linkage') {
        res.concat(this.neurones[i].getIONeurones(type, type));
      } else {
        res.push(this.neurones[i]);
      };
    };

    return res;

  };

};

function shuffle (a, seed) {
  // Fisher-Yates
  seed = Seeder.from(seed);
  for (var i = 0; i < a.length; i++) {
    var index = Math.floor(seed.add('#').random() * a.length);

    var cache = a[i];
    a[i] = a[index];
    a[index] = cache;
  };
};
