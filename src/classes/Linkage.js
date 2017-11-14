var Layer = require('./Layer');

module.exports = function (chronology, autolink) {
  // chronology == layers to forward in order

  if (autolink == true) {
    for (var i = 0; i < chronology.length - 1; i++) {
      chronology[i].connect(chronology[i + 1])
    };
  };

  this.meta = new Object();
  this.meta.type = 'linkage';
  this.meta.weighted = false;

  if (chronology.length <= 1) {
    throw "[Neuras] A linkage should have at least two Layer classes!";
  };

  this.chronology = chronology;
  this.configuration = new Array();

  for (var i = 0; i < chronology.length; i++) {
    if (!(chronology[i] instanceof Layer)) {
      throw "[Neuras] Element (index: " + i.toString() + ") is not a Layer class!";
    };

    var layerconf = [0, 0];

    for (var j = 0; j < chronology[i].neurones.length; j++) {
      if (chronology[i].neurones[j].meta.type == 'linkage') {
        layerconf[0] += chronology[i].neurones[j].configuration[0][0];
        layerconf[1] += chronology[i].neurones[j].configuration[chronology[i].neurones[j].configuration.length - 1][1];
      } else {
        layerconf[0]++;
        layerconf[1]++;
      };
    };
    this.configuration.push(layerconf);
  };

  this.forward = function (m) {
    
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

  this.backpropagate = function (chain_m) {
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

  this.connect = function (unit, probability) {

    if (typeof probability !== 'number') {
      probability = 1;
    };

    var output = this.chronology[this.chronology.length - 1];

    for (var i = 0; i < output.neurones.length; i++) {
      if (Math.random() < probability) {
        if (unit.meta.type == 'linkage') {
          output.connectSequentially(unit.chronology[0]);
        } else {
          output.neurones[i].connect(unit);
        };
      };
    };
    return unit;
  };

  this.disconnectDuplicates = function () {
    this.chronology[0].disconnectDuplicates();
    return this;
  };

  this.setDerivativeChain = function (type, layer, chain_m) {

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
        if (this.chronology[layer].neurones[i].meta.type == "linkage") {
          this.chronology[layer].neurones[i].setDerivativeChain(type, 'last', chain_m);
        } else {
          this.chronology[layer].neurones[i].setDerivativeChain(chain_m[0]);
          chain_m.shift();
        };

    };
    return res;
  };

};
