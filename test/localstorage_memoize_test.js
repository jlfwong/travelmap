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
    memoMult.clear();
    expect(mult(2, 3)).to.be(memoMult(2, 3));
    expect(mult(2, 3)).to.be(memoMult(2, 3));
    expect(mult(2, 3)).to.be(memoMult(2, 3));
    expect(mult(2, 4)).to.be(memoMult(2, 4));
    expect(mult(2, 4)).to.be(memoMult(2, 4));
  });

  describe('promise', function() {
    it('returns identical results', function(done) {
      var slowMult = function(a, b) {
        var deferred = $.Deferred();
        setTimeout(function() {
          deferred.resolveWith(null, [a * b]);
        }, 50);
        return deferred.promise();
      };
      var memoSlowMult = localStorageMemoize.promise('slowMult', slowMult);
      memoSlowMult.clear();

      var sm = slowMult(3, 7);
      var msm = memoSlowMult(3, 7);

      $.when(sm, msm).then(function(m1, m2) {
        expect(m1).to.be(m2);
        memoSlowMult(3, 7).then(function(m3) {
          expect(m3).to.be(m1);
          done();
        });
      });
    });
  });
});
