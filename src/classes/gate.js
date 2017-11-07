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

  Object.freeze(this.meta);

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

      case "multiplicative":
        this.type = "multiplicative";
        this.operation = function (m) {return m.reduce(function (a, b) {return a * b})};
        this.derivative = function (index, m, v) {return v/m[index]};

    };
  };

  this.forward = function () {
    var parse = new Array();
    for (var i = 0; i < this.backconnections.length; i++) {
      // No respect to order, but run from top to bottom of Layer anyway
      // No weights
      parse.push(this.backconnections[i].neurone.value);
    };

    parse.length == 0 ? parse[0] = 0 : null;

    var output = this.operation(parse);
    this.value = output;
    this.cache.matrix = parse;

    (typeof this.iterative == 'function') ? this.iterative() : null;

    this.chain_derivative = 0;

    return output;
  };

  this.backpropagate = function () {
    // No weights to backpropagate to, so derivatives are just updated instead
    for (var i = 0; i < this.backconnections.length; i++) {
      var derivative = this.chain_derivative * this.derivative(i, this.cache.matrix, this.value);
      this.backconnections[i].neurone.chain_derivative += derivative;
    };
  };

  this.connect = function (unit, weight) {
    var unweightedInstance = unit.meta.weighted == false;
    var weightedInstance = unit.meta.weighted == true;
    if (!unweightedInstance && !weightedInstance) {
      throw "[Neuras] Inappropriate connection (to) instance.";
    };

    unit.connections.push({neurone: unit});

    if (unweightedInstance) {
      if (unit.meta.type == 'input' && unit.backconnections.length > 0) {
        throw "[Neuras] Input classes can only have a maximum of one backconnection!";
      };
      unit.backconnections.push({neurone: this});
    } else {
      if (typeof weight !== 'number') {
        weight = Math.random();
      };
      unit.backconnections.push({neurone: this, weight: weight, dropout: false});
    };
  };
};
