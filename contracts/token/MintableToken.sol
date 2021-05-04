pragma solidity ^0.4.24;

import "./ERC20.sol";
import "../utils/Ownable.sol";


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

contract MintableToken is ERC20, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();
  event Burn(address indexed from, uint256 amount);

  bool public mintingFinished = false;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address to, uint256 amount) public ownerOnly canMint returns (bool) {
    require(to != address(0));
    
    _totalSupply = _totalSupply.add(amount);
    _balances[to] = _balances[to].add(amount);
    emit Mint(to, amount);
    emit Transfer(address(0), to, amount);
    return true;
  }

    /**
   * @dev Function to burn tokens
   * @param from The address whose tokens will be burnt.
   * @param amount The amount of tokens to burn.
   * @return A boolean that indicates if the operation was successful.
   */
  function burn(address from, uint256 amount) public ownerOnly canMint returns (bool) {
    require(from != address(0));

    _totalSupply = _totalSupply.sub(amount);
    _balances[from] = _balances[from].sub(amount);
    emit Burn(from, amount);
    emit Transfer(from, address(0), amount);
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() public ownerOnly canMint returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }
}
