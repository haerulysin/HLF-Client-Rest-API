"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWallet = void 0;
const fabric_network_1 = require("fabric-network");
const buildWallet = async (walletPath) => {
    let wallet;
    if (walletPath) {
        // fs.rmSync(walletPath, { recursive: true, force: true });
        wallet = await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    }
    else {
        wallet = await fabric_network_1.Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }
    return wallet;
};
exports.buildWallet = buildWallet;
//# sourceMappingURL=helper.js.map