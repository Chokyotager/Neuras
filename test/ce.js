var neuras = require('../src/neura');

var maxlength = 16;

var ae = new neuras.Architecture.Autoencoder([maxlength, 10], 5, [10, maxlength]);

var mentor = new neuras.Mentor(ae);

var messages = ["Donald Trump", "Hillary Clinton"];
for (var i = 0; i < messages.length; i++) {
  messages[i] = toNumerical(messages[i]);
};

function toNumerical (message) {
  message = message.split('');
  for (var i = 0; i < message.length; i++) {
    message[i] = message[i].charCodeAt(0)/120;
  };

  var ldiff = maxlength - message.length;
  for (var i = 0; i < ldiff; i++) {
    message.push(0);
  };
  return message;
};

function toChar (array) {
  var t = new String();

  for (var i = 0; i < array.length; i++) {
    t = t.concat(String.fromCharCode(parseInt(array[i]*120)));
  };
  return t;
};

mentor.setOptimiser('none');

for (var i = 0; i < 1000; i++) {
  for (var j = 0; j < messages.length; j++) {
    var l = mentor.train(messages[j], messages[j], 0.4);
    //console.log(l);
  };
};

for (var i = 0; i < messages.length; i++) {
  console.log("P: %s     A: %s", toChar(ae.forward(messages[i])), toChar(messages[i]));
};
//console.log(ae.forward(messages[0]));

/*
var encoded = ae.getEncoded();
console.log(encoded);*/
