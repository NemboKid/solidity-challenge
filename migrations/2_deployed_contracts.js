const RewardToken = artifacts.require("RewardToken");
const Staker = artifacts.require("Staker");

module.exports = async (deployer, network, accounts) => {
    console.log(`Migrating contract to network "${network}" using address ${accounts[0]}...`);

    // Deploy RewardToken.sol and store as const
    await deployer.deploy(RewardToken, "Reward Token", "RWRD");
    const rewardToken = await RewardToken.deployed();

    // Staker.sol
    await deployer.deploy(Staker, rewardToken.address);
    await Staker.deployed();
};
