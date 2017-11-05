module.exports = function (json) {
  switch (json.lossFunction.toLowerCase()) {
    case "mean-squared":
      this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      this.derivative = function (y, yhat) {return -(y - yhat)};
      break;

    default:
      this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      this.derivative = function (y, yhat) {return -(y - yhat)};
      break;
  };

};
