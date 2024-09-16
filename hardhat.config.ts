import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL!, // Sepolia RPC URL from your .env
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!, process.env.SECOND_PRIVATE_KEY!,process.env.THIRD_PRIVATE_KEY!], // Private keys from your .env
      gasPrice: 1000000000, // Optional gas price configuration
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!, // Sepolia uses Etherscan for verification
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
