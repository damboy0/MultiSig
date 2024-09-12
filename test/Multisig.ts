import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";


  describe("Multisig", function () {
    async function deployToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();
    
        const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
        const token = await erc20Token.deploy();
    
        return { token };
      }
    
      async function deployMultisig() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdAccount, invalidSigner] = await hre.ethers.getSigners();
    
        const { token } = await loadFixture(deployToken)
    
        const MultisigContract = await hre.ethers.getContractFactory("Multisig");
        const validSigners = [owner.address, otherAccount.address, thirdAccount.address];
        const quorum = 2;

        const MultisigDeployed = await MultisigContract.deploy(quorum,validSigners);
    
        
        return { MultisigDeployed, owner, otherAccount,thirdAccount, token, invalidSigner };
      }


      describe("Deployment", function () {
        it("Should set the correct quorum", async function () {
          const { MultisigDeployed } = await loadFixture(deployMultisig);
          expect(await MultisigDeployed.quorum()).to.equal(2); // Verify quorum value
        });
    
        it("Should correctly set the valid signers", async function () {
          const { MultisigDeployed, owner, otherAccount, thirdAccount } = await loadFixture(deployMultisig);
    
          // Verify if the valid signers are correctly set
          expect(await MultisigDeployed.isValidSigner(owner.address)).to.be.true;
          expect(await MultisigDeployed.isValidSigner(otherAccount.address)).to.be.true;
          expect(await MultisigDeployed.isValidSigner(thirdAccount.address)).to.be.true;
        });
    
        it("Should not have non-signers as valid signers", async function () {
          const { MultisigDeployed, token } = await loadFixture(deployMultisig);
          const [_, __, ___, nonSigner] = await ethers.getSigners();
    
          // Verify that non-signer is not considered a valid signer
          expect(await MultisigDeployed.isValidSigner(nonSigner.address)).to.be.false;
        });


        describe("Transfer", async function () {
            it("Should revert if sender is not a valid signer", async function () {
                const { MultisigDeployed, owner, otherAccount, invalidSigner, token } =
                    await loadFixture(deployMultisig);
                const amount = ethers.parseUnits("1", 18);
    
                await token.transfer(MultisigDeployed, amount);
                await expect(
                    MultisigDeployed
                        .connect(invalidSigner)
                        .transfer(amount, otherAccount.address, token)
                ).to.be.revertedWith("invalid signer");
            });

            it("Should revert if contract doesent have enough balance", async function (){
                const { MultisigDeployed, owner, otherAccount, invalidSigner, token } =
                    await loadFixture(deployMultisig);
                const amount = ethers.parseUnits("1", 18);

                const transferAmount = ethers.parseUnits("2", 18);

                token.transfer(MultisigDeployed,amount);

                await expect( 
                    MultisigDeployed.transfer(transferAmount,otherAccount.address,token)
                ).to.be.revertedWith("insufficient funds");
            });
        });
    
  });

});