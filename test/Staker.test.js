const RewardToken = artifacts.require("RewardToken");
const Staker = artifacts.require("Staker");

require("chai")
    .use(require("chai-as-promised"))
    .should()


// accounts used: owner, acc1 (staker)
contract("Staker Test", ([owner, acc1]) => {
    let rewardToken, stakerContract;

    before(async () => {

        // Load Contracts
        rewardToken = await RewardToken.new("Reward Token", "RWRD");
        stakerContract = await Staker.new(rewardToken.address);

        //send some tokens from owner to acc1 (staker)
        await rewardToken.transfer(acc1, web3.utils.toWei("1000", "ether"), { from: owner })
    });

    describe("RewardToken.sol", async () => {
        it("has a name and minted coins correctly", async () => {
            const name = await rewardToken.name();
            const balance = await rewardToken.balanceOf(owner);

            assert.equal(balance.toString(), web3.utils.toWei("999000", "ether"), "Has minted coins in wallet");

            const balanceStaker = await rewardToken.balanceOf(acc1);
            console.log("balance staker: ", balanceStaker.toString());
            assert.equal(balanceStaker.toString(), web3.utils.toWei("1000", "ether"), "Transfered coins to staker");
        })
    });

    describe("Staker.sol", async () => {
        it("deployer is owner", async () => {
            const contractOwner = await stakerContract.owner.call();
            assert.equal(contractOwner, owner, "Deployer and owner should be the same");
        })

        it("mint function works", async () => {
            const balanceBef = await rewardToken.balanceOf(owner);
            console.log("balance before: ", balanceBef.toString());

            await stakerContract.mintToken( web3.utils.toWei("100000", "ether"));

            const balanceAft = await rewardToken.balanceOf(owner);
            console.log("balance after: ", balanceAft.toString());
            assert.equal(balanceAft.toString(), web3.utils.toWei("1099000", "ether"), "Balances should match");
        })

        it("staking works as expected", async () => {
            await stakerContract.deposit(web3.utils.toWei("500", "ether"), { from: acc1 });
            const stakingBalance = await stakerContract.balances(acc1);
            console.log("balance: ", stakingBalance.toString());
            assert.equal(stakingBalance.toString(), web3.utils.toWei("500", "ether"), "staking balances should match");
        })

        it("withdraw and unstake", async () => {
            const isStaker = await stakerContract.isStaker(acc1);

            assert.equal(isStaker.toString(), "true", "should be true");

            const isOwnerStaker = await stakerContract.isStaker(owner);
            assert.equal(isOwnerStaker.toString(), "false", "should be false");

            // owner hasn't staked anything and cannot withdraw
            await stakerContract.withdraw({ from: owner }).should.be.rejected;


            // should fail as we cannot take out money before one minute
            // NOTE: this requirement can be out commented in Staker.sol
            // withdraw(), depending on test cases etc.
            // await stakerContract.withdraw({ from: acc1 }).should.be.rejected;


            const balanceBefore = await stakerContract.balances(acc1);
            assert.equal(balanceBefore.toString(), web3.utils.toWei("500", "ether"), "staking should be correct");

            // test withdraw() success by first removing time requirement in Staker.sol
            const withdraw = await stakerContract.withdraw({ from: acc1 });
            const eventWithdraw = await withdraw.logs[0].args.amount;
            assert.equal(eventWithdraw, web3.utils.toWei("500", "ether"), "staking balances should match");

            const stakingBalance = await stakerContract.balances(acc1);
            assert.equal(stakingBalance.toString(), "0", "staking should be 0");
        })
    });
});
