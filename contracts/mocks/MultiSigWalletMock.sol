pragma solidity ^0.4.24;

import "../MultiSigWallet.sol";

contract MultiSigWalletMock is MultiSigWallet {
  uint256 public transactionId;

  constructor (address[] _owners, uint _required) MultiSigWallet(_owners, _required) public {
  }

  function submitTransaction(address _destination, uint _value, bytes _data) public returns (uint _transactionId) {
    transactionId = super.submitTransaction(_destination, _value, _data);

    return transactionId;
  }
}