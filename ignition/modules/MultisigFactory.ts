import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultisigFactoryModule = buildModule("MultisigFactoryModule", (m) => {

    // Deploy the MultisigFactory contract
    const multisigFactory = m.contract("MultisigFactory");

    return { multisigFactory };
});

export default MultisigFactoryModule;