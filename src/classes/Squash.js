var Seeder = require('./Seeder');

module.exports = class {

  constructor (type, parameters) {

    Math.logab = function (exponent, base) {
      return Math.log(exponent) / Math.log(base);
    };

    typeof parameters !== 'object' ? parameters = new Object() : null;
    var seed = Seeder.from(parameters.seed);

    type = type.toLowerCase();

    if (type.substring(0, 7) === 'random-') {

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

        case "intermediate":
        possible_types = ['relu', 'leaky-relu', 'continuous-tanh'];
        break;

        case "intermediate-mixed":
        possible_types = ['leaky-relu', 'continuous-tanh', 'tanh'];
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

      type = possible_types[Math.round(seed.add('Sq').random() * (possible_types.length-1))];
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
      this.evaluate = function (x) {return (x < 0) ? 0.01 * x : x};
      this.derivative = function (x) {return (x < 0) ? 0.01 : 1};
      break;

      case "randomised-leaky-relu":
      this.rlrelu = seed.add('RRSq').random();
      this.evaluate = function (x) {return (x < 0) ? this.rlrelu * x : x};
      this.derivative = function (x) {return (x < 0) ? this.rlrelu : 1};
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

      case "adaptive-normal":
      this.norm_max = 1;
      this.norm_min = 0;
      this.evaluate = function (x) {this.norm_max = Math.max(x, this.norm_max); this.norm_min = Math.min(x, this.norm_max); return (x - this.norm_min)/this.norm_max};
      this.derivative = function (x) {return -x/this.norm_max};
      break;

      case "static-normal":
      if (parameters === undefined || typeof parameters.max !== 'number') {
        throw "[Neuras] Squash (Params).max should be a real number for normalisation!"
      };
      this.norm_max = parameters.max;
      this.norm_min = typeof parameters.min === 'number' ? parameters.min : 0;
      this.evaluate = function (x) {return (x - this.norm_min)/this.norm_max};
      this.derivative = function (x) {return -x/this.norm_max};
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
      this.modulo_value = seed.add('MODSq').random();
      this.evaluate = function (x) {return x % (this.modulo_value * 1e2)};
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

      case "stippity-step-3":
      this.evaluate = function (x) {return Math.pow(Math.sin(x), 3) + (0.5 * x)};
      this.derivative = function (x) {return 3 * Math.pow(Math.sin(x), 2) * Math.cos(x) + 0.5};
      break;

      case "continuous-tanh":
      this.evaluate = function (x) {return 1 * Math.sin(x) + x};
      this.derivative = function (x) {return 1 * Math.cos(x) + 1};
      break;

      case "continuous-bipolar-tanh":
      this.evaluate = function (x) {return 1/Math.PI * Math.sin(Math.PI * x) + x};
      this.derivative = function (x) {return Math.cos(Math.PI * x) + 1};
      break;

      case "disturbed-continuous-tanh":
      this.evaluate = function (x) {return 0.1 * Math.sin(10 * x) + x};
      this.derivative = function (x) {return Math.cos(10 * x) + 1};
      break;

      case "continuous-variant-tanh":
      this.evaluate = function (x) {return 200 * Math.sin(0.005 * x) + x};
      this.derivative = function (x) {return Math.cos(0.005 * x) + 1};
      break;

      case "incremented-sin":
      this.evaluate = function (x) {return 0.5 * Math.sin(x) + 0.5};
      this.derivative = function (x) {return 0.5 * Math.cos(x)};
      break;

      case "super-sin":
      this.evaluate = function (x) {return 0.5 * Math.sin(x) + 0.4999999};
      this.derivative = function (x) {return 0.5 * Math.cos(x)};
      break;

      case "steps":
      this.evaluate = function (x) {return 0.2 * Math.pow(Math.sin(x), 2) + x};
      this.derivative = function (x) {return 0.4 * Math.sin(x) * Math.cos(x) + 1};
      break;

      case "binary-logistic":
      this.evaluate = function (x) {return (x < 0) ? 0 : 1};
      this.derivative = function (x) {return Math.pow(Math.E, x) / Math.pow((Math.pow(Math.E, x) + 1), 2)};
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
      this.evaluate = function (x) {return x};
      this.derivative = function (x) {return 1};
      break;

    };
    this.type = type;
  };

  forward (x) {
    return this.evaluate(x);
  };

  backward (x) {
    return this.derivative(x);
  };

};
