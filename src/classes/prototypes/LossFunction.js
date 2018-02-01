module.exports = class {
  constructor (lf) {
    var lossFunction = new String();
    typeof lf !== 'string' ? lossFunction = lf : lossFunction = lf.toString();

    switch (lossFunction) {
      case "mean-squared":
        this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
        this.derivative = function (y, yhat) {return -(y - yhat)};
        break;

      case "cross-entropy":
        this.evaluate = function (y, yhat) {return -y * Math.log(yhat + 10e-30)};
        this.derivative = function (y, yhat) {return (yhat - y)};
        break;

      case "linear":
        this.evaluate = function (y, yhat) {return y - yhat};
        this.derivative = function (y, yhat) {return -1};
        break;

      case "mean-cubed":
        this.evaluate = function (y, yhat) {return 1/3 * Math.pow((y - yhat), 3)};
        this.derivative = function (y, yhat) {return -Math.pow((y - yhat), 2)};
        break;

      case "mean-quad":
        this.evaluate = function (y, yhat) {return 1/4 * Math.pow((y - yhat), 4)};
        this.derivative = function (y, yhat) {return -Math.pow((y - yhat), 3)};
        break;

      case "abs":
        this.evaluate = function (y, yhat) {return Math.abs(y - yhat)};
        this.derivative = function (y, yhat) {return (y-yhat) !== 0 ? -(y-yhat)/Math.abs(y-yhat) : 0};
        break;

      case "log-cosh":
        this.evaluate = function (y, yhat) {return Math.log(Math.cosh(y - yhat))};
        this.derivative = function (y, yhat) {return -(Math.log(Math.E) * Math.sinh(y - yhat))/Math.cosh(y - yhat)};
        break;

      default:
        this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
        this.derivative = function (y, yhat) {return -(y - yhat)};
        break;
    };
  };
};
