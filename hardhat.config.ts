import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: 20000000000,
      gas: 6000000
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      gasPrice: 20000000000,
      gas: 6000000
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: (process.env.NFTOWNER_PRIVATE_KEY !== undefined && process.env.BIDDER_PRIVATE_KEY !== undefined) ? [process.env.NFTOWNER_PRIVATE_KEY, process.env.BIDDER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      gas: 6000000
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GI_API_KEY}` || "",
      accounts: (process.env.NFTOWNER_PRIVATE_KEY !== undefined && process.env.BIDDER_PRIVATE_KEY !== undefined) ? [process.env.NFTOWNER_PRIVATE_KEY, process.env.BIDDER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      gas: 6000000
    },
  }
};

task("init", "Creates Bidder and NFTOwner Wallets for Stagging").setAction(async (_taskArgs, hre) => {
  const wallet = hre.ethers.Wallet.createRandom();
  console.log("Bidder Wallet: ");
  console.log({
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
  });
  const wallet2 = hre.ethers.Wallet.createRandom();
  console.log("NFTOwner Wallet: ");
  console.log({
    address: wallet2.address,
    publicKey: wallet2.publicKey,
    privateKey: wallet2.privateKey,
  });
});

task("getBalance")
  // specify `--address` argument for the task, task arguments will be available as the 1st parameter `taskArgs` below
  .addParam("address")
  // specify handler function for the task, `hre` is the task context that contains `ethers` package
  .setAction(async (taskArgs, hre) => {
    // create RPC provider for Goerli network
    const provider = hre.ethers.getDefaultProvider("goerli");
    console.log(
      "$ETH",
      // format it from Gwei to ETH
      hre.ethers.utils.formatEther(
        // fetch wallet balance using its address
        await provider.getBalance(taskArgs.address)
      )
    );
  });


export default config;
