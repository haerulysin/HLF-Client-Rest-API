/// <reference types="node" />
import { Wallet, Contract, Gateway, Network, Transaction } from "fabric-network";
export declare const createWallet: (publicCertPem: string, privKey: string) => Promise<{
    uid: string;
    wallet: Wallet;
}>;
export declare const createGateway: (wallet: any | Wallet, identity: string) => Promise<Gateway>;
export declare const getNetwork: (gateway: Gateway) => Promise<Network>;
export declare const GetContract: (network: Network) => Promise<{
    assetContract: Contract;
    qsccContract: Contract;
}>;
export declare function evaluateTransaction(contract: Contract, transactionName: string, ...transactionArgs: string[]): Promise<Buffer>;
export declare function submitTransaction(transaction: Transaction, ...transactionArgs: string[]): Promise<any>;
export declare const getTransactionValidationCode: (qsccContract: Contract, txid: string) => Promise<string>;
export declare const getBlockHeight: (qscc: Contract) => Promise<number | Long.Long>;
