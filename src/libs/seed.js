module.exports = function (seed) {
  // PRNG: Congruential pseudorandom number generator
  if (typeof seed === 'string') {
    var str = seed;
    seed = 0;
    for (var i = 0; i < str.length; i++) {
      seed += str.charCodeAt(i);
    };
  };
  return ((seed * 179426407) % 32416190071) / 32416190071;
};
