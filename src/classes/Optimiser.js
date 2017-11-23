module.exports = function (optimiser, properties) {
  this.options = properties;
  switch (optimiser.toLowerCase()) {
    case "average":
      this.type = 'average';
      this.optimisation = function (m) {
        var n = new Array();
        for (var i = 0; i < m.length; i++) {
          n.push((m[i] + this.cache.prev[i]) / 2)
        };
        this.cache.prev = n;
        return n;
      };
      break;

    case "momentum":
      this.type = 'momentum';
      this.optimisation = function (m) {
        var n = new Array();
        for (var i = 0; i < m.length; i++) {
          n.push(this.options.amount * this.cache.prev[i] - m[i]);
        };
        this.cache.prev = n;
        return n;
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
