import hre, { ethers } from "hardhat";
import { Multisig, MultisigFactory, Web3CXI } from "../typechain-types";

async function main() {
  const multisigFactoryAddress = "0x5cb902aac5C03ED4f103c7cD67e664BCC6D8e628";
  const Web3CXIAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  // Fetch the deployed contracts
  const multisigFactory: MultisigFactory = await ethers.getContractAt("MultisigFactory", multisigFactoryAddress);
  const web3CXI: Web3CXI = await ethers.getContractAt("Web3CXI", Web3CXIAddress);

  // Get the signers
  const signers = await ethers.getSigners();

  // Check that at least three signers exist
  if (signers.length < 3) {
    throw new Error("Not enough signers available. At least three signers are required.");
  }

  const [owner, otherAccount, thirdAccount] = signers;
  console.log("Signers initialized:", owner.address, otherAccount.address, thirdAccount.address);

  const validSigners = [owner.address, otherAccount.address, thirdAccount.address];
  const quorum = 3;

  // Create Multisig Wallet
  try {
    const tx = await multisigFactory.createMultisigWallet(quorum, validSigners);
    const receipt = await tx.wait();
    console.log("Multisig wallet created:", receipt);

    // Retrieve the clones
    const clones = await multisigFactory.getMultiSigClones();
    console.log("Clones are:", clones); // Assuming clones are addresses
  } catch (error) {
    console.error("Error in creating multisig wallet:", error);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});
