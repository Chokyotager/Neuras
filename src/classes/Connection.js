var uuid = require('../libs/uuid_generator');

module.exports = function (from, to, weight) {
  this.uuid = uuid();
  this.meta = {from: from.uuid, to: to.uuid};

  this.weight = weight;

};
