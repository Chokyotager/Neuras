module.exports = class {

  constructor (optimiser, properties) {
    this.options = properties;
    switch (optimiser.toLowerCase()) {
      case "average":
        this.type = 'average';
        this.optimisation = function (m) {
          var n = new Array();
          for (var i = 0; i < m.length; i++) {
            n.push((m[i] + this.cache.prev[i]) / 2);
          };
          this.cache.prev = n;
          return n;
        };
        break;

      case "momentum":
        this.type = 'momentum';
        if (this.options === undefined || typeof this.options.momentum !== 'number') {
          throw "[Neuras] Momentum property in Optimiser should be defined!";
        };
        this.optimisation = function (m) {
          if (typeof this.options.iterative === 'function') {
            this.options.momentum = this.options.iterative(this.options.momentum);
          };
          var n = new Array();
          for (var i = 0; i < m.length; i++) {
            n.push(m[i] + this.cache.prev[i] * this.options.momentum);
          };
          this.cache.prev = n;
          return n;
        };
        break;

      case 'adagrad':
        this.type = 'adagrad';
        this.optimisation = function (m) {
          var n = new Array();
          var p = new Array();

          if (this.cache.prev === m) {
            this.cache.prev = new Array(m.length).fill(0);
          };

          for (var i = 0; i < m.length; i++) {
            var nx = Math.sqrt(Math.abs(m[i]) + 10e-30 + this.cache.prev[i]);
            n.push(nx);
            p.push(1/nx * m[i]);
          };
          this.cache.prev = n;
          return p;
        };
        break;

      case 'adadelta':
        this.type = 'adadelta';

        if (this.options === undefined || typeof this.options.momentum !== 'number') {
          throw "[Neuras] Momentum property in Optimiser should be defined!";
        };

        this.optimisation = function (m) {
          var n = new Array();
          var p = new Array();

          if (this.cache.prev === m) {
            this.cache.prev = new Array(m.length).fill(0);
          };

          for (var i = 0; i < m.length; i++) {
            // power 2 gets rid of negatives in gradient
            var jx = (1 - this.options.momentum) * Math.pow(m[i], 2) + this.options.momentum * this.cache.prev[i];
            var numerator = Math.sqrt(this.cache.prev[i] + 10e-30);
            var denominator = Math.sqrt(jx + 10e-30);
            p.push(numerator/denominator * m[i] + m[i]);
            n.push(jx);
          };
          this.cache.prev = n;
          return p;
        };
        break;

        case 'adagamma':
          this.type = 'adagamma';

          if (this.options === undefined || typeof this.options.momentum !== 'number') {
            throw "[Neuras] Momentum property in Optimiser should be defined!";
          };

          this.optimisation = function (m) {
            var n = new Array();
            var p = new Array();

            if (this.cache.prev === m) {
              this.cache.prev = new Array(m.length).fill(0);
            };

            for (var i = 0; i < m.length; i++) {
              // power 2 gets rid of negatives in gradient
              var jx = Math.pow(m[i], 2) + this.options.momentum * this.cache.prev[i];
              var numerator = this.cache.prev[i];
              var denominator = Math.sqrt(jx + 10e-30);
              p.push(m[i] - this.options.momentum * numerator/denominator * m[i]);
              n.push(jx);
            };
            this.cache.prev = n;
            return p;
          };
          break;

      case "none":
        this.type = 'none';
        this.optimisation = function (m) {
          return m;
        };
        break;

      default:
        this.type = 'none';
        this.optimisation = function (m) {
          return m;
        };
        break;
    };

    this.cache = new Object();

    this.optimise = function (m) {

      if (this.cache.prev === undefined) {
        this.cache.prev = m;
      };

      var x = this.optimisation(m);
      typeof this.log === 'function' ? this.log(x, m) : null;

      return x;
    };
  };

  static average (m) {
    return m.reduce(function (a, b) { return a + b }) / m.length;
  };

  static dotAverage (m, x) {
    if (m.length !== x.length) {
      throw "[Neuras] Dot average error - matrices not of the same length.";
    };
    for (var i = 0; i < m.length; i++) {
      m[i] = average([m[i], x[i]])
    };
    return m;
  };

  static dotMultiply (m, x) {
    if (m.length !== x.length) {
      throw "[Neuras] Dot multiplication error - matrices not of the same length.";
    };
    for (var i = 0; i < m.length; i++) {
      m[i] *= x[i];
    };
    return m;
  };

};
