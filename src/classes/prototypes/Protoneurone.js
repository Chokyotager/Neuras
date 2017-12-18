var Squash = require('../Squash');

module.exports = class {

  changeSquash (sq, params) {
    this.squash = new Squash(sq, params);
    return this;
  };

  limitConnections (connections) {
    if (connections < this.backconnections.length) {
      throw "[Neuras] Cannot lower backconnection limits than already existing number of connections!";
    };

    if (typeof connections !== 'number' || connections < 0) {
      throw "[Neuras] Invalid limit on connections!";
    };

    this.meta.max_connections = connections;
    return this;
  };

  lock () {
    this.meta.max_connections = this.backconnections.length;
    return this;
  };

  unlock () {
    this.meta.max_connections = Infinity;
    return this;
  };

  setDerivativeChain (x) {
    this.chain_derivative = x;
    return this;
  };

  connect (unit, weight) {
    var unweightedInstance = unit.meta.weighted == false;
    var weightedInstance = unit.meta.weighted == true;
    if (!unweightedInstance && !weightedInstance) {
      throw "[Neuras] Inappropriate connection (to) instance.";
    };

    if (unit.meta.max_connections < unit.backconnections.length + 1) {
      throw "[Neuras] Unit can only hold " + unit.meta.max_connections + " connection" + ((unit.meta.max_connections !== 1) ? "s" : "") + "! Stack-trace to find unit!"
    };

    if (unit.meta.type === 'buffer') {
      for (var i = 0; i < unit.connections.length; i++) {
        this.connect(unit.connections[i], weight);
      };
    } else if (unweightedInstance) {
          unit.backconnections.push({neurone: this});
      } else {
        if (typeof weight !== 'number') {
          weight = 2 * (Math.random()-.5);
        };
        unit.backconnections.push({neurone: this, weight: weight, dropout: false, frozen: false, local_trainrate: Math.random()});
      };
    return this;
  };

  getUnsquashedOutput () {
    return this.cache.miu;
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

};
