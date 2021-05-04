const MintableToken = artifacts.require('../contracts/token/GreenCoin.sol');
const {assertRevert} = require('./helpers/utils');

contract('MintableToken', (accounts) => {
    let token;
    const owner = accounts[0];
    const anotherAccount = accounts[1];

    beforeEach(async () => {
        token = await MintableToken.new();
    });

    describe('as a basic mintable token', function () {
      describe('after token creation', function () {
        it('sender should be token owner', async function () {
          const tokenOwner = await token.owner({ from: owner });
          assert.strictEqual(tokenOwner, owner);
        });
      });
  
      describe('minting finished', function () {
        describe('when the token minting is not finished', function () {
          it('returns false', async function () {
            const mintingFinished = await token.mintingFinished();
            assert.equal(mintingFinished, false);
          });
        });
  
        describe('when the token is minting finished', function () {
          beforeEach(async function () {
            await token.finishMinting({ from: owner });
          });
  
          it('returns true', async function () {
            const mintingFinished = await token.mintingFinished();
            assert.equal(mintingFinished, true);
          });
        });
      });
  
      describe('finish minting', function () {
        describe('when the sender is the token owner', function () {
          const from = owner;
  
          describe('when the token minting was not finished', function () {
            it('finishes token minting', async function () {
              await token.finishMinting({ from });
  
              const mintingFinished = await token.mintingFinished();
              assert.equal(mintingFinished, true);
            });
  
            it('emits a mint finished event', async function () {
              const { logs } = await token.finishMinting({ from });
  
              assert.equal(logs.length, 1);
              assert.equal(logs[0].event, 'MintFinished');
            });
          });
  
          describe('when the token minting was already finished', function () {
            beforeEach(async function () {
              await token.finishMinting({ from });
            });
  
            it('reverts', async function () {
              await assertRevert(token.finishMinting({ from }));
            });
          });
        });
  
        describe('when the sender is not the token owner', function () {
          const from = anotherAccount;
  
          describe('when the token minting was not finished', function () {
            it('reverts', async function () {
              await assertRevert(token.finishMinting({ from }));
            });
          });
  
          describe('when the token minting was already finished', function () {
            beforeEach(async function () {
              await token.finishMinting({ from: owner });
            });
  
            it('reverts', async function () {
              await assertRevert(token.finishMinting({ from }));
            });
          });
        });
      });
  
      describe('mint', function () {
        const amount = 100;
  
        describe('when the sender has the minting permission', function () {
          const from = owner;
  
          describe('when the token minting is not finished', function () {
            it('mints the requested amount', async function () {
              const { logs } = await token.mint(owner, amount, { from });
  
              assert.equal(logs.length, 2);
              assert.equal(logs[0].event, 'Mint');
              assert.equal(logs[0].args.to, owner);
              assert.equal(logs[0].args.amount, amount);
              assert.equal(logs[1].event, 'Transfer');
              assert.equal(logs[1].args.from, 0x0);
              assert.equal(logs[1].args.to, owner);

              const balance = await token.balanceOf(owner);
              assert(balance.eq(amount));

              const totalSupply = await token.totalSupply();
              assert(totalSupply.eq(amount));
            });
          });
  
          describe('when the token minting is finished', function () {
            beforeEach(async function () {
              await token.finishMinting({ from: owner });
            });
  
            it('reverts', async function () {
              await assertRevert(token.mint(owner, amount, { from }));
            });
          });
        });
  
        describe('when the sender has not the minting permission', function () {
          const from = anotherAccount;
  
          describe('when the token minting is not finished', function () {
            it('reverts', async function () {
              await assertRevert(token.mint(owner, amount, { from }));
            });
          });
  
          describe('when the token minting is already finished', function () {
            beforeEach(async function () {
              await token.finishMinting({ from: owner });
            });
  
            it('reverts', async function () {
              await assertRevert(token.mint(owner, amount, { from }));
            });
          });
        });
      });

      describe('burn', function () {
        const initialAmount = 1000;
        const burnAmount = 100;
  
        describe('when the sender has the minting permission', function () {
          const from = owner;
  
          describe('when the token minting is not finished', function () {
            beforeEach(async function () {
              await token.mint(anotherAccount, initialAmount, { owner });
            });
  
            it('burn the requested amount', async function () {
              const { logs } = await token.burn(anotherAccount, burnAmount, { from });
  
              assert.equal(logs.length, 2);
              assert.equal(logs[0].event, 'Burn');
              assert.equal(logs[0].args.from, anotherAccount);
              assert.equal(logs[0].args.amount, burnAmount);
              assert.equal(logs[1].event, 'Transfer');
              assert.equal(logs[1].args.from, anotherAccount);
              assert.equal(logs[1].args.to, 0x0);

              let balance = await token.balanceOf(anotherAccount);
              assert(balance.eq(initialAmount - burnAmount));

              let totalSupply = await token.totalSupply();
              assert(totalSupply.eq(initialAmount - burnAmount));
            });
          });
  
          describe('when the token minting is finished', function () {
            beforeEach(async function () {
              await token.mint(owner, initialAmount, { owner });
              await token.finishMinting({ from: owner });
            });
  
            it('reverts', async function () {
              await assertRevert(token.burn(owner, burnAmount, { from }));
            });
          });

          describe('when the given amount is greater than the balance of the sender', function () {
            beforeEach(async function () {
              await token.mint(anotherAccount, initialAmount, { owner });
            });

            it('reverts', async function () {
              await assertRevert(token.burn(anotherAccount, initialAmount + 1, { from }));
            });
          });
        });
  
        describe('when the sender has not the minting permission', function () {
          const from = anotherAccount;
  
          describe('when the token minting is not finished', function () {
            beforeEach(async function () {
              await token.mint(owner, initialAmount, { owner });
            });

            it('reverts', async function () {
              await assertRevert(token.burn(owner, burnAmount, { from }));
            });
          });
  
          describe('when the token minting is already finished', function () {
            beforeEach(async function () {
              await token.mint(owner, initialAmount, { owner });
              await token.finishMinting({ from: owner });
            });
  
            it('reverts', async function () {
              await assertRevert(token.burn(owner, burnAmount, { from }));
            });
          });
        });
      });
    });
});
