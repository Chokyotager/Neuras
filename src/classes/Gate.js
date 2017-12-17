var Squash = require('./Squash');

module.exports = function (gate, options) {
  // Non-neuronal matrix gates, cannot be weighted

  var prototype = module.exports.prototype;

  if (options === undefined) {
    options = new Object;
  };

  this.backconnections = new Array();

  prototype.value = 0;
  prototype.chain_derivative = 0;
  prototype.options = options;
  prototype.cache = new Object();

  prototype.meta = new Object();
  this.meta.weighted = false;
  this.meta.type = 'gate';

  if (options.squash !== undefined) {
    this.squash = new Squash(options.squash);
  } else {
    this.squash = new Squash('identity');
  };

  //Object.freeze(this.meta);

  // Gate enumeration
  if (typeof gate == "string") {
    switch (gate) {

      case "softmax":
        this.type = "softmax";
        prototype.operation = function (m) {
          var divisor = 0;
          for (var i = 0; i < m.length; i++) {
            divisor += Math.pow(Math.E, m[i]);
          };
          return Math.pow(Math.E, m[0]) / divisor;
        };
        prototype.derivative = function (index, m, v) {
          if (index === 0) {
            return prototype.value * (1 - prototype.value);
          } else {
            return 0;
          };
        };
        break;

      case "hardmax":
        this.type = "hardmax";
        prototype.operation = function (m) {
          var divisor = 0;
          for (var i = 0; i < m.length; i++) {
            divisor += m[i];
          };
          return m[0] / divisor;
        };
        prototype.derivative = function (index, m, v) {
          if (index === 0) {
            return 1;
          } else {
            return 0;
          };
        };
        break;

      case "spike":
        this.type = "spike";
        prototype.cache.spike = 0;
        prototype.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a + b;});
          prototype.cache.spike += sum;
          if (prototype.cache.spike >= this.options.threshold) {
            var ret = prototype.cache.spike;
            prototype.cache.spike = 0;
            return ret;
          } else {return 0;};
        };
        prototype.derivative = function (index, m, v) {return 1};
        prototype.iterative = function () {
          prototype.cache.spike *= this.options.iterative;
        };
        break;

      case "spike-modified":
        this.type = "spike-modified";
        prototype.cache.spike = 0;
        prototype.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a + b;});
          prototype.cache.spike += sum;
          if (prototype.cache.spike >= this.options.threshold) {
            var ret = prototype.cache.spike;
            prototype.cache.spike = prototype.cache.spike - this.options.threshold;
            return ret;
          } else {return 0;};
        };
        prototype.derivative = function (index, m, v) {return 1};
        prototype.iterative = function () {
          prototype.cache.spike *= this.options.iterative;
        };
        break;

      case "spike-mutated":
        this.type = "spike-mutated";
        prototype.cache.spike = 0;
        prototype.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a * b;});
          prototype.cache.spike += sum;
          if (prototype.cache.spike >= this.options.threshold) {
            var ret = prototype.cache.spike;
            prototype.cache.spike = 0;
            return ret;
          } else {return 0;};
        };
        prototype.derivative = function (index, m, v) {return v/m[index]};
        prototype.iterative = function () {
          prototype.cache.spike *= this.options.iterative;
        };
        break;

      case "additive":
        this.type = "additive";
        prototype.operation = function (m) {return m.reduce(function (a, b) {return a + b})};
        prototype.derivative = function (index, m, v) {return 1};
        break;

      case "delay":
        this.type = "delay";
        this.meta.max_connections = 1;
        prototype.cache.delays = new Array();
        prototype.cache.delay_ready = false;
        if (isNaN(parseInt(options.delay))) {
          throw "[Neuras] Invalid or undefined time delay value in time delay Gate!";
        };
        prototype.cache.time_lag = parseInt(options.delay);
        prototype.operation = function (m) {
          prototype.cache.delays.push(m[0]);
          if (prototype.cache.delays.length >= options.delay) {
            var cached = prototype.cache.delays[options.delay - 1];
            prototype.cache.delays.pop();
            prototype.cache.delay_ready = true;
            return cached;
          } else {
            return 0;
          };
        };
        prototype.derivative = function (index, m, v) {
          if (prototype.cache.delay_ready) {
            return 1;
          } else {
            return 0;
          };
        };
        break;

      case "constant":
        this.type = "constant";
        this.meta.max_connections = 0;
        if (isNaN(parseFloat(options.constant))) {
          throw "[Neuras] Invalid or undefined constant in constant Gate!";
        };
        prototype.cache.constant = parseFloat(options.constant);
        prototype.operation = function (m) { return prototype.cache.constant };
        prototype.derivative = function (index, m, v) {return 1};
        break;

      case "sampling":
        this.type = "sampling";
        this.meta.max_connections = 1;
        prototype.cache.delay = 0;
        if (isNaN(parseInt(options.sample))) {
          throw "[Neuras] Invalid or undefined sample value in time delay Gate!";
        };
        prototype.cache.sample = parseInt(options.sample);
        prototype.cache.sample_fired = false;
        prototype.operation = function (m) {
          prototype.cache.delay++
          if (prototype.cache.delay >= prototype.cache.sample) {
            prototype.cache.sample_fired = true;
            prototype.cache.delay = 0;
            return m;
          } else {
            prototype.cache.sample_fired = false;
            return 0;
          };
        };
        prototype.derivative = function (index, m, v) {
          if (prototype.cache.sample_fired) {
            return 1;
          } else {
            return 0;
          };
        };
        break;

      case "multiplicative":
        this.type = "multiplicative";
        prototype.value = 1;
        prototype.operation = function (m) {return m.reduce(function (a, b) {return a * b})};
        prototype.derivative = function (index, m, v) {return v/m[index]};
        break;

      default:
        this.type = "additive";
        prototype.operation = function (m) {return m.reduce(function (a, b) {return a + b})};
        prototype.derivative = function (index, m, v) {return 1};
        break;

    };
  };
};

var prototype = module.exports.prototype;

prototype.changeSquash = function (sq, params) {
  this.squash = new Squash(sq, params);
  return this;
};

prototype.limitConnections = function (connections) {
  if (connections < this.backconnections.length) {
    throw "[Neuras] Cannot lower backconnection limits than already existing number of connections!";
  };

  if (typeof connections !== 'number' || connections < 0) {
    throw "[Neuras] Invalid limit on connections!";
  };

  this.meta.max_connections = connections;
  return this;
};

prototype.lock = function () {
  this.meta.max_connections = this.backconnections.length;
  return this;
};

prototype.unlock = function () {
  this.meta.max_connections = Infinity;
  return this;
};

prototype.forward = function () {
  var parse = new Array();
  for (var i = 0; i < this.backconnections.length; i++) {
    // No respect to order, but run from top to bottom of Layer anyway
    // No weights

    // TEMPORARY!!!! NOTE THIS
    /*if (this.backconnections[i].neurone.value === 0) {
      var def = 10e-30;
    } else {
      var def = this.backconnections[i].neurone.value;
    };*/
    parse.push(this.backconnections[i].neurone.value);
  };

  parse.length == 0 ? parse[0] = 0 : null;

  var gateEvaluation = prototype.operation(parse);
  var output = this.squash.forward(gateEvaluation);
  prototype.cache.miu = gateEvaluation;
  prototype.value = output;
  prototype.cache.matrix = parse;

  (typeof prototype.iterative == 'function') ? prototype.iterative() : null;

  prototype.chain_derivative = 0;

  return output;
};

prototype.backpropagate = function () {
  // No weights to backpropagate to, so derivatives are just updated instead
  for (var i = 0; i < this.backconnections.length; i++) {
    var derivative = prototype.chain_derivative * prototype.derivative(i, prototype.cache.matrix, prototype.cache.miu) * this.squash.derivative(prototype.value);
    this.backconnections[i].neurone.chain_derivative += derivative;
  };
};

prototype.setDerivativeChain = function (x) {
  prototype.chain_derivative = x;
  return this;
};

prototype.connect = function (unit, weight) {
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

prototype.getUnsquashedOutput = function () {
  return prototype.cache.miu;
};

prototype.disconnectDuplicates = function () {
  for (var i = 0; i < this.backconnections.length - 1; i++) {
    for (var j = this.backconnections.length - 1; j > i; j--) {
      if (this.backconnections[j].neurone === this.backconnections[i].neurone) {
        this.backconnections.splice(j, 1);
      };
    };
  };
  return this;
};
