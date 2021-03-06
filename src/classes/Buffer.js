// Buffers are just buffers. They bridge the gap between crappy, hard to design systems and easier ones, duh.
// Mainly for temporal forwarding where multiple inputs are concerned.

module.exports = class {

  constructor () {

    this.meta = new Object();
    this.meta.type = 'buffer';
    this.meta.weighted = false;
    this.meta.max_connections = Infinity;

    this.connections = new Array();
    this.backconnections = new Array();

    Object.freeze(this.meta);

  };

  connect (unit, weight) {
    var unweightedInstance = unit.meta.weighted == false;
    var weightedInstance = unit.meta.weighted == true;
    if (!unweightedInstance && !weightedInstance) {
      throw "[Neuras] Inappropriate connection (to) instance.";
    };

    // Disallow connections to buffers
    if (unit instanceof module.exports) {
      throw "[Neuras] Buffers cannot connect to other Buffers!";
    };

    if (unit.meta.max_connections < unit.backconnections.length + 1) {
      throw "[Neuras] Unit can only hold " + unit.meta.max_connections + " connection" + ((unit.meta.max_connections > 1) ? "s" : "") + "! Stack-trace to find unit!"
    };

    this.connections.push(unit);

    // force connections on backconnections
    for (var i = 0; i < this.backconnections.length; i++) {
      this.backconnections[i].neurone.connect(this, weight);
    };

    if (unit.meta.max_connections !== undefined) {
      this.meta.max_connections = Math.min(unit.meta.max_connections, this.meta.max_connections);
    };

    return this;

  };

  disconnectDuplicates () {
    for (var i = 0; i < this.backconnections.length - 1; i++) {
      for (var j = this.backconnections.length - 1; j > i; j--) {
        if (this.backconnections[j].neurone === this.backconnections[i].neurone) {
          this.backconnections.splice(j, 1);
        };
      };
    };
    return this;
  };

  forward () {

    var a = new Array();

    for (var i = 0; i < this.backconnections.length; i++) {
      a.push(this.backconnections[i].value);
    };
    this.values = a;
    return a;

  };

  setDerivativeChain (m) {
    if (!Array.isArray(m)) {
      throw "[Neuras] setDerivativeChain() of Buffer should contain an Array!";
    } else if (m.length !== this.backconnections.length) {
      throw "[Neuras] Length of Array should be equivalent to number of backconnections in Buffer setDerivativeChain()!";
    };

    for (var i = 0; i < m.length; i++) {
      // Low-level connections only
      this.backconnections[i].setDerivativeChain(m[i]);
    };

  };

  backpropagate () {
    return this;
  };

};
