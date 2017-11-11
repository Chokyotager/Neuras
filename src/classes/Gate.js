var Squash = require('./Squash');

module.exports = function (gate, options) {
  // Non-neuronal matrix gates, cannot be weighted

  this.backconnections = new Array();
  this.connections = new Array();
  this.value = 0;
  this.chain_derivative = 0;
  this.options = options;
  this.cache = new Object();

  this.meta = new Object();
  this.meta.weighted = false;
  this.meta.type = 'gate';

  if (options.squash !== undefined) {
    this.squash = new Squash(options.squash);
  } else {
    this.squash = new Squash('identity');
  };

  Object.freeze(this.meta);

  // Gate enumeration
  if (typeof gate == "string") {
    switch (gate) {
      case "spike":
        this.type = "spike";
        this.cache.spike = 0;
        this.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a + b;});
          this.cache.spike += sum;
          if (this.cache.spike >= this.options.threshold) {
            var ret = this.cache.spike;
            this.cache.spike = 0;
            return ret;
          } else {return 0;};
        };
        this.derivative = function (index, m, v) {return 1};
        this.iterative = function () {
          this.cache.spike *= this.options.iterative;
        };
        break;

      case "spike-modified":
        this.type = "spike-modified";
        this.cache.spike = 0;
        this.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a + b;});
          this.cache.spike += sum;
          if (this.cache.spike >= this.options.threshold) {
            var ret = this.cache.spike;
            this.cache.spike = this.cache.spike - this.options.threshold;
            return ret;
          } else {return 0;};
        };
        this.derivative = function (index, m, v) {return 1};
        this.iterative = function () {
          this.cache.spike *= this.options.iterative;
        };
        break;

      case "spike-mutated":
        this.type = "spike-mutated";
        this.cache.spike = 0;
        this.operation = function (m) {
          var sum = m.reduce(function (a, b) {return a * b;});
          this.cache.spike += sum;
          if (this.cache.spike >= this.options.threshold) {
            var ret = this.cache.spike;
            this.cache.spike = 0;
            return ret;
          } else {return 0;};
        };
        this.derivative = function (index, m, v) {return v/m[index]};
        this.iterative = function () {
          this.cache.spike *= this.options.iterative;
        };
        break;

      case "additive":
        this.type = "additive";
        this.operation = function (m) {return m.reduce(function (a, b) {return a + b})};
        this.derivative = function (index, m, v) {return 1};
        break;

      case "delay":
        this.type = "delay";
        this.meta.max_connections = 1;
        this.cache.delays = new Array();
        this.cache.delay_ready = false;
        if (isNaN(parseInt(options.delay))) {
          throw "[Neuras] Invalid or undefined time delay value in time delay Gate!";
        };
        this.cache.time_lag = parseInt(options.delay);
        this.operation = function (m) {
          this.cache.delays.push(m[0]);
          if (this.cache.delays.length >= options.delay) {
            var cached = this.cache.delays[options.delay - 1];
            this.cache.delays.pop();
            this.cache.delay_ready = true;
            return cached;
          } else {
            return 0;
          };
        };
        this.derivative = function (index, m, v) {
          if (this.cache.delay_ready) {
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
        this.cache.constant = parseFloat(options.constant);
        this.operation = function (m) { return this.cache.constant };
        this.derivative = function (index, m, v) {return 1};
        break;

      case "sampling":
        this.type = "sampling";
        this.meta.max_connections = 1;
        this.cache.delay = 0;
        if (isNaN(parseInt(options.sample))) {
          throw "[Neuras] Invalid or undefined sample value in time delay Gate!";
        };
        this.cache.sample = parseInt(options.sample);
        this.cache.sample_fired = false;
        this.operation = function (m) {
          this.cache.delay++
          if (this.cache.delay >= this.cache.sample) {
            this.cache.sample_fired = true;
            this.cache.delay = 0;
            return m;
          } else {
            this.cache.sample_fired = false;
            return 0;
          };
        };
        this.derivative = function (index, m, v) {
          if (this.cache.sample_fired) {
            return 1;
          } else {
            return 0;
          };
        };
        break;

      case "multiplicative":
        this.type = "multiplicative";
        this.operation = function (m) {return m.reduce(function (a, b) {return a * b})};
        this.derivative = function (index, m, v) {return v/m[index]};
        break;

      default:
        this.type = "additive";
        this.operation = function (m) {return m.reduce(function (a, b) {return a + b})};
        this.derivative = function (index, m, v) {return 1};
        break;

    };
  };

  this.changeSquash = function (sq) {
    this.squash = new Squash(sq);
    return this;
  };

  this.forward = function () {
    var parse = new Array();
    for (var i = 0; i < this.backconnections.length; i++) {
      // No respect to order, but run from top to bottom of Layer anyway
      // No weights
      parse.push(this.backconnections[i].neurone.value);
    };

    parse.length == 0 ? parse[0] = 0 : null;

    var gateEvaluation = this.operation(parse);
    var output = this.squash.forward(gateEvaluation);
    this.cache.miu = gateEvaluation;
    this.value = output;
    this.cache.matrix = parse;

    (typeof this.iterative == 'function') ? this.iterative() : null;

    this.chain_derivative = 0;

    return output;
  };

  this.backpropagate = function () {
    // No weights to backpropagate to, so derivatives are just updated instead
    for (var i = 0; i < this.backconnections.length; i++) {
      var derivative = this.chain_derivative * this.derivative(i, this.cache.matrix, this.cache.miu) * this.squash.derivative(this.value);
      this.backconnections[i].neurone.chain_derivative += derivative;
    };
  };

  this.setDerivativeChain = function (x) {
    this.chain_derivative = x;
    return this;
  };

  this.connect = function (unit, weight) {
    var unweightedInstance = unit.meta.weighted == false;
    var weightedInstance = unit.meta.weighted == true;
    if (!unweightedInstance && !weightedInstance) {
      throw "[Neuras] Inappropriate connection (to) instance.";
    };

    if (unit.meta.max_connections < unit.backconnections.length + 1) {
      throw "[Neuras] Unit can only hold " + unit.meta.max_connections + " connection" + ((unit.meta.max_connections > 1) ? "s" : "") + "! Stack-trace to find unit!"
    };

    if (unweightedInstance) {
      unit.backconnections.push({neurone: this});
    } else {
      if (typeof weight !== 'number') {
        weight = Math.random();
      };
      unit.backconnections.push({neurone: this, weight: weight, dropout: false, frozen: false});
    };
    return this;
  };

};
