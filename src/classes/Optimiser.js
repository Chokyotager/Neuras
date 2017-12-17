module.exports = function (optimiser, properties) {

  var prototype = module.exports.prototype;

  prototype.options = properties;
  switch (optimiser.toLowerCase()) {
    case "average":
      this.type = 'average';
      prototype.optimisation = function (m) {
        var n = new Array();
        for (var i = 0; i < m.length; i++) {
          n.push((m[i] + prototype.cache.prev[i]) / 2);
        };
        prototype.cache.prev = n;
        return n;
      };
      break;

    case "momentum":
      this.type = 'momentum';
      if (prototype.options === undefined || typeof prototype.options.momentum !== 'number') {
        throw "[Neuras] Momentum property in Optimiser should be defined!";
      };
      prototype.optimisation = function (m) {
        if (typeof prototype.options.iterative === 'function') {
          prototype.options.momentum = prototype.options.iterative(prototype.options.momentum);
        };
        var n = new Array();
        for (var i = 0; i < m.length; i++) {
          n.push(m[i] + prototype.cache.prev[i] * prototype.options.momentum);
        };
        prototype.cache.prev = n;
        return n;
      };
      break;

    case 'adagrad':
      this.type = 'adagrad';
      prototype.optimisation = function (m) {
        var n = new Array();
        var p = new Array();

        if (prototype.cache.prev === m) {
          prototype.cache.prev = new Array(m.length).fill(0);
        };

        for (var i = 0; i < m.length; i++) {
          var nx = Math.sqrt(Math.abs(m[i]) + 10e-30 + prototype.cache.prev[i]);
          console.log(nx);
          n.push(nx);
          p.push(1/nx * m[i]);
        };
        prototype.cache.prev = n;
        return p;
      };
      break;

    case 'adadelta':
      this.type = 'adadelta';

      if (prototype.options === undefined || typeof prototype.options.momentum !== 'number') {
        throw "[Neuras] Momentum property in Optimiser should be defined!";
      };

      prototype.optimisation = function (m) {
        var n = new Array();
        var p = new Array();

        if (prototype.cache.prev === m) {
          prototype.cache.prev = new Array(m.length).fill(0);
        };

        for (var i = 0; i < m.length; i++) {
          // power 2 gets rid of negatives in gradient
          var jx = (1 - prototype.options.momentum) * Math.pow(m[i], 2) + prototype.options.momentum * prototype.cache.prev[i];
          var numerator = Math.sqrt(prototype.cache.prev[i] + 10e-30);
          var denominator = Math.sqrt(jx + 10e-30);
          p.push(numerator/denominator * m[i] + m[i]);
          n.push(jx);
        };
        prototype.cache.prev = n;
        return p;
      };
      break;

      case 'adagamma':
        this.type = 'adagamma';

        if (prototype.options === undefined || typeof prototype.options.momentum !== 'number') {
          throw "[Neuras] Momentum property in Optimiser should be defined!";
        };

        prototype.optimisation = function (m) {
          var n = new Array();
          var p = new Array();

          if (prototype.cache.prev === m) {
            prototype.cache.prev = new Array(m.length).fill(0);
          };

          for (var i = 0; i < m.length; i++) {
            // power 2 gets rid of negatives in gradient
            var jx = Math.pow(m[i], 2) + prototype.options.momentum * prototype.cache.prev[i];
            var numerator = prototype.cache.prev[i];
            var denominator = Math.sqrt(jx + 10e-30);
            p.push(m[i] - prototype.options.momentum * numerator/denominator * m[i]);
            n.push(jx);
          };
          prototype.cache.prev = n;
          return p;
        };
        break;

    case "none":
      this.type = 'none';
      prototype.optimisation = function (m) {
        return m;
      };
      break;

    default:
      this.type = 'none';
      prototype.optimisation = function (m) {
        return m;
      };
      break;
  };

  function average (m) {
    return m.reduce(function (a, b) { return a + b }) / m.length;
  };

  function dotAverage (m, x) {
    if (m.length !== x.length) {
      throw "[Neuras] Dot average error - matrices not of the same length.";
    };
    for (var i = 0; i < m.length; i++) {
      m[i] = average([m[i], x[i]])
    };
    return m;
  };

  function dotMultiply (m, x) {
    if (m.length !== x.length) {
      throw "[Neuras] Dot multiplication error - matrices not of the same length.";
    };
    for (var i = 0; i < m.length; i++) {
      m[i] *= x[i];
    };
    return m;
  };

  prototype.cache = new Object();

};

var prototype = module.exports.prototype;

prototype.optimise = function (m) {

  if (prototype.cache.prev === undefined) {
    prototype.cache.prev = m;
  };

  var x = prototype.optimisation(m);
  typeof this.log === 'function' ? this.log(x, m) : null;

  return x;
};
