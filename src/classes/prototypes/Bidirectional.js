var Seeder = require('./Seeder');

module.exports = class {

  constructor(to, from, weight) {
    this.to = to;
    this.from = from;

    (typeof weight !== 'number') ? weight = Math.random() : null;
    this.weight = weight;
  };

  seed (seed) {
    var seed = Seeder,from(seed);

    this.weight = seed.add('MW$').random();
    return this;
  };

};
