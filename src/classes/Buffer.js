// Buffers are just buffers. They bridge the gap between crappy, hard to design systems and easier ones, duh.
// Mainly for temporal forwarding where multiple inputs are concerned.

module.exports = function () {

  this.connections = new Array();

  this.meta = new Object();
  this.meta.type = 'buffer';
  this.meta.weighted = false;
  this.meta.max_connections = Infinity;

  this.backconnections = new Array();

  Object.freeze(this.meta);

  this.connect = function (unit, weight) {
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

  this.forward = function () {
    return new Array();
  };

  this.backpropagate = function () {
    return null;
  };

};
