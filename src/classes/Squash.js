module.exports = function (type, parameters) {

  var prototype = this;

  Math.logab = function (exponent, base) {
    return Math.log(exponent) / Math.log(base);
  };

  type = type.toLowerCase();

  if (type.substring(0, 7) === 'random-') {
    typeof parameters !== 'object' ? parameters = new Object() : null;
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
      break;

      case "sinusoidal":
      possible_types = ['sin', 'cos', 'stippity-step', 'stippity-step-simplified', 'stippity-step-3'];
      break;

      case "rangeless":
      possible_types = ['stippity-step', 'stippity-step-simplified', 'stippity-step-3', 'leaky-relu', 'relu', 'identity'];
      break;

      case "regression":
      possible_types = ['leaky-relu', 'softplus', 'identity', 'cube', 'natural-exponential', 'bent-identity'];
      break;

      case "custom":
      possible_types = new Array();
      if (parameters.include === undefined) {
        throw "[Neuras] (Params).include should be defined for Squash parameters!";
      };
      break;

      default:
      possible_types = ['tanh', 'arctan', 'logistic'];
      break;
    };

    // Evaluate parameters
    if (parameters.exclude !== undefined) {
      for (var i = 0; i < parameters.exclude.length; i++) {
        for (var i = 0; i < possible_types; i++) {
          if (parameters.exclude[i] === possible_types) {
            possible_types.splice(i, 1);
          };
        };
      };
    };

    parameters.include !== undefined ? possible_types = possible_types.concat(parameters.include) : null;

    if (possible_types.length < 1) {
      throw "[Neuras] Should have at least one squash type in randomiser!";
    };

    type = possible_types[Math.round(Math.random() * (possible_types.length-1))];
  };

  switch (type) {

    case "tanh":
    prototype.evaluate = function (x) {return Math.tanh(x)};
    prototype.derivative = function (x) {return 1 - Math.pow(Math.tanh(x), 2)};
    break;

    case "arctan":
    prototype.evaluate = function (x) {return Math.atan(x)};
    prototype.derivative = function (x) {return 1/(Math.pow(x, 2) + 1)};
    break;

    case "logistic":
    prototype.evaluate = function (x) {return 1/(1 + Math.pow(Math.E, -x))};
    prototype.derivative = function (x) {return Math.pow(Math.E, x) / Math.pow((Math.pow(Math.E, x) + 1), 2)};
    break;

    case "hard-tanh":
    prototype.evaluate = function (x) {return (x <= 1 && x >= -1) ? x : (x < -1) ? -1 : 1};
    prototype.derivative = function (x) {return (x <= 1 && x >= -1) ? 1 : 0};
    break;

    case "leaky-relu":
    prototype.evaluate = function (x) {return (x < 0) ? 0.01 * x : x};
    prototype.derivative = function (x) {return (x < 0) ? 0.01 : 1};
    break;

    case "randomised-leaky-relu":
    this.rlrelu = Math.random();
    prototype.evaluate = function (x) {return (x < 0) ? this.rlrelu * x : x};
    prototype.derivative = function (x) {return (x < 0) ? this.rlrelu : 1};
    break;

    case "sinc":
    prototype.evaluate = function (x) {return (x === 0) ? 1 : Math.sin(x)/x};
    prototype.derivative = function (x) {return (x === 0) ? 0 : Math.cos(x)/x - Math.sin(x)/Math.pow(x, 2)};
    break;

    case "binary-step":
    prototype.evaluate = function (x) {return (x < 0) ? 0 : 1};
    prototype.derivative = function (x) {return (x === 0) ? 10e30 : 0};
    break;

    case "signum":
    prototype.evaluate = function (x) {return (x < 0) ? -1 : 1};
    prototype.derivative = function (x) {return (x === 0) ? 10e30 : 0};
    break;

    case "relu":
    prototype.evaluate = function (x) {return Math.max(x, 0)};
    prototype.derivative = function (x) {return (x < 0) ? 0 : 1};
    break;

    case "identity":
    prototype.evaluate = function (x) {return x};
    prototype.derivative = function (x) {return 1};
    break;

    case "bent-identity":
    prototype.evaluate = function (x) {return (Math.sqrt(Math.pow(x, 2) + 1)-1)/2 + x};
    prototype.derivative = function (x) {return x/(2*Math.sqrt(Math.pow(x, 2) + 1)) + 1};
    break;

    case "gaussian":
    prototype.evaluate = function (x) {return Math.pow(Math.E, -Math.pow(x, 2))};
    prototype.derivative = function (x) {return -2 * x * Math.pow(Math.E, -Math.pow(x, 2))};
    break;

    case "sin":
    prototype.evaluate = function (x) {return Math.sin(x)};
    prototype.derivative = function (x) {return Math.cos(x)};
    break;

    case "cos":
    prototype.evaluate = function (x) {return Math.cos(x)};
    prototype.derivative = function (x) {return -Math.sin(x)};
    break;

    case "softplus":
    prototype.evaluate = function (x) {return Math.logab(1 + Math.pow(Math.E, x), Math.E)};
    prototype.derivative = function (x) {return 1/(1 + Math.pow(Math.E, -x))};
    break;

    case "adaptive-normal":
    this.norm_max = 1;
    this.norm_min = 0;
    prototype.evaluate = function (x) {this.norm_max = Math.max(x, this.norm_max); this.norm_min = Math.min(x, this.norm_max); return (x - this.norm_min)/this.norm_max};
    prototype.derivative = function (x) {return -x/this.norm_max};
    break;

    case "static-normal":
    if (parameters === undefined || typeof parameters.max !== 'number') {
      throw "[Neuras] Squash (Params).max should be a real number for normalisation!"
    };
    this.norm_max = parameters.max;
    this.norm_min = typeof parameters.min === 'number' ? parameters.min : 0;
    prototype.evaluate = function (x) {return (x - this.norm_min)/this.norm_max};
    prototype.derivative = function (x) {return -x/this.norm_max};
    break;

    // Experimental

    case "smooth-cube":
    prototype.evaluate = function (x) {return Math.pow(x, 2)/Math.sin(x)};
    prototype.derivative = function (x) {return (x*(2*Math.sin(x)+Math.cos(x)))/Math.pow(Math.sin(x), 2)};
    break;

    case "hard-identity":
    prototype.evaluate = function (x) {return 4 * x};
    prototype.derivative = function (x) {return 4};
    break;

    case "natural-exponential":
    prototype.evaluate = function (x) {return Math.pow(Math.E, x)};
    prototype.derivative = function (x) {return Math.pow(Math.E, x)};
    break;

    case "log":
    prototype.evaluate = function (x) {return Math.logab(x, 10)};
    prototype.derivative = function (x) {return 1/x * Math.logab(Math.E, 10)};
    break;

    case "ablog":
    prototype.evaluate = function (x) {return Math.log(Math.abs(x)+10e-30)};
    prototype.derivative = function (x) {return (x*Math.logab(Math.E, 10))/((Math.abs(x)+10e-30)*Math.abs(x))};
    break;

    case "cube":
    prototype.evaluate = function (x) {return Math.pow(x, 3)};
    prototype.derivative = function (x) {return 3 * Math.pow(x, 2)};
    break;

    case "square":
    prototype.evaluate = function (x) {return Math.pow(x, 2)};
    prototype.derivative = function (x) {return 2 * x};
    break;

    case "modulus":
    prototype.evaluate = function (x) {return x % Math.random() * 10};
    prototype.derivative = function (x) {return 1};
    break;

    case "cube-root":
    prototype.evaluate = function (x) {return Math.cbrt(x)};
    prototype.derivative = function (x) {return 1/(3 * Math.pow(x, 2/3))};
    break;

    case "stippity-step":
    prototype.evaluate = function (x) {return Math.tanh(2 * Math.sin(x)) + x};
    prototype.derivative = function (x) {return (1 - Math.pow(Math.tanh(2 * Math.sin(x)), 2)) * 2 * Math.cos(x)};
    break;

    case "stippity-step-3":
    prototype.evaluate = function (x) {return Math.pow(Math.sin(x), 3) + (0.5 * x)};
    prototype.derivative = function (x) {return 3 * Math.pow(Math.sin(x), 2) * Math.cos(x) + 0.5};
    break;

    case "continuous-tanh":
    prototype.evaluate = function (x) {return 1 * Math.sin(x) + x};
    prototype.derivative = function (x) {return 1 * Math.cos(x) + 1};
    break;

    case "continuous-bipolar-tanh":
    prototype.evaluate = function (x) {return 1/Math.PI * Math.sin(Math.PI * x) + x};
    prototype.derivative = function (x) {return Math.cos(Math.PI * x) + 1};
    break;

    case "disturbed-continuous-tanh":
    prototype.evaluate = function (x) {return 0.1 * Math.sin(10 * x) + x};
    prototype.derivative = function (x) {return Math.cos(10 * x) + 1};
    break;

    case "incremented-sin":
    prototype.evaluate = function (x) {return 0.5 * Math.sin(x) + 0.5};
    prototype.derivative = function (x) {return 0.5 * Math.cos(x)};
    break;

    case "steps":
    prototype.evaluate = function (x) {return 0.2 * Math.pow(Math.sin(x), 2) + x};
    prototype.derivative = function (x) {return 0.4 * Math.sin(x) * Math.cos(x) + 1};
    break;

    // Custom & default
    case "custom":
    try {
      this.evaluate = parameters.evaluate;
      this.derivative = parameters.derivative;
    } catch (err) {
      throw "[Neuras] Caught exception in custom Squash: " + err;
    };
    break;

    default:
    type = 'identity';
    prototype.evaluate = function (x) {return x};
    prototype.derivative = function (x) {return 1};
    break;

  };
  this.type = type;
};

var prototype = module.exports.prototype;

prototype.forward = function (x) {
  return this.evaluate(x);
};

prototype.backward = function (x) {
  return this.derivative(x);
};
