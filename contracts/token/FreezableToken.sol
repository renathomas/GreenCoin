pragma solidity ^0.4.24;

import "./ERC20.sol";
import "../utils/Ownable.sol";

/**
 * @title FreezableToken
 * @dev LimitedTransferToken transfers start as disabled untill enabled by the contract owner
 */

contract FreezableToken is ERC20, Ownable {

  event TransfersEnabled();

  bool public allowTransfers = false;

  /**
   * @dev Checks whether it can transfer or otherwise throws.
   */
  modifier canTransfer() {
    require(allowTransfers || msg.sender == owner);
    _;
  }

  /**
   * @dev Checks modifier and allows transfer if tokens are not locked.

   */
  function enableTransfers() public ownerOnly {
    allowTransfers = true;
    emit TransfersEnabled();
  }

  /**
   * @dev Checks modifier and allows transfer if tokens are not locked.
   * @param to The address that will receive the tokens.
   * @param value The amount of tokens to be transferred.
   */
  function transfer(address to, uint256 value) public canTransfer returns (bool) {
    return super.transfer(to, value);
  }

  /**
  * @dev Checks modifier and allows transfer if tokens are not locked.
  * @param from The address that will send the tokens.
  * @param to The address that will receive the tokens.
  * @param value The amount of tokens to be transferred.
  */
  function transferFrom(address from, address to, uint256 value) public canTransfer returns (bool) {
    return super.transferFrom(from, to, value);
  }
}
