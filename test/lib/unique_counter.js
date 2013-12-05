var uniqueCounter = require("lib/unique_counter");

describe('uniqueCounter', function() {
  it('allocates an int per unique item', function() {
    var cnt = uniqueCounter();
    expect(cnt('Jim')).to.be(0);
    expect(cnt('Joe')).to.be(1);
    expect(cnt('Jon')).to.be(2);
    expect(cnt('Jim')).to.be(0);
    expect(cnt('Jon')).to.be(2);

    var cnt2 = uniqueCounter();
    expect(cnt2('Bob')).to.be(0);
    expect(cnt2('Ben')).to.be(1);
    expect(cnt2('Bob')).to.be(0);
    expect(cnt('Jon')).to.be(2);
    expect(cnt('Jet')).to.be(3);
  });
});
