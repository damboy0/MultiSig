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

        describe("Approve", async function() {
          it("Should Approve Transfer", async function(){
            const { MultisigDeployed, otherAccount, thirdAccount, token } =
                    await loadFixture(deployMultisig);
            const amount = ethers.parseUnits("1", 18);

            token.transfer(MultisigDeployed,amount);

            await MultisigDeployed.transfer(amount,otherAccount.address,token);

            await MultisigDeployed.connect(thirdAccount).approveTx(1);

            const tx = await MultisigDeployed.transactions(1);


            expect(tx.noOfApproval).to.equal(2);
            expect(tx.isCompleted).to.be.true;
          });


          it("Should not approve Transaction twice", async function(){

            const { MultisigDeployed, otherAccount, token } =
                    await loadFixture(deployMultisig);
            const amount = ethers.parseUnits("1", 18);

            token.transfer(MultisigDeployed,amount);

            await MultisigDeployed.transfer(amount,otherAccount.address,token);

            await expect(MultisigDeployed.approveTx(1)).to.be.revertedWith("can't sign twice");

          });

          it("Should revert if it is not a valid signer", async function(){

            const { MultisigDeployed, owner, otherAccount, invalidSigner, token } =
                    await loadFixture(deployMultisig);
                const amount = ethers.parseUnits("1", 18);

                token.transfer(MultisigDeployed,amount);

                await MultisigDeployed.transfer(amount,otherAccount.address,token)
                

                await expect(MultisigDeployed.connect(invalidSigner).approveTx(1)).to.be.revertedWith("not a valid signer");
          })

        });

        describe("Update Quorum", async function() {

          it("Should create an UpdateQuorum Successfully", async function(){
             const { MultisigDeployed, owner } =
                    await loadFixture(deployMultisig);

              const newQuorum = 3;

              await MultisigDeployed.updateQuorum(newQuorum);

              const txCount = await MultisigDeployed.txCount();
              expect(txCount).equal(1);

              const tx = await MultisigDeployed.transactions(1);
              expect(tx.trxType).to.equal(1);

              expect(tx.newQuorum).to.equal(newQuorum);
          });
        });

        describe("Approve New Quorum", async function(){
          

          it("Should Approve New UpdateQuorum", async function () {
            const { MultisigDeployed, owner , otherAccount} =
                    await loadFixture(deployMultisig);

              const newQuorum = 3;

              await MultisigDeployed.updateQuorum(newQuorum);
              
              await MultisigDeployed.connect(otherAccount).approveNewQuorum(1);

              const tx = await MultisigDeployed.transactions(1);
              expect(tx.noOfApproval).equal(2);
              expect(tx.isCompleted).to.be.true;

              const updateQuorum = await MultisigDeployed.quorum();
              expect(updateQuorum).to.equal(newQuorum);


          } );
        });
    
  });

});