var Input = require('./Input');
var Neurone = require('./Neurone');
var Gate = require('./Gate');

module.exports = function (type) {
  this.neurones = new Array()
  if (type.toLowerCase() == 'input') {
    this.layer_type = 'input';
  } else if (type == 'hidden') {
    this.layer_type = 'hidden';
  };

  this.addNeurones = function (neurones, squash) {
    (squash === undefined) ? squash = 'tanh' : null;
    if (this.layer_type == 'input') {
      for (var i = 0; i < neurones; i++) {
        this.neurones.push(new Input().changeSquash(squash));
      };
    } else {
      for (var i = 0; i < neurones; i++) {
        this.neurones.push(new Neurone().changeSquash(squash));
      };
    };
    return this;
  };

  this.addGate = function (gate) {
    if (!(gate instanceof Gate)) {
      throw "[Neuras] Not a Gate!";
    };
    this.neurones.push(gate);
    return this;
  };

  this.addGates = function (gates, gateType, options) {
    for (var i = 0; i < gates; i++) {
      this.neurones.push(new Gate(gateType, options));
    };
    return this;
  };

  this.addBiases = function (probability, weighted, bias) {

    if (this.layer_type !== 'hidden') {
      throw "[Neuras] Can only add biases to hidden Layer classes!";
    };

    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].addBias(weighted, bias);
      };
    };
    return this;
  };

  this.getNeurones = function () {
    return this.neurones;
  };

  this.dropoutWeights = function (probability) {
    var weights = new Array();
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        weights.push(this.neurones[i].dropout(probability));
      };
    };
    return weights;
  };

  this.rekindle = function () {
    for (var i = 0; i < this.neurones; i++) {
      if (this.neurones[i] instanceof Neurone) {
        this.neurones[i].rekindle();
      };
    };
    return this;
  };

  this.dropoutNeurones = function (probability) {
    var neurones = new Array();
    for (var i = 0; i < this.neurones; i++) {
      if (Math.random() <= probability && this.neurones[i] instanceof Neurone) {
        this.neurones[i].dropout(1);
        neurones.push(this.neurones[i]);
      };
    };
    return neurones;
  };

  this.connect = function (layer, probability) {
    if (!(layer instanceof module.exports) || layer.layer_type !== 'hidden') {
      throw "[Neuras] Can only connect to hidden layers!";
    };

    if (typeof probability != 'number') {
      probability = 1;
    };

    for (var i = 0; i < this.neurones.length; i++) {
      for (var j = 0; j < layer.neurones.length; j++) {
        if (Math.random() <= probability) {
          this.neurones[i].connect(layer.neurones[j]);
        };
      };
    };
    return layer;
  };

  this.connectSequentially = function (layer, probability) {
    if (!(layer instanceof module.exports) || layer.layer_type !== 'hidden') {
      throw "[Neuras] Can only connect to hidden layers!";
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

  this.getOutput = function () {
    var cache = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      cache.push(this.neurones[i].output);
    };
    return cache;
  };

  this.backpropagate = function () {
    if (this.layer_type !== 'hidden') {
      throw "[Neuras] Cannot chain backpropagate a non-hidden Layer class!";
    };

    for (var i = this.neurones.length - 1; i >= 0; i--) {
      this.neurones[i].backpropagate();
    };

    return this;
  };

  this.forward = function (v) {
    var output = new Array();
    if (this.layer_type === 'hidden') {
      for (var i = 0; i < this.neurones.length; i++) {
        output.push(this.neurones[i].forward());
      };
    } else if (this.layer_type === 'input'){
      if (this.neurones.length !== v.length) {
        throw "[Neuras] Forward input array (length: " + v.length + ") does not equate to number of Input classes (length: " + this.neurones.length + ")!";
      };
      for (var i = 0; i < this.neurones.length; i++) {
        output.push(this.neurones[i].forward(v[i]));
      };
    };
    return output;
  };

};
