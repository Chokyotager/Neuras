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

    if (unit.meta.max_connections < unit.backconnections.length + 1) {
      throw "[Neuras] Unit can only hold " + unit.meta.max_connections + " connection" + ((unit.meta.max_connections > 1) ? "s" : "") + "! Stack-trace to find unit!"
    };

    this.connections.push(unit);

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
      if (this.backconnections[i].meta.type === 'buffer') {
        a.concat(this.backconnections[i].values);
      };
      a.push(this.backconnection[i].value);
    };
    this.values = a;
    return a;

  };

  backpropagate () {
    return null;
  };

};
