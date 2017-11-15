var Neurone = require('./Neurone');
var Gate = require('./Gate');
var Buffer = require('./Buffer');

module.exports = function () {
  this.neurones = new Array()

  this.addNeurones = function (neurones, squash) {
    (squash === undefined) ? squash = 'tanh' : null;
    for (var i = 0; i < neurones; i++) {
      this.neurones.push(new Neurone().changeSquash(squash));
    };
    return this;
  };

  this.lock = function () {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].lock();
    };
  };

  this.unlock = function () {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].unlock();
    };
  };

  this.addGate = function (gate) {

    if (!(gate instanceof Gate)) {
      throw "[Neuras] Not a Gate!";
    };
    this.neurones.push(gate);
    return this;
  };

  this.addBuffers = function (buffers) {
    for (var i = 0; i < buffers; i++) {
      this.neurones.push(new Buffer());
    };
    return this;
  };

  this.addGates = function (gates, gateType, options) {

    for (var i = 0; i < gates; i++) {
      this.neurones.push(new Gate(gateType, options));
    };
    return this;
  };

  this.addBiases = function (probability, weighted, bias) {

    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].addBias(weighted, bias);
      };
    };
    return this;
  };

  this.addLinkage = function (linkage) {

    this.neurones.push(linkage);
    return this;
  };

  this.addUnits = function (units) {
    for (var i = 0; i < units.length; i++) {
      if (units[i].meta === undefined) {
        throw "[Neuras] Invalid unit! (Index: " + i.toString() + ")";
      };
    };
    this.neurones = this.neurones.concat(units);
    return this;
  };

  this.dropoutNeurones = function (probability) {
    var neurones = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].dropout(1);
        neurones.push(this.neurones[i]);
      };
    };
    return neurones;
  };

  this.dropoutWeights = function (probability) {
    var weights = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i] instanceof Neurone) {
        weights.push(this.neurones[i].dropout(probability));
      };
    };
    return weights;
  };

  this.freezeNeurones = function (probability) {

    (typeof probability !== 'number') ? probability = 1 : null;

    var neurones = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].freeze();
        neurones.push(this.neurones[i]);
      };
    };
    return neurones;
  }

  this.freezeWeights = function (probability) {

    (typeof probability !== 'number') ? probability = 1 : null;

    var weights = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i] instanceof Neurone) {
        weights.push(this.neurones[i].freeze(probability));
      };
    };
    return weights;
  }

  this.unfreezeNeurones = function  (probability) {

    (typeof probability !== 'number') ? probability = 1 : null;

    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability) {
        if (this.neurones[i] instanceof Neurone) {
          this.neurones[i].unfreeze();
        };
      };
    };
    return this;
  };

  this.unfreezeWeights = function  (probability) {

    (typeof probability !== 'number') ? probability = 1 : null;

    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].unfreeze(probability);
      };
    };
    return this;
  };

  this.extinguish = function () {
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].extinguish();
      };
    };
    return this;
  };

  this.rekindle = function () {
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].rekindle();
      };
    };
    return this;
  };

  this.connect = function (layer, probability) {
    if (!(layer instanceof module.exports)) {
      throw "[Neuras] Can only connect to Layer classes!";
    };

    if (typeof probability !== 'number') {
      probability = 1;
    };

    for (var i = 0; i < this.neurones.length; i++) {
      for (var j = 0; j < layer.neurones.length; j++) {
        if (Math.random() <= probability) {
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

  this.disconnectDuplicates = function () {
    for (var i = 0; i < this.neurones.length; i++) {
      if (this.neurones[i].meta.type !== 'gate') {
        this.neurones[i].disconnectDuplicates();
      };
    };
    return this;
  };

  this.connectSequentially = function (layer, probability) {
    if (!(layer instanceof module.exports)) {
      throw "[Neuras] Can only connect to Layer classes!";
    };

    if (typeof probability != 'number') {
      probability = 1;
    };

    var potential_connections = Math.min(this.neurones.length, layer.neurones.length);

    for (var i = 0; i < potential_connections; i++) {
      if (Math.random() <= probability) {
        this.neurones[i].connect(layer.neurones[i]);
      };
    };
    return layer;
  };

  this.connectRespectively = function (layer) {
    if (!(layer instanceof module.exports)) {
      throw "[Neuras] Can only connect to Layer classes!";
    };
    this.connectSequentially(layer);
    this.connect(layer);
    layer.disconnectDuplicates();
    return this;
  }

  this.getOutput = function () {
    var cache = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      cache.push(this.neurones[i].value);
    };
    return cache;
  };

  this.backpropagate = function () {

    for (var i = this.neurones.length - 1; i >= 0; i--) {
      this.neurones[i].backpropagate();
    };

    return this;
  };

  this.getUnsquashedOutput = function () {
    var ret = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      var out = this.neurones[i].getUnsquashedOutput();
      Array.isArray(out) ? ret = ret.concat(out) : ret.push(out);
    };
    return ret;
  };

  this.getInputCount = function () {
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

  this.forward = function (v) {
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

};
