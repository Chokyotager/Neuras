var Layer = require('../classes/Layer');
var Linkage = require('../classes/Linkage');

module.exports = function (encoder, auto, decoder) {

  var e = new Array();
  e.push(new Layer().addNeurones(encoder[0], 'identity'));
  for (var i = 1; i < encoder.length; i++) {
    e.push(new Layer().addNeurones(encoder[i], 'tanh'));
  };
  e = new Linkage(e, true);

  var auto = new Layer().addNeurones(auto, 'tanh');

  var d = new Array();
  for (var i = 0; i < decoder.length - 1; i++) {
    d.push(new Layer().addNeurones(decoder[i], 'tanh'));
  };
  d.push(new Layer().addNeurones(decoder[decoder.length - 1], 'tanh'))
  d = new Linkage(d, true);

  var main = new Linkage([e.toLayer(), auto, d.toLayer()], true);

  main.encoder = e;
  main.decoder = new Linkage([auto, d.toLayer()]);
  main.autoLayer = auto;

  main.getEncoded = function () {
    return main.chronology[1].getUnsquashedOutput();
  };

  return main;

};
