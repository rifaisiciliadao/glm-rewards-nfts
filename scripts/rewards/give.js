const { ethers, utils } = require("ethers");
const fs = require('fs')


async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/RifaiNFTRewards.sol/RifaiNFTRewards.json'))
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    const wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, artifact.abi, wallet)

    // Give a reward NFT
    const beneficiary = "0x9e3d2311d936bfac4ebe0021e73c9b22b13b7e0a"
    const tx = await contract.giveRewardNFT(beneficiary)
    console.log("Waiting for transaction to be confirmed...", tx.hash)
    const receipt = await tx.wait()
    console.log("Gas used:", receipt.gasUsed.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
