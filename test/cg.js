var neuras = require('../src/neura');
var Jimp = require('jimp');

var ff = new neuras.Architecture.LSTM([1, 2, 2, 1]);
var mentor = new neuras.Mentor(ff);

var divisor = 10000;

var b = function (x) {
  return Math.pow(x, 3);
};

var input = new Array();
var output = new Array();
for (var i = 0; i < 20; i++) {
  var x = (Math.random() - 0.5) * 2 * 12;
  input.push([x]);
  output.push([b(x) / divisor]);
};

//mentor.setOptimiser('compound-momentum');

for (var i = 0; i < 10000; i++) {
  for (var j = 0; j < input.length; j++) {
    var ll = mentor.train(input[j], output[j], 0.4);
  };
  i % 100 === 0 ? console.log("Iteration: %s, Loss: %s", i, ll) : null;
};

console.log(ff.forward([-2]));
console.log(ff.forward([2]));

plot('rbn');

function evaluate (x) {
  return ff.forward([x])[0] * divisor;
};

function plot(nameext) {

  var config = {
    scale: 0.2,
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
