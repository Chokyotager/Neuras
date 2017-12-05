module.exports = function (type) {
  Math.logab = function (exponent, base) {
    return Math.log(exponent) / Math.log(base);
  };

  type = type.toLowerCase();

  if (type.substring(0, 6) === 'random') {
    var enumerate = type.substring(7, type.length);
    var possible_types = new Array();
    switch (enumerate) {
      case "primitive":
      possible_types = ['tanh', 'arctan', 'logistic'];
      break;

      case "extended":
      possible_types = ['tanh', 'arctan', 'logistic', 'sinc', 'sin', 'logistic', 'gaussian'];
      break;

      case "extended++":
      possible_types = ['tanh', 'arctan', 'logistic', 'sinc', 'sin', 'logistic', 'gaussian', 'binary-step', 'signum', 'softplus'];

      case "regression":
      possible_types = ['leaky-relu', 'softplus', 'identity', 'cube', 'natural-exponential', 'bent-identity'];

      default:
      possible_types = ['tanh', 'arctan', 'logistic'];
      break;
    };
    type = possible_types[Math.round(Math.random() * (possible_types.length-1))];
  };

  switch (type) {

    case "tanh":
    this.evaluate = function (x) {return Math.tanh(x)};
    this.derivative = function (x) {return 1 - Math.pow(Math.tanh(x), 2)};
    break;

    case "arctan":
    this.evaluate = function (x) {return Math.atan(x)};
    this.derivative = function (x) {return 1/(Math.pow(x, 2) + 1)};
    break;

    case "logistic":
    this.evaluate = function (x) {return 1/(1 + Math.pow(Math.E, -x))};
    this.derivative = function (x) {return Math.pow(Math.E, x) / Math.pow((Math.pow(Math.E, x) + 1), 2)};
    break;

    case "hard-tanh":
    this.evaluate = function (x) {return (x <= 1 && x >= -1) ? x : (x < -1) ? -1 : 1};
    this.derivative = function (x) {return (x <= 1 && x >= -1) ? 1 : 0};
    break;

    case "leaky-relu":
    this.evaluate = function (x) {return Math.max(0, x)};
    this.derivative = function (x) {return (x < 0) ? 0.01 : 1};
    break;

    case "sinc":
    this.evaluate = function (x) {return (x === 0) ? 1 : Math.sin(x)/x};
    this.derivative = function (x) {return (x === 0) ? 0 : Math.cos(x)/x - Math.sin(x)/Math.pow(x, 2)};
    break;

    case "binary-step":
    this.evaluate = function (x) {return (x < 0) ? 0 : 1};
    this.derivative = function (x) {return (x === 0) ? 10e30 : 0};
    break;

    case "signum":
    this.evaluate = function (x) {return (x < 0) ? -1 : 1};
    this.derivative = function (x) {return (x === 0) ? 10e30 : 0};
    break;

    case "relu":
    this.evaluate = function (x) {return Math.max(x, 0)};
    this.derivative = function (x) {return (x < 0) ? 0 : 1};
    break;

    case "identity":
    this.evaluate = function (x) {return x};
    this.derivative = function (x) {return 1};
    break;

    case "bent-identity":
    this.evaluate = function (x) {return (Math.sqrt(Math.pow(x, 2) + 1)-1)/2 + x};
    this.derivative = function (x) {return x/(2*Math.sqrt(Math.pow(x, 2) + 1)) + 1};
    break;

    case "gaussian":
    this.evaluate = function (x) {return Math.pow(Math.E, -Math.pow(x, 2))};
    this.derivative = function (x) {return -2 * x * Math.pow(Math.E, -Math.pow(x, 2))};
    break;

    case "sin":
    this.evaluate = function (x) {return Math.sin(x)};
    this.derivative = function (x) {return Math.cos(x)};
    break;

    case "cos":
    this.evaluate = function (x) {return Math.cos(x)};
    this.derivative = function (x) {return -Math.sin(x)};
    break;

    case "softplus":
    this.evaluate = function (x) {return Math.logab(1 + Math.pow(Math.E, x), Math.E)};
    this.derivative = function (x) {return 1/(1 + Math.pow(Math.E, -x))};
    break;

    // Experimental

    case "smooth-cube":
    this.evaluate = function (x) {return Math.pow(x, 2)/Math.sin(x)};
    this.derivative = function (x) {return (x*(2*Math.sin(x)+Math.cos(x)))/Math.pow(Math.sin(x), 2)};
    break;

    case "hard-identity":
    this.evaluate = function (x) {return 4 * x};
    this.derivative = function (x) {return 4};
    break;

    case "natural-exponential":
    this.evaluate = function (x) {return Math.pow(Math.E, x)};
    this.derivative = function (x) {return Math.pow(Math.E, x)};
    break;

    case "log":
    this.evaluate = function (x) {return Math.logab(x, 10)};
    this.derivative = function (x) {return 1/x * Math.logab(Math.E, 10)};
    break;

    case "ablog":
    this.evaluate = function (x) {return Math.log(Math.abs(x)+10e-30)};
    this.derivative = function (x) {return (x*Math.logab(Math.E, 10))/((Math.abs(x)+10e-30)*Math.abs(x))};
    break;

    case "cube":
    this.evaluate = function (x) {return Math.pow(x, 3)};
    this.derivative = function (x) {return 3 * Math.pow(x, 2)};
    break;

    case "square":
    this.evaluate = function (x) {return Math.pow(x, 2)};
    this.derivative = function (x) {return 2 * x};
    break;

    case "modulus":
    this.evaluate = function (x) {return x % Math.random() * 10};
    this.derivative = function (x) {return 1};
    break;

    case "cube-root":
    this.evaluate = function (x) {return Math.cbrt(x)};
    this.derivative = function (x) {return 1/(3 * Math.pow(x, 2/3))};
    break;

    case "stippity-step":
    this.evaluate = function (x) {return Math.tanh(2 * Math.sin(x)) + x};
    this.derivative = function (x) {return (1 - Math.pow(Math.tanh(2 * Math.sin(x)), 2)) * 2 * Math.cos(x)};
    break;

    case "stippity-step-simplified":
    this.evaluate = function (x) {return 2 * Math.sin(x) + x};
    this.derivative = function (x) {return 2 * Math.cos(x) + 1};
    break;

    case "stippity-step-3":
    this.evaluate = function (x) {return Math.pow(Math.sin(x), 3) + (0.5 * x)};
    this.derivative = function (x) {return 3 * Math.pow(Math.sin(x), 2) * Math.cos(x) + 0.5};
    break;

    default:
    type = 'identity';
    this.evaluate = function (x) {return x};
    this.derivative = function (x) {return 1};
    break;

  };
  this.type = type;
  this.forward = function (x) {
    return this.evaluate(x);
  };

  this.backward = function (x) {
    return this.derivative(x);
  };
}
