/* global assert */
function isException(error) {
    let strError = error.toString();
    return strError.includes('invalid opcode') || strError.includes('invalid JUMP') ||  strError.includes('revert')
        ||  strError.includes('invalid address');
}

function ensureException(error) {
    assert(isException(error), error.toString());
}

async function expectThrow (promise, message) {
    try {
      await promise;
    } catch (error) {
      // Message is an optional parameter here
      if (message) {
        assert(
          error.message.search(message) >= 0,
          'Expected \'' + message + '\', got \'' + error + '\' instead',
        );
        return;
      } else {
        // TODO: Check jump destination to destinguish between a throw
        //       and an actual invalid jump.
        const invalidOpcode = error.message.search('invalid opcode') >= 0;
        // TODO: When we contract A calls contract B, and B throws, instead
        //       of an 'invalid jump', we get an 'out of gas' error. How do
        //       we distinguish this from an actual out of gas event? (The
        //       ganache log actually show an 'invalid jump' event.)
        const outOfGas = error.message.search('out of gas') >= 0;
        const revert = error.message.search('revert') >= 0;
        assert(
          invalidOpcode || outOfGas || revert,
          'Expected throw, got \'' + error + '\' instead',
        );
        return;
      }
    }
    assert.fail('Expected throw not received');
  }

  function ether (n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'));
  }

  async function assertRevert (promise) {
    try {
      await promise;
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `Expected "revert", got ${error} instead`);
      return;
    }
    assert.fail('Expected revert not received');
  }
  
module.exports = {
    zeroAddress: '0x0000000000000000000000000000000000000000',
    isException,
    ensureException,
    expectThrow,
    ether,
    assertRevert
};
