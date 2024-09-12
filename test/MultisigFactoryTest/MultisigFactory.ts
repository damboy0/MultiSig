import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MultisigFactory", function () {
  async function deployFactoryFixture() {
    // Get the accounts
    const [owner, signer1, signer2, signer3] = await ethers.getSigners();

    // Deploy the MultisigFactory contract
    const MultisigFactory = await ethers.getContractFactory("MultisigFactory");
    const multisigFactory = await MultisigFactory.deploy();
    //await multisigFactory.deployed();

    // Return values for testing
    return { multisigFactory, owner, signer1, signer2, signer3 };
  }

  it("Should deploy the factory and create multisig wallets", async function () {
    const { multisigFactory, owner, signer1, signer2, signer3 } =
      await loadFixture(deployFactoryFixture);

    // Prepare valid signers
    const validSigners = [owner.address, signer1.address, signer2.address];

    // Call createMultisigWallet
    const quorum = 2;
    const createTx = await multisigFactory.createMultisigWallet(quorum, validSigners);
    await createTx.wait();

    // Verify the wallet is created
    const multisigClonesLength = await multisigFactory.getMultiSigClones();
    expect(multisigClonesLength.length).to.equal(1); // One wallet created

    // Create another multisig wallet
    const createTx2 = await multisigFactory.createMultisigWallet(quorum, validSigners);
    await createTx2.wait();

    // Verify the number of clones is now 2
    const multisigClonesLength2 = await multisigFactory.getMultiSigClones();
    expect(multisigClonesLength2.length).to.equal(2);
  });

  it("Should return the correct multisig clones", async function () {
    const { multisigFactory, owner, signer1, signer2 } = await loadFixture(deployFactoryFixture);

    
    const validSigners = [owner.address, signer1.address, signer2.address];

    
    const quorum = 2;
    await multisigFactory.createMultisigWallet(quorum, validSigners);

    // Fetch multisig clones
    const multisigClones = await multisigFactory.getMultiSigClones();

    // Verify the clone data
    expect(multisigClones.length).to.equal(1); // One wallet created
    expect(multisigClones[0]).to.not.be.null;
  });
});
