var localStorageMemoize = require("lib/localstorage_memoize");

describe('localStorageMemoize', function() {
  it('returns identical results', function() {
    var fib = function(n) {
      return n < 2 ? n : fib(n - 1) + fib(n - 2);
    };
    var memoFib = localStorageMemoize('fib', fib);
    expect(memoFib(10)).to.be(fib(10));
    expect(memoFib(10)).to.be(fib(10));
  });
  it('uses all arguments for caching', function() {
    var mult = function(a, b) {
      return a * b;
    };
    var memoMult = localStorageMemoize('mult', mult);
    expect(mult(2, 3)).to.be(memoMult(2, 3));
    expect(mult(2, 3)).to.be(memoMult(2, 3));
    expect(mult(2, 4)).to.be(memoMult(2, 4));
    expect(mult(2, 4)).to.be(memoMult(2, 4));
  });
});
