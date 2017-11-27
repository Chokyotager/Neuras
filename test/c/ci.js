var neuras = require('../src/neura');
var Jimp = require('jimp');

var one = new neuras.Layer().addNeurones(1, 'identity');
var onepointfive = new neuras.Layer().addNeurones(4, 'logistic')//.addBiases(1, false);
var onepoint7 = new neuras.Layer().addNeurones(5, 'logistic').addBiases(1, true);
var onepoint8 = new neuras.Layer().addNeurones(4, 'tanh')//.addBiases(1);
var two = new neuras.Layer().addNeurones(1, 'tanh');

var ff = new neuras.Linkage([one, onepointfive, onepoint7, onepoint8, two], true);
var mentor = new neuras.Mentor(ff);

var divisor = 10000;

var b = function (x) {
  return Math.sin(x) * 300;
};

var input = new Array();
var output = new Array();
for (var i = 0; i < 40; i++) {
  var x = (Math.random() - 0.5) * 2 * 24;
  input.push([x]);
  output.push([b(x) / divisor]);
};

mentor.setOptimiser('compound-momentum');

for (var i = 0; i < 300000; i++) {

  var ll = 0;

  for (var j = 0; j < input.length; j++) {
    ll += mentor.train(input[j], output[j], .04)[0];
  };

  //var ll = mentor.trainStochastically(input, output, 4, 0.5);

  if (i % 100 === 0) {

    /*if (ll < 10e-10) {
      console.log("Force quit!");
      break;
    };*/

    console.log("Iteration: %s, Loss: %s", i, ll);
    if ((Math.abs(cache - ll) / ll) < 0.000005 && ll > 10e-6 && i > 0) {
      console.log("DROPOUT!");
      ff.dropoutWeights(0.02);
      ff.jumbleTrainRate(0.06);
      ff.messUpWeights(0.05, 0.05);
    };
    var cache = ll;
  };

};

console.log(ff.forward([-2]));
console.log(ff.forward([2]));

plot('do');

function evaluate (x) {
  return ff.forward([x])[0] * divisor;
};

function plot(nameext) {

  var config = {
    scale: .1,
    range: 0
  };

  var x = 1200
  var y = 1200
  const scale = config['scale'];

  var arr = new Array()

  var image = new Jimp(x, y, 0xFFFFFFFF, function (err, image) {

    if (err) {
      console.log(err)
    }

    var ymid = y / 2

    // plot axes
    for (var i = 0; i < x; i++) {

      image.setPixelColor(0x505050FF, i, y/2)

    }

    for (var i = 0; i < y; i++) {

      image.setPixelColor(0x505050FF, x/2, i)

    }

    for (var i = 0; i < x; i++) {

      var xnot = (i - (x/2)) * scale
      var actual = b(xnot);

      if (-config['range'] <= xnot && xnot <= config['range']) {

        for (var j = 0; j < y; j++) {

          if (image.getPixelColor(i, j) == 0xFFFFFFFF) {
            image.setPixelColor(0x008800BB, i, j)
          }
        }

      }

      var ra = evaluate(xnot);
      var net = (ra);

      arr.push({'pos': xnot, 'a': actual, 'b': net})

      //image.setPixelColor(0x000000FF, i, (actual + ymid))
      if (i > 1 && (actual + ymid) < y && (arr[i-1]['a'] + ymid) < y) bline(i, (actual + ymid), (i-1), (arr[i-1]['a'] + ymid), 0x000000FF)


      //image.setPixelColor(0xEE0000FF, i, (net + ymid))
      if (i > 1 && (net + ymid) < y && (arr[i-1]['b'] + ymid) < y) bline(i, (net + ymid), (i-1), (arr[i-1]['b'] + ymid), 0xEE0000FF)


      // bline
      function bline(x0, y0, x1, y1, pxc) {

        x0 = parseInt(Math.round(x0));
        y0 = parseInt(Math.round(y0));
        x1 = parseInt(Math.round(x1));
        y1 = parseInt(Math.round(y1));

        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        var err = (dx>dy ? dx : -dy)/2;

        while (true) {
          image.setPixelColor(pxc, x0, y0);
          if (x0 === x1 && y0 === y1) break;
          var e2 = err;
          if (e2 > -dx) { err -= dy; x0 += sx; }
          if (e2 < dy) { err += dx; y0 += sy; }
        }
      }

    }

    // graph inverted - flip
    image.flip(false, true)

    image.write("Desktop/Programming/Neurajs/ignore/" + nameext + ".jpg")

    console.log('Plotting complete')

  })

}
