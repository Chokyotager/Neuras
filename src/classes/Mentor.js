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

  this.linkage = linkage;
  this.config = json;
  this.cache = new Object();
  this.cache.compound = new Array();
  this.cache.adjacent = new Array();
  this.gradient_clip = Infinity;

  this.optimiser = new Optimiser('none');

  this.setOptimiser = function (optimiser, properties) {
    this.optimiser = new Optimiser(optimiser, properties);
    return this;
  };

  this.trainStochastically = function (inputs, outputs, rate, probability) {

    if (inputs.length !== outputs.length) {
      throw "[Neuras] Input array should be of the same length as output array!";
    };

    typeof probability !== 'number' ? probability = 1 : null;

    var derivatives = new Array();
    var losses = new Array();

    for (var i = 0; i < inputs.length; i++) {
      if (Math.random() > probability) {
        continue;
      };
      var out = this.linkage.forward(inputs[i]);

      var deriv_placeholder = new Array();
      var loss_placeholder = new Array();

      for (var j = 0; j < outputs[i].length; j++) {
        deriv_placeholder.push(this.derivative(outputs[i][j], out[j]));
        loss_placeholder.push(this.evaluate(outputs[i][j], out[j]));
      };
      derivatives.push(deriv_placeholder);
      losses.push(loss_placeholder);
    };

    var deriv = new Array(outputs[0].length).fill(0);
    var loss = new Array(outputs[0].length).fill(0);

    for (var i = 0; i < derivatives.length; i++) {
      for (var j = 0; j < derivatives[i].length; j++) {
        deriv[j] += derivatives[i][j] * 1/derivatives.length;
        loss[j] += losses[i][j] * 1/derivatives.length;
      };
    };

    deriv = this.optimiser.optimise(deriv);

    if (deriv.length > 0) {
      // Capping & rate multiplication
      for (var i = 0; i < deriv.length; i++) {
        deriv[i] = Math.max(Math.min(deriv[i] * rate, this.gradient_clip), -this.gradient_clip);
      };

      this.linkage.backpropagate(deriv);

      return loss;
    } else {
      return new Array(outputs.length).fill(null);
    }

  };

  this.setClip = function (clip) {

    if (clip === undefined) {
      clip = Infinity;
    };

    clip = parseFloat(clip);
    if (isNaN(clip)) {
      throw "[Neuras] Clip should be a defined floating point!";
    } else if (clip < 0) {
      throw "[Neuras] Clip cannot be negative!";
    };
    this.gradient_clip = clip;
  };

  this.train = function (input, expected, rate) {
    var losses = new Array();
    var derivatives = new Array();

    var output = this.linkage.forward(input);

    for (var i = 0; i < expected.length; i++) {
      losses.push(this.evaluate(expected[i], output[i]));
      derivatives.push(this.derivative(expected[i], output[i]));
    };

    var updated_derivatives = this.optimiser.optimise(derivatives);

    // Capping & rate multiplication
    for (var i = 0; i < updated_derivatives.length; i++) {
      updated_derivatives[i] = Math.max(Math.min(updated_derivatives[i] * rate, this.gradient_clip), -this.gradient_clip);
    };

    this.linkage.backpropagate(updated_derivatives);

    return losses;
  };

};
