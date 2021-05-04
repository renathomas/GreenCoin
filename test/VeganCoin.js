const GreenCoin = artifacts.require('../contracts/token/GreenCoin.sol');
const utils = require('./helpers/utils');

contract('GreenCoin', (accounts) => {
    let token;
    let owner = accounts[0];

    beforeEach(async () => {
        token = await GreenCoin.new();
    });

    describe('construction', async () => {
        it('should be ownable', async () => {
            assert.equal(await token.owner(), owner);
        });

        it('should return correct name after construction', async () => {
            assert.equal(await token.name(), "GreenCoin");
        });

        it('should return correct symbol after construction', async () => {
            assert.equal(await token.symbol(), 'VCN');
        });

        it('should return correct decimal points after construction', async () => {
            assert.equal(await token.decimals(), 18);
        });

        it('should be initialized as not transferable', async () => {
            assert.equal(await token.allowTransfers(), false);
        });
    });
});
