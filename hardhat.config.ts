import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MAINNET_PROVIDER_URL || '';
const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

const config: any = {
  solidity: "0.8.18",

  contractSizer: {
    alphaSort: true,
    runOnCompile: !!process.env.REPORT_CONTRACT_SIZE,
    disambiguatePaths: false,
  },

  networks: {
    bsc: {
      url,
      chainId: 56,
      gas: 2100000,
      accounts,
      addressesSet: "bsc",
    },
    bscTestnet: {
      url,
      chainId: 97,
      gas: 2100000,
      gasPrice: 80000000000,
      accounts,
      addressesSet: "bscTestnet",
    },
    polygon: {
      url,
      chainId: 137,
      gasPrice: Number(process.env.GAS_PRICE_POLYGON),
      accounts,
      addressesSet: "polygon",
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
  },
};

export default config;
