// MultisigModule#Multisig - 0x5FbDB2315678afecb367f032d93F642f64180aa3

import { ethers } from "hardhat";


async function main(){
    const web3CXITokenAddress = "";
    const web3CXI = await ethers.getContractAt("IERC20", web3CXITokenAddress);


    const multisigContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const multisig = await ethers.getContractAt("Multisig",multisigContractAddress)

    

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
   });