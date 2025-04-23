const { ethers, utils } = require("ethers");
const fs = require('fs')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RifaiNFTRewards.sol/RifaiNFTRewards.json'))
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    const wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, artifact.abi, wallet)

    // Reward all users
    const epochListFile = fs.readFileSync('./scripts/rewards/repo/epoch_' + configs.epoch_number + '.csv').toString()
    const epochList = epochListFile.split('\n')
    let rewarded = 0;
    const rewardList = [];
    for (let i = 0; i < epochList.length; i++) {
        const beneficiary = epochList[i].split(',')[0]
        if (beneficiary.indexOf('0x') === 0 && (parseInt(epochList[i].split(',')[1]) >= 100) || (epochList[i].split(',')[1].indexOf('e') !== -1)) {
            rewardList.push(beneficiary);
            try {
                rewarded++;
                console.log("Number of rewards:", rewarded)
                const nftRewarded = await contract.nftRewarded(beneficiary)
                if (!nftRewarded) {
                    console.log("Rewarding user:", beneficiary)
                    const nonce = await provider.getTransactionCount(wallet.address)
                    console.log("Nonce:", nonce)
                    const gasPrice = (await provider.getGasPrice())
                    const gasPriceBoost = gasPrice.div(100).mul(5)
                    console.log("Gas price:", gasPrice.toString())
                    const tx = await contract.giveRewardNFT(beneficiary, { gasPrice: gasPrice.add(gasPriceBoost), nonce: nonce })
                    console.log("Waiting for transaction to be confirmed...", tx.hash)
                    const receipt = await tx.wait()
                    console.log("Gas used:", receipt.gasUsed.toString())
                    await new Promise(resolve => setTimeout(resolve, 1500));
                } else {
                    console.log("User already rewarded:", beneficiary)
                }
            } catch (e) {
                console.log("Error rewarding user:", beneficiary, e.message)
            }
        } else {
            console.log("Skipping user:", beneficiary, "staking balance:", epochList[i].split(',')[1])
        }
    }
    console.log("Rewarded:", rewarded, "out of", epochList.length)
    console.table(rewardList)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
