module.exports = class {
  constructor (lf) {
    this.__switchLoss(lf, true);
  };

  changeLoss (lf) {
    var type = typeof lf;
    if (type !== 'object' && type !== 'string') {
      return false;
    } else {
      this.__switchLoss(lf, true);
      return true;
    };
  };

  __switchLoss (lf, suppressWarnings) {

    !suppressWarnings ? console.warn("[Neuras] Avoid using semi-private (unsymboled) methods! Use changeLoss() instead!") : null;

    if (typeof lf === 'object') {
      if (typeof lf.evaluate !== 'function' || typeof lf.derivative !== 'function') {
        throw "[Neuras] Custom loss function should contain evaluate(y, yhat) and derivative(y, yhat)!";
      };

      this.evaluate = lf.evaluate;
      this.derivative = lf.derivative;

    } else {

      var lossFunction = new String();
      typeof lf !== 'string' ? lossFunction = lf : lossFunction = lf.toString();

      var enumerate = enumerateTypes(lf);

      for (var i in enumerate) {
        this[i] = enumerate[i];
      };
    };
  };
};

function enumerateTypes (lossFunction) {

  var ret = new Object();

  switch (lossFunction) {
    case "mean-squared":
      ret.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      ret.derivative = function (y, yhat) {return -(y - yhat)};
      break;

    case "cross-entropy":
      ret.evaluate = function (y, yhat) {return -y * Math.log(yhat + 10e-30)};
      ret.derivative = function (y, yhat) {return (yhat - y)};
      break;

    case "linear":
      ret.evaluate = function (y, yhat) {return y - yhat};
      ret.derivative = function (y, yhat) {return -1};
      break;

    case "mean-cubed":
      ret.evaluate = function (y, yhat) {return 1/3 * Math.pow((y - yhat), 3)};
      ret.derivative = function (y, yhat) {return -Math.pow((y - yhat), 2)};
      break;

    case "mean-quad":
      ret.evaluate = function (y, yhat) {return 1/4 * Math.pow((y - yhat), 4)};
      ret.derivative = function (y, yhat) {return -Math.pow((y - yhat), 3)};
      break;

    case "abs":
      ret.evaluate = function (y, yhat) {return Math.abs(y - yhat)};
      ret.derivative = function (y, yhat) {return (y-yhat) !== 0 ? -(y-yhat)/Math.abs(y-yhat) : 0};
      break;

    case "straight-square":
      ret.evaluate = function (y, yhat) {return y - yhat};
      ret.derivative = function (y, yhat) {return Math.max(-1, Math.min(1, -(y - yhat)))};
      break;

    case "log-cosh":
      ret.evaluate = function (y, yhat) {return Math.log(Math.cosh(y - yhat))};
      ret.derivative = function (y, yhat) {return -(Math.log(Math.E) * Math.sinh(y - yhat))/Math.cosh(y - yhat)};
      break;

    default:
      ret.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      ret.derivative = function (y, yhat) {return -(y - yhat)};
      break;
  };

  return ret;
}
