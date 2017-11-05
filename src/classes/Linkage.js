var Layer = require('./Layer');

module.exports = function (chronology) {
  // chronology == layers to forward in order

  if (chronology.length <= 1) {
    throw "[NJS] A linkage should have at least two Layer classes!";
  };

  if (chronology[0].layer_type !== 'input') {
    //console.log(chronology[0])
    throw "[NJS] First layer of a Linkage should be an input!";
  };

  this.chronology = chronology;
  this.configuration = new Array();

  for (var i = 0; i < chronology.length; i++) {
    if (!(chronology[i] instanceof Layer)) {
      throw "[NJS] Element (index: " + i.toString() + ") is not a Layer class!";
    };
    this.configuration.push(chronology[i].neurones.length);
  };

  this.forward = function (m) {
    // forward inputs
    /*if (m.length !== this.configuration[0]) {
      throw "[NJS] Forward input array (length: " + m.length + ") does not equate to number of Inputs (length: " + this.configuration[0] + ")!";
    };*/

    this.chronology[0].continuous_forward(m);

    // forward hidden
    for (var i = 1; i < this.chronology.length; i++) {
      var latest = this.chronology[i].continuous_forward();
    };
    return latest;
  };

  this.backpropagate = function (chain) {
    // backpropagate output neurones
    this.chronology[1].neurones[0].cache.chain_derivative = chain;
    for (var i = 0; i < this.configuration[this.configuration.length]; i++) {
      console.log(this.chronology[1].neurones[i].cache.chain_derivative)
      this.chronology[1].neurones[i].cache.chain_derivative = chain;
    };
    for (var i = this.chronology.length - 1; i >= 1; i--) {
      this.chronology[i].chain_backpropagate();
    };
  };

};
