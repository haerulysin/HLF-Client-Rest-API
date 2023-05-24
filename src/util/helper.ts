import {Wallet, Wallets} from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

const buildWallet = async (walletPath: string): Promise<Wallet> => {
    let wallet: Wallet;
    if (walletPath) {
        // fs.rmSync(walletPath, { recursive: true, force: true });
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    } else {
        wallet = await Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }

    return wallet;
};




export {
    buildWallet
}