// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Multisig.sol";

contract MultisigFactory {

    Multisig[] multisigClones;

    event MultisigWalletCreated(address indexed walletAddress, uint256 totalWallets);


    function createMultisigWallet(uint8 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_) {

        newMulsig_ = new Multisig(_quorum, _validSigners);

        multisigClones.push(newMulsig_);

        length_ = multisigClones.length;

        emit MultisigWalletCreated(address(newMulsig_), length_);
    }

    function getMultiSigClones() external view returns(Multisig[] memory) {
        return multisigClones;
    }
}