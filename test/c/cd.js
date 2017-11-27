var neuras = require('../src/neura');

var maxlength = 30;

var ae = new neuras.Architecture.Autoencoder([maxlength, 2], 1, [5, maxlength]);

var mentor = new neuras.Mentor(ae);

var message = "I am very happy!";
message = message.split('');

for (var i = 0; i < message.length; i++) {
  message[i] = message[i].charCodeAt(0);
};

var ldiff = maxlength - message.length;
for (var i = 0; i < ldiff; i++) {
  message.push(0);
};

var set = message;

// Str.charCodeAt(0);

mentor.setOptimiser('compound-momentum');

for (var i = 0; i < 10000; i++) {
  var l = mentor.train(set, set, 0.04);
  //i % 100 === 0 ? console.log("Iteration: %s, Loss: %s", i, l) : null;
};

var vv = ae.forward(set);

var out = new String();

for (var i = 0; i < vv.length; i++) {
  out = out.concat(String.fromCharCode(parseInt(vv[i])));
};

console.log(out);

//console.log(vv);

/*
var encoded = ae.getEncoded();
console.log(encoded);
var out = ae.decoder.forward(encoded);
console.log(out);*/
