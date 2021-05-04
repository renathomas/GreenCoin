const FreezableToken = artifacts.require('../contracts/token/GreenCoin.sol');
const {assertRevert} = require('./helpers/utils');

contract('FreezableToken', (accounts) => {
    let token;
    const owner = accounts[0];
    const anotherAccount = accounts[1];
    const initialAmount = 100;

    beforeEach(async () => {
        token = await FreezableToken.new();
    });

      describe('token creation', function () {
        const from = owner;
    
        describe('transfers disabled', function () {
          it('transfers disabled by default', async function () {
            const allowTransfers = await token.allowTransfers();

            assert.equal(allowTransfers, false);
          });
      });
    });
    
      describe('enable transfers', function () {
        describe('when transfers are enabled by the token owner', function () {
          const from = owner;
    
          it('unfreeze the token', async function () {
            const { logs } = await token.enableTransfers({ from });
            const allowTransfers = await token.allowTransfers();

            assert.equal(allowTransfers, true);
            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'TransfersEnabled');
          });
        });
    
        describe('when transfers are not enabled by the token owner', function () {
          const from = anotherAccount;
    
          it('reverts', async function () {
            await assertRevert(token.enableTransfers({ from }));
          });
        });
      });

      describe('token transfer', function () {
        const amountToTransfer = 50;
    
        describe('token freezed', function () {      
          beforeEach(async () => {
              await token.mint(anotherAccount, initialAmount, { from: owner });
              await token.mint(owner, initialAmount, { from: owner });
          });

          it('transfers tokens from owner', async function () {
            await token.transfer(anotherAccount, amountToTransfer, { from: owner });

            const balance = await token.balanceOf(anotherAccount);
            assert(balance.eq(initialAmount + amountToTransfer));
          });
    
          it('reverts when transfers tokens from another account', async function () {
            await assertRevert(token.transfer(owner, amountToTransfer, { from: anotherAccount }));
          });
        });

        describe('token unfreezed', function () {      
            beforeEach(async () => {
                await token.mint(anotherAccount, initialAmount, { from: owner });
                await token.mint(owner, initialAmount, { from: owner });
            });
  
            it('withdraws tokens by owner', async function () {
              await token.approve(owner, amountToTransfer, { from: anotherAccount });
              await token.transferFrom(anotherAccount, owner, amountToTransfer, { from: owner });
  
              const balance = await token.balanceOf(owner);
              assert(balance.eq(initialAmount + amountToTransfer));
            });
      
            it('reverts when withdraws tokens from another account', async function () {
              await token.approve(anotherAccount, amountToTransfer, { from: owner });
              await assertRevert(token.transferFrom(owner, anotherAccount, amountToTransfer, { from: anotherAccount }));
            });
          });
    });
});
