module.exports = function (optimiser) {
  switch (optimiser) {
    case "principle-momentum":
      this.type = 'principle-momentum';
      this.optimisation = function (m) {
        return this.cache.compound;
      };
      break;

    case "compound-momentum":
      this.optimisation = function (m) {
        return this.cache.compound_optimised;
      };
      break;

    case "compound-momentum-squared":
      this.optimisation = function (m) {
        this.cache.compound_optimised.forEach(function (x) {return Math.pow(x, 2);});
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

    if (this.cache.compound === undefined) {
      this.cache.compound = m;
    };

    if (this.cache.compound_optimised === undefined) {
      this.cache.compound_optimised = m;
    };

    var x = this.optimisation(m);
    this.compoundLog(m, x);

    this.cache.previous = m;
    this.cache.optimised = x;

    return x;
  };

  this.compoundLog = function (m, x) {
    if (this.cache.compound.length !== m.length) {
      this.cache.compound = m;
    } else {
      this.cache.compound = dotAverage(this.cache.compound, m)
    };

    if (this.cache.compound_optimised.length !== x.length) {
      this.cache.compound_optimised = x;
    } else {
      this.cache.compound_optimised = dotAverage(this.cache.compound_optimised, x)
    };
  };

};
