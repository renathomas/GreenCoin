pragma solidity ^0.4.24;

import "./CappedToken.sol";
import "./FreezableToken.sol";

/**
 * @title GreenCoin
 * @dev Based on openzeppelin ERC20 token
 */
contract GreenCoin is CappedToken, FreezableToken {

  string public name = "GreenCoin"; 
  string public symbol = "GRN";
  uint8 public decimals = 18;
}
