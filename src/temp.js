var c = [

  {neurones: 3, squash: 'tanh'},
  {neurones: 5, squash: 'tanh'},
  {neurones: 6, squash: 'tanh'}

]

function Neurone(activation) {
  this.activation = activation

  switch (activation) {
    case "tanh":
      this.derivative = function (x) {return 1 - Math.pow(Math.tanh(x), 2)}
      break;

    case "sigmoid":
      this.derivative = function (x) {return Math.pow(Math.E, x) / Math.pow((Math.pow(Math.E, x) + 1), 2)}
      break;

    case "relu":
      this.derivative = function (x) {if (x >= 0) {return 1} else {return 0}}
      break;

    case "sin":
      this.derivative = function (x) {return Math.cos(x)}
      break;

    case "gaussian":
      this.derivative = function (x) {return -2 * x * Math.pow(Math.E, Math.pow(-x, 2))}

    default:
      this.derivative = function (x) {return 1 - Math.pow(Math.tanh(x), 2)}

  }
}

// Network class
function Network (config) {

  this.layers = config
  var sum = 0
  var weights = new Array()
  for (var i = 0; i < config.length - 1; i++) {
    var w_c = config[i].neurones * config[i + 1].neurones
    var level_weights = new Array()
    for (var j = 0; j < w_c; j++) {
      level_weights.push(Math.random())
    }

    sum += w_c
    weights.push(level_weights)

  }

  this.weights = weights
  this.connections = sum
  this.layers = config.length

}

var net = new Network(c)

console.log(net)

setInterval(function () {}, 10000)
