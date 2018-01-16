var Layer = require('./Layer');
var Seeder = require('./Seeder');

module.exports = class {

  constructor (chronology, autolink) {
    // chronology == layers to forward in order

    if (autolink == true) {
      for (var i = 0; i < chronology.length - 1; i++) {
        chronology[i].connect(chronology[i + 1]);
      };
    };

    this.meta = new Object();
    this.meta.type = 'linkage';
    this.meta.weighted = false;

    this.chronology = chronology;
    this.configuration = new Array();

    for (var i = 0; i < chronology.length; i++) {
      if (!(chronology[i] instanceof Layer)) {
        throw "[Neuras] Element (index: " + i.toString() + ") is not a Layer class!";
      };

      var layerconf = [0, 0];

      for (var j = 0; j < chronology[i].neurones.length; j++) {
        if (chronology[i].neurones[j].meta.type === 'linkage') {
          layerconf[0] += chronology[i].neurones[j].configuration[0][0];
          layerconf[1] += chronology[i].neurones[j].configuration[chronology[i].neurones[j].configuration.length - 1][1];
        } else if (chronology[i].neurones[j].meta.type === 'buffer') {
          layerconf[0] += chronology[i].neurones[j].backconnections.length;
          layerconf[1] += chronology[i].neurones[j].backconnections.length;
        } else {
          layerconf[0]++;
          layerconf[1]++;
        };
      };
      this.configuration.push(layerconf);
    };
  };

  forward (m) {

    if (m === undefined) {
      this.chronology[0].forward();
    } else {
      this.chronology[0].forward(m);
    };

    // forward hidden
    for (var i = 1; i < this.chronology.length; i++) {
      var latest = this.chronology[i].forward();
    };
    return latest;
  };

  passivelyForward (m, times, options) {
    typeof times !== 'number' ? times = 1 : null;

    options = options || new Object();

    var logs = new Array();
    var clone = this.clone();
    for (var i = 0; i < times; i++) {
      logs.push(clone.forward(m));
      options.loop == true ? m = logs[i] : null;
    };

    return options.log == true ? logs : logs[times - 1];
  };

  merge (linkage, connect) {
    if (!(linkage instanceof module.exports)) {
      throw "[Neuras] Can only merge to Linkage classes!";
    };

    if (connect) {
      this.connect(linkage);
    };

    this.chronology = this.chronology.concat(linkage.chronology);
    this.configuration = this.configuration.concat(linkage.configuration);
    return this;
  };

  clone () {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  };

  createDeviant() {
    return this.clone().seed();
  };

  jumbleTrainRate (probability, seed) {
    (typeof probability !== 'number') ? probability = 1 : null;

    seed = Seeder.from(seed);

    for (var i = 0; i < chronology.length; i++) {
      chronology[i].jumbleTrainRate(probability, seed.add(1));
    };
  };

  messUpWeights (probability, delta, seed) {
    (typeof probability !== 'number') ? probability = 1 : null;
    (typeof delta !== 'number') ? delta = 0.05 : null;

    seed = Seeder.from(seed);

    for (var i = 0; i < chronology.length; i++) {
      chronology[i].messUpWeights(probability, delta, seed.add(1));
    };
  };

  lock () {
    for (var i = 0; i < this.chronology.length; i++) {
      this.chronology[i].lock();
    };
    return this;
  };

  unlock () {
    for (var i = 0; i < this.chronology.length; i++) {
      this.chronology[i].unlock();
    };
    return this;
  };

  toLayer () {
    return new Layer().addLinkage(this);
  };

  backpropagate (chain_m) {
    // backpropagate output neurones
    //console.log(this.chronology[this.chronology.length - 1])

    if (chain_m !== undefined) {
      //console.log(this.configuration)
      if (chain_m.length !== this.configuration[this.configuration.length - 1][1]) {
        throw "[Neuras] Backpropagation set (length: " + chain_m.length + ") should be equal to number of output/hidden (length: " + this.configuration[this.configuration.length - 1][1] + ") Neurones in last Layer!";
      };

      var n = Array.from(chain_m)

      this.setDerivativeChain('last', 'output', n);

    };

    for (var i = this.chronology.length - 1; i >= 0; i--) {
      this.chronology[i].backpropagate();
    };

    return this;

  };

  connect (unit, probability, seed) {

    if (typeof probability !== 'number') {
      probability = 1;
    };

    seed = Seeder.from(seed);

    var output = this.chronology[this.chronology.length - 1];

    for (var i = 0; i < output.neurones.length; i++) {
      if (seed.add(1).random() < probability) {
        if (unit.meta.type == 'linkage') {
          output.connect(unit.chronology[0]);
        } else {
          output.neurones[i].connect(unit);
        };
      };
    };
    return unit;
  };

  disconnectDuplicates () {
    this.chronology[0].disconnectDuplicates();
    return this;
  };

  getUnsquashedOutput () {
    var last_layer = this.chronology[this.chronology.length - 1];
    return last_layer.getUnsquashedOutput();
  };

  dropoutNeurones (probability, seed) {

    if (typeof probability !== 'number') {
      throw "[Neuras] Probability for dropouts cannot be undefined!";
    };

    seed = Seeder.from(seed);

    for (var i = 0; i < this.chronology.length; i++) {
      this.chronology[i].dropoutNeurones(probability, seed.add(1));
    };

  };

  dropoutWeights (probability, seed) {

    if (typeof probability !== 'number') {
      throw "[Neuras] Probability for dropouts cannot be undefined!";
    };

    seed = Seeder.from(seed);

    for (var i = 0; i < this.chronology.length; i++) {
      this.chronology[i].dropoutWeights(probability, seed.add(1));
    };

  };

  seed (seed) {

    seed = Seeder.from(seed);

    for (var i = 0; i < this.chronology.length; i++) {
      this.chronology[i].seed(seed.add('2'));
    };
    return this;
  };

  setDerivativeChain (type, layer, chain_m) {

    if (typeof layer !== 'number') {
      switch (layer) {
      case "last":
        layer = this.chronology.length - 1;
        break;

      case "first":
        layer = 0;
        break;

      default:
        layer = this.chronology.length - 1;
        break;
      };
    };

    switch (type) {
      case "input":
        type = 0;
        break;

      case "output":
        type = "last";
        break;

      default:
        type = "last";
        break;
    };

    var res = new Array();
    for (var i = 0; i < this.chronology[layer].neurones.length; i++) {
        if (this.chronology[layer].neurones[i].meta.type === "linkage") {
          this.chronology[layer].neurones[i].setDerivativeChain(type, 'last', chain_m);
        } else if (this.chronology[layer].neurones[i].meta.type === "buffer") {
          // set array'd deriv chain for buffers
          // splice array
          var splicable = chain_m.splice(0, this.chronology[layer].neurones[i].backconnections.length);
          this.chronology[layer].neurones[i].setDerivativeChain(splicable);
        } else {
          this.chronology[layer].neurones[i].setDerivativeChain(chain_m[0]);
          chain_m.shift();
        };

    };
    return res;
  };

};
