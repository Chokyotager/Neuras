module.exports = function (seed) {

  this.seed = seed !== undefined ? seed.toString() : Math.random().toString();

  this.from = function (val) {
    if (val instanceof module.exports) {
      return val;
    } else if (val === undefined) {
      return new module.exports(Math.random() * 27913279);
    } else {
      return new module.exports(val);
    };
  };

  this.add = function (value) {
    this.seed += value.toString();
    return this;
  };

  this.random = function () {
    if (typeof this.seed === 'string') {
      var str = this.seed;
      var sum = 0;
      for (var i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
      };
    };
    return ((sum * 32416190071) % 1300979) / 1300979;
  };

};
