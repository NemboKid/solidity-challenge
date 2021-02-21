// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract RewardToken is ERC20 {
    /// optional constants such as:
    // uint256 MAX_CAP
    // uint256 MAX_STAKING_AMOUNT
    // uint256 INTEREST_RATE
    address payable owner;

    /// @dev set deployer's address as contract's main wallet
    /// Call _mint() function and put 1 million ether in owner's wallet
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
        public
    {
        owner = msg.sender;
        /* _mint(msg.sender, 1000000 ether); */
    }


    function mint(address _account, uint256 _amount) public {
        require(_account == owner, "account address must be owner");
        _mint(_account, _amount);
    }

    function approve(address _staker, address _contract, uint256 _amount) public {
        require(msg.sender == _contract, "only staker can perform this");
        _approve(_staker, _contract, _amount);
    }
}
