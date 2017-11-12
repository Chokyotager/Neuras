var Optimiser = require('./Optimiser');

module.exports = function (linkage, json) {

  typeof json !== 'object' ? json = new Object() : null;

  var lossFunction = new String();
  typeof json.lossFunction !== 'string' ? lossFunction = json.lossFunction : lossFunction = json.lossFunction.toString();

  switch (json.lossFunction) {
    case "mean-squared":
      this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      this.derivative = function (y, yhat) {return -(y - yhat)};
      break;

    case "cross-entropy":
      this.evaluate = function (y, yhat) {return 0};
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
      this.derivative = function (y, yhat) {return -Math.pow((y - yhat), 3)}

    default:
      this.evaluate = function (y, yhat) {return 1/2 * Math.pow((y - yhat), 2)};
      this.derivative = function (y, yhat) {return -(y - yhat)};
      break;
  };

  this.linkage = linkage;
  this.config = json;
  this.cache = new Object();
  this.cache.compound = new Array();
  this.cache.adjacent = new Array();

  this.optimiser = new Optimiser('none');

  this.setOptimiser = function (optimiser) {
    this.optimiser = new Optimiser(optimiser);
    return this;
  };

  this.train = function (input, expected, rate) {
    var losses = new Array();
    var derivatives = new Array();

    var output = this.linkage.forward(input);

    for (var i = 0; i < expected.length; i++) {
      losses.push(this.evaluate(expected[i], output[i]));
      derivatives.push(this.derivative(expected[i], output[i])) * rate;
    };

    var updated_derivatives = this.optimiser.optimise(derivatives);

    this.linkage.backpropagate(updated_derivatives);

    return losses;
  };

};
