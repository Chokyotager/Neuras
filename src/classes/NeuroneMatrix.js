module.exports = function (type) {
  switch (type) {
    case "sum":
    this.evaluate = function (m) {
      return m.reduce(function (a, b) {return a + b});
    };
    this.derivative = 1;
    break;

    case "product":
    this.evaluate = function (m) {
      return m.reduce(function (a, b) {return a * b})
    };
    break;

  };
};
