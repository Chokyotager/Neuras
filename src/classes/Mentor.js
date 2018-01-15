var Optimiser = require('./Optimiser');

module.exports = class {

  constructor (linkage, json) {

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

  };

  setOptimiser (optimiser, properties) {
    this.optimiser = new Optimiser(optimiser, properties);
    return this;
  };

  batchTrain (inputs, outputs, rate, batch) {
    if (inputs.length !== outputs.length) {
      throw "[Neuras] Number of inputs should be the same as outputs";
    };

    if (typeof batch !== 'number' || batch < 0) {
      throw "[Neuras] Batch count should be specified!";
    };

    var train_count = inputs.length;

    batch = Math.ceil((batch < 1) ? batch * train_count : batch);

    var out_count = this.linkage.configuration[this.linkage.chronology.length - 1][1];
    var accumula = new Array(out_count).fill(0);

    for (var i = 0; i < train_count; i += batch) {
      var ix = inputs.slice(i, i + batch);
      var iy = outputs.slice(i, i + batch);

      var out = this.stochasticTrain(ix, iy, rate);
      for (var j = 0; j < out.length; j++) {
        accumula[j] += out[j] * ix.length/train_count;
      };
    };

    return accumula;

  };

  stochasticTrain (inputs, outputs, rate) {
    if (inputs.length !== outputs.length) {
      throw "[Neuras] Number of inputs should be the same as outputs";
    };

    var train_count = inputs.length;
    var out_count = this.linkage.configuration[this.linkage.chronology.length - 1][1];
    var derivatives = new Array(out_count).fill(0);
    var losses = new Array(out_count).fill(0);

    var ratio = 1/outputs.length;

    for (var i = 0; i < train_count; i++) {
      var out = this.linkage.forward(inputs[i]);
      for (var j = 0; j < out_count; j++) {
        losses[j] += this.evaluate(outputs[i][j], out[j]) * ratio;
        derivatives[j] += this.derivative(outputs[i][j], out[j]) * ratio;
      };
    };

    var updated_derivatives = this.optimiser.optimise(derivatives);

    // Capping & rate multiplication
    for (var i = 0; i < updated_derivatives.length; i++) {
      updated_derivatives[i] = Math.max(Math.min(updated_derivatives[i] * rate, this.gradient_clip), -this.gradient_clip);
    };

    this.linkage.backpropagate(updated_derivatives);

    return losses;

  };

  setClip (clip) {

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

  train (input, expected, rate) {
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

  reciprocalTrain (input, rate) {
    return this.train(input, input, rate);
  };

};
