import { HardhatUserConfig } from "hardhat/config";
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
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      gas: 6000000
    }
  }
};


export default config;
