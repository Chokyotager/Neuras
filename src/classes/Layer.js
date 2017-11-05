var Input = require('./Input');
var Neurone = require('./Neurone');

module.exports = function (type, neurones, squash) {
  this.neurones = new Array()
  if (type.toLowerCase() == 'input') {
    this.layer_type = 'input';
    for (var i = 0; i < neurones; i++) {
      this.neurones.push(new Input());
    };
  } else if (type == 'hidden') {
    this.layer_type = 'hidden';
    for (var i = 0; i < neurones; i++) {
      this.neurones.push(new Neurone());
    };
  };
  if (squash !== undefined) {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].changeSquash(squash);
    };
  };

  this.addBiases = function (probability, weighted, bias) {

    if (this.layer_type !== 'hidden') {
      throw "[NJS] Can only add biases to hidden Layer classes!";
    };

    for (var i = 0; i < this.neurones.length; i++) {
      if (Math.random() <= probability) {
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
      throw "[NJS] Can only connect to hidden layers!";
    };

    if (typeof probability != 'number') {
      probability = 1;
    };

    for (var i = 0; i < this.neurones.length; i++) {
      for (var j = 0; j < layer.neurones.length; j++) {
        if (Math.random() <= probability && (layer.neurones[j] instanceof Neurone)) {
          this.neurones[i].connect(layer.neurones[j]);
        };
      };
    };
    return layer;
  };

  this.forward = function (m) {
    var output = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      output.push(this.neurones[i].forward(m));
    };
    return output;
  };

  this.getCache = function () {
    var cache = new Array();
    for (var i = 0; i < this.neurones.length; i++) {
      cache.push(this.neurones[i].cache.x);
    };
    return cache;
  };

  this.initialise_chain_derivative = function () {
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].initialise_chain_derivative();
    };
    return this;
  };

  this.chain_backpropagate = function () {
    if (this.layer_type !== 'hidden') {
      throw "[NJS] Cannot chain backpropagate a non-hidden Layer class!";
    };
    for (var i = 0; i < this.neurones.length; i++) {
      this.neurones[i].chain_backpropagate();
    };
    return this;
  };

  this.continuous_forward = function (v) {
    var output = new Array();
    if (this.layer_type === 'hidden') {
      for (var i = 0; i < this.neurones.length; i++) {
        output.push(this.neurones[i].continuous_forward());
      };
    } else if (this.layer_type === 'input'){
      if (this.neurones.length !== v.length) {
        throw "[NJS] Forward input array (length: " + v.length + ") does not equate to number of Input classes (length: " + this.neurones.length + ")!";
      };
      for (var i = 0; i < this.neurones.length; i++) {
        output.push(this.neurones[i].continuous_forward(v[i]));
      };
    };
    return output;
  };

};
