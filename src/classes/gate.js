module.exports = function (type) {
  Math.logab = function (exponent, base) {
    return Math.log(exponent) / Math.log(base);
  };

  switch (type.toLowerCase()) {

    case "tanh":
    this.evaluate = function (x) {return Math.tanh(x)};
    this.derivative = function (x) {return 1 - Math.pow(Math.tanh(x), 2)};
    break;

    case "sigmoid":
    this.evaluate = function (x) {return 1/(1 + Math.pow(Math.E, x))};
    this.derivative = function (x) {return Math.pow(Math.E, x) / Math.pow((Math.pow(Math.E, x) + 1), 2)};
    break;

    case "cube-root":
    this.evaluate = function (x) {return Math.cbrt(x)};
    this.derivative = function (x) {return 1/(3 * Math.pow(x, 2/3))};
    break;

    case "cube":
    this.evaluate = function (x) {return Math.pow(x, 3)};
    this.derivative = function (x) {return 3 * Math.pow(x, 2)};
    break;

    case "square":
    this.evaluate = function (x) {return Math.pow(x, 2)};
    this.derivative = function (x) {return 2 * x};
    break;

    case "relu":
    this.evaluate = function (x) {if (x >= 0) {return x} else {return 0}};
    this.derivative = function (x) {if (x >= 0) {return 1} else {return 0}};
    break;

    case "natural-exponential":
    this.evaluate = function (x) {return Math.pow(Math.E, x)};
    this.derivative = function (x) {return Math.pow(Math.E, x)};
    break;

    case "log":
    this.evaluate = function (x) {return Math.logab(x, 10)};
    this.derivative = function (x) {return 1/x * Math.logab(Math.E, 10)};
    break;

    case "identity":
    this.evaluate = function (x) {return x};
    this.derivative = function (x) {return 1};
    break;

    case "hard-identity":
    this.evaluate = function (x) {return 4 * x};
    this.derivative = function (x) {return 4};
    break;

    case "gaussian":
    this.evaluate = function (x) {return Math.pow(Math.E, Math.pow(-x, 2))};
    this.derivative = function (x) {return -2 * x * Math.pow(Math.E, Math.pow(-x, 2))};

    case "sin":
    this.evaluate = function (x) {return Math.sin(x)};
    this.derivative = function (x) {return Math.cos(x)};
    break;

    case "softplus":
    this.evaluate = function (x) {return Math.logab(1 + Math.pow(Math.E, x), Math.E)};
    this.derivative = function (x) {return 1/(1 + Math.pow(Math.E, x))};

    default:
    this.evaluate = function (x) {return x};
    this.derivative = function (x) {return 1};
    break;

  }
  this.type = type;
  this.forward = function (x) {
    return this.evaluate(x);
  };

  this.backward = function (x) {
    return this.derivative(x);
  };
}
