const CappedToken = artifacts.require('../contracts/token/GreenCoin.sol');
const {expectThrow, ether} = require('./helpers/utils');

contract('CappedToken', (accounts) => {
    let token;
    const owner = accounts[0];
    const to = accounts[1];
    const cap = ether(1000000000);

    beforeEach(async () => {
        token = await CappedToken.new();
    });

    describe('capped token', function () {
        it('should start with the correct cap', async function () {
          const _cap = await token.cap();
    
          assert(cap.eq(_cap));
        });
    
        it('should mint when amount is less than cap', async function () {
          const result = await token.mint(to, cap.sub(1), { owner });
          assert.equal(result.logs[0].event, 'Mint');
        });
    
        it('should fail to mint if the ammount exceeds the cap', async function () {
          await token.mint(to, cap.sub(1), { owner });
          await expectThrow(token.mint(to, 100, { owner }));
        });
    
        it('should fail to mint after cap is reached', async function () {
          await token.mint(to, cap, { owner });
          await expectThrow(token.mint(to, 1, { owner }));
        });
      });
});
