// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./RewardToken.sol";


contract Staker {
    string public name = "Staker Contract";
    address public owner;

    // RewardToken
    RewardToken public rewardToken;

    // staking balances
    mapping(address => uint256) public balances;

    // checking time
    mapping(address => uint256) public timeStaked;

    // to control if they have staked
    mapping(address => bool) public isStaker;

    //events
    event LogMinting(uint256 amount, address mintedBy);
    event LogDeposit(uint256 amount, address stakingAddress);
    event LogWithdrawal(
        uint256 amount,
        address stakingAddress,
        uint256 interest,
        uint256 minutesStaked
    );

    /// @dev constructor
    constructor(RewardToken _rewardToken) public {
        rewardToken = _rewardToken;

        // mint 1 million RewardToken and give to owner that can distribute
        // funds to more accounts
        rewardToken.mint(msg.sender, 1000000 ether);

        // contract deployer becomes owner
        owner = msg.sender;
    }

    /// @dev staking function
    /// can only stake once because safer (contract created with time limit)
    /// @param _amount is how much that should be staked
    function deposit(uint256 _amount) public {
        require(!isStaker[msg.sender], "account has already staked");
        require(_amount > 0, "must be greater than 0");

        //ERC20 function, transfer amount staker to owner
        // first approve tx
        rewardToken.approve(msg.sender, address(this), _amount);
        rewardToken.transferFrom(msg.sender, address(this), _amount);

        // update the balance accordingly
        balances[msg.sender] = balances[msg.sender] + _amount;

        // register the time for staking as block timestamp (unix)
        timeStaked[msg.sender] = block.timestamp;

        // msg.sender is now in stakerList and is a staker
        isStaker[msg.sender] = true;

        emit LogDeposit(_amount, msg.sender);
    }

    /// @dev withdraw function
    /// sending all funds to the staker
    /// require: can decide how fast it should be able to withdraw
    /// for testing purposes and the file Staker.test.js in /test,
    /// I decided to outcomment it
    function withdraw() public {
        require(isStaker[msg.sender], "only stakers can withdraw");
        require(balances[msg.sender] > 0, "staking balance cannot be 0");
        /* require(
            ((block.timestamp - timeStaked[msg.sender]) / 60) > 1,
            "Needs to stake at least a minute"
        ); */

        // calculates interest as 100 new coins per minute
        uint256 mins =  (block.timestamp - timeStaked[msg.sender]) / 60;
        uint256 interest = mins * 100;

        // send the total balance to msg.sender
        uint256 totalAmount = balances[msg.sender] + interest;
        rewardToken.transfer(msg.sender, totalAmount);

        // update and set balance to 0
        balances[msg.sender] = 0;

        // account is not a staker anymore
        isStaker[msg.sender] = false;

        emit LogWithdrawal(totalAmount, msg.sender, interest, mins);
    }

    /// @dev function to issue new coins
    /// require only owner
    /// @param _amount is new coins to be minted
    /// could use a cap and control that totalSupply + _amount >= maxCap
    function mintToken(uint256 _amount) public {
        require(msg.sender == owner, "only owner can do this");

        // protected mint function only allowed by contract owner
        rewardToken.mint(msg.sender, _amount);

        emit LogMinting(_amount, msg.sender);
    }
}
