const {assertRevert} = require('./helpers/utils');

var Ownable = artifacts.require('../contracts/Ownable.sol');

contract('Ownable', (accounts) => {
    let ownable;

    const owner = accounts[0];
    const newOwner = accounts[1];
    const stranger = accounts[2];

    beforeEach(async () => {
        ownable = await Ownable.new();
    });

    describe('construction', async () => {
        it('should have an owner', async () => {
            assert.equal(await ownable.owner(), owner);
        });

        it('should not have a newOwnerCandidate', async () => {
            assert.equal(await ownable.newOwnerCandidate(), 0);
        });
    });

    describe('ownership transfer', async () => {
        it('should change newOwnerCandidate', async () => {
            await ownable.transferOwnership(newOwner);

            assert.equal(await ownable.newOwnerCandidate(), newOwner);
        });

        it('should not change owner without approving the new owner', async () => {
            await ownable.transferOwnership(newOwner);

            assert.equal(await ownable.owner(), owner);
        });

        it('should change owner after transfer and approval and emit event', async () => {
            await ownable.transferOwnership(newOwner);
            const { logs } = await ownable.acceptOwnership({from: newOwner});

            assert.equal(await ownable.owner(), newOwner);
            assert.equal(await ownable.newOwnerCandidate(), 0);
            assert.equal(logs[0].event, 'OwnerUpdate');
            assert.equal(logs[0].args.prevOwner, owner);
            assert.equal(logs[0].args.newOwner, newOwner);
        });

        it('should prevent non-owners from transfering ownership', async () => {
            assert((await ownable.owner()) != stranger);

            await assertRevert(ownable.transferOwnership(newOwner, {from: stranger}));
        });

        it('should prevent transferring ownership to null or 0 address', async () => {
            await assertRevert(ownable.transferOwnership(null, {from: owner}));
            await assertRevert(ownable.transferOwnership(0, {from: owner}));

            assert.equal(owner, await ownable.owner());
        });

        it('should prevent strangers from accepting ownership', async () => {
            await ownable.transferOwnership(newOwner);
            assert.equal(await ownable.newOwnerCandidate(), newOwner);

            await assertRevert(ownable.acceptOwnership({from: stranger}));
            assert.equal(await ownable.newOwnerCandidate(), newOwner);
            assert.equal(await ownable.owner(), owner);
        });
    });
});