module.exports = function (seed) {
  // PRNG: Congruential pseudorandom number generator
  if (typeof seed === 'string') {
    var str = seed;
    seed = 0;
    for (var i = 0; i < str.length; i++) {
      seed += str.charCodeAt(i);
    };
  };
  return ((seed * 15486773) % 1299841) / 1299841;
};
