pragma solidity ^0.4.24;
import "../../contracts/token/ERC20.sol";

/*
    Test token with predefined supply
*/
contract TestERC20Token is ERC20 {
  constructor(uint256 supply) public {
    _totalSupply = supply;
    _balances[msg.sender] = supply;
  }
}