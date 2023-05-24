import { Wallet } from 'fabric-network';
declare const buildWallet: (walletPath: string) => Promise<Wallet>;
export { buildWallet };
