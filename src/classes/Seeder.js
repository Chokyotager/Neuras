module.exports = class {

  constructor (seed) {
    this.seed = seed !== undefined ? seed.toString() : Math.random().toString();
  };

  add (value) {
    this.seed += value.toString();
    return this;
  };

  random () {
    if (typeof this.seed === 'string') {
      var str = this.seed;
      var sum = 0;
      for (var i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
      };
    };
    return ((sum * 32416190071) % 1300979) / 1300979;
  };

  static from (val) {
    if (val instanceof module.exports) {
      return val;
    } else if (val === undefined) {
      return new module.exports(Math.random() * 27913279);
    } else {
      return new module.exports(val);
    };
  };

};
