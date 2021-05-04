pragma solidity ^0.4.24;

import "./MintableToken.sol";


/**
 * @title Capped token
 * @dev Mintable token with a token cap.
 */
contract CappedToken is MintableToken {

  uint256 public constant cap = 1000000000000000000000000000;

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address to,
    uint256 amount
  )
    public
    returns (bool)
  {
    require(_totalSupply.add(amount) <= cap);

    return super.mint(to, amount);
  }

}
