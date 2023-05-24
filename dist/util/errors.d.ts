export declare enum RetryAction {
    WithExistingTransactionId = 0,
    WithNewTransactionId = 1,
    None = 2
}
export declare const isDuplicateTransactionError: (err: unknown) => boolean;
export declare const isErrorLike: (err: unknown) => err is Error;
export declare class ContractError extends Error {
    txid: string;
    status: number;
    constructor(msg: string, txid: string, status: number);
}
export declare const getRetryAction: (err: unknown) => RetryAction;
export declare class NeedAdminPrivilegeError extends ContractError {
    constructor(msg: string, txid: string, status: number);
}
export declare class AssetNotExist extends ContractError {
    constructor(msg: string, txid: string, status: number);
}
export declare class FunctionNotExist extends ContractError {
    constructor(msg: string, txid: string, status: number);
}
export declare class UnauthorizedAccessBallot extends ContractError {
    constructor(msg: string, txid: string, status: number);
}
export declare class NoValidResponsePeerError extends ContractError {
    constructor(msg: string, txid: string, status: number);
}
export declare function handleError(txid: string, err: unknown): Error | unknown;
export declare class FabricCAError extends Error {
    status: number;
    constructor(msg: string);
}
export declare function handleFabricCAError(err: unknown): Error | unknown;
