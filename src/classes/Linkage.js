var Layer = require('./Layer');

module.exports = function (chronology) {
  // chronology == layers to forward in order

  if (chronology.length <= 1) {
    throw "[Neuras] A linkage should have at least two Layer classes!";
  };

  if (chronology[0].layer_type !== 'input') {
    //console.log(chronology[0])
    throw "[Neuras] First layer of a Linkage should be an input!";
  };

  this.chronology = chronology;
  this.configuration = new Array();

  for (var i = 0; i < chronology.length; i++) {
    if (!(chronology[i] instanceof Layer)) {
      throw "[Neuras] Element (index: " + i.toString() + ") is not a Layer class!";
    };
    this.configuration.push(chronology[i].neurones.length);
  };

  this.forward = function (m) {
    // forward inputs
    /*if (m.length !== this.configuration[0]) {
      throw "[Neuras] Forward input array (length: " + m.length + ") does not equate to number of Inputs (length: " + this.configuration[0] + ")!";
    };*/

    this.chronology[0].forward(m);

    // forward hidden
    for (var i = 1; i < this.chronology.length; i++) {
      var latest = this.chronology[i].forward();
    };
    return latest;
  };

  this.backpropagate = function (chain_m) {
    // backpropagate output neurones
    //console.log(this.chronology[this.chronology.length - 1])

    if (chain_m.length !== this.configuration[this.configuration.length - 1]) {
      throw "[Neuras] Backpropagation set should be equal to number of output/hidden Neurones in last Layer!"
    };

    for (var i = 0; i < chain_m.length; i++) {
      this.chronology[this.chronology.length - 1].neurones[i].setDerivativeChain(chain_m[i]);
    };

    for (var i = this.chronology.length - 1; i >= 1; i--) {
      this.chronology[i].backpropagate();
    };

  };

};
