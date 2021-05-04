pragma solidity ^0.4.24;

/*
    @title Provides support and utilities for contract ownership
*/
contract Ownable {
  address public owner;
  address public newOwnerCandidate;

  event OwnerUpdate(address prevOwner, address newOwner);

  /*
    @dev constructor
  */
  constructor() public {
    owner = msg.sender;
  }

  /*
    @dev allows execution by the owner only
  */
  modifier ownerOnly {
    require(msg.sender == owner);
    _;
  }

  /*
    @dev allows transferring the contract ownership
    the new owner still needs to accept the transfer
    can only be called by the contract owner

    @param _newOwnerCandidate    new contract owner
  */
  function transferOwnership(address _newOwnerCandidate) public ownerOnly {
    require(_newOwnerCandidate != address(0));
    require(_newOwnerCandidate != owner);
    newOwnerCandidate = _newOwnerCandidate;
  }

  /*
    @dev used by a new owner to accept an ownership transfer
  */
  function acceptOwnership() public {
    require(msg.sender == newOwnerCandidate);
    emit OwnerUpdate(owner, newOwnerCandidate);
    owner = newOwnerCandidate;
    newOwnerCandidate = address(0);
  }
}
