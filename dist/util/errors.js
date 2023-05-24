"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFabricCAError = exports.FabricCAError = exports.handleError = exports.NoValidResponsePeerError = exports.UnauthorizedAccessBallot = exports.FunctionNotExist = exports.AssetNotExist = exports.NeedAdminPrivilegeError = exports.getRetryAction = exports.ContractError = exports.isErrorLike = exports.isDuplicateTransactionError = exports.RetryAction = void 0;
const fabric_network_1 = require("fabric-network");
// import { logger } from "./logger";
var RetryAction;
(function (RetryAction) {
    RetryAction[RetryAction["WithExistingTransactionId"] = 0] = "WithExistingTransactionId";
    RetryAction[RetryAction["WithNewTransactionId"] = 1] = "WithNewTransactionId";
    RetryAction[RetryAction["None"] = 2] = "None";
})(RetryAction = exports.RetryAction || (exports.RetryAction = {}));
const isDuplicateTransactionError = (err) => {
    var _a;
    if (err === undefined || err === null)
        return false;
    let isDuplicate;
    if (typeof err.transactionCode === "string") {
        isDuplicate =
            err.transactionCode === "DUPLICATE_TXID";
    }
    else {
        const endorsementError = err;
        isDuplicate = (_a = endorsementError === null || endorsementError === void 0 ? void 0 : endorsementError.errors) === null || _a === void 0 ? void 0 : _a.some((err) => {
            var _a;
            return (_a = err === null || err === void 0 ? void 0 : err.endorsements) === null || _a === void 0 ? void 0 : _a.some((endorsement) => { var _a; return (_a = endorsement === null || endorsement === void 0 ? void 0 : endorsement.details) === null || _a === void 0 ? void 0 : _a.startsWith("duplicate transaction found"); });
        });
    }
    return isDuplicate === true;
};
exports.isDuplicateTransactionError = isDuplicateTransactionError;
const isErrorLike = (err) => {
    return (err != undefined &&
        err != null &&
        typeof err.name === "string" &&
        typeof err.message === "string" &&
        (err.stack === undefined ||
            typeof err.stack === "string"));
};
exports.isErrorLike = isErrorLike;
class ContractError extends Error {
    constructor(msg, txid, status) {
        super(msg);
        Object.setPrototypeOf(this, ContractError.prototype);
        this.name = "TransactionErrors";
        this.txid = txid;
        this.status = status;
    }
}
exports.ContractError = ContractError;
const getRetryAction = (err) => {
    if ((0, exports.isDuplicateTransactionError)(err) || err instanceof ContractError) {
        return RetryAction.None;
    }
    else if (err instanceof fabric_network_1.TimeoutError) {
        return RetryAction.WithExistingTransactionId;
    }
    return RetryAction.WithNewTransactionId;
};
exports.getRetryAction = getRetryAction;
const matchNeedAdminPrivilege = (msg) => {
    const messageMatch = msg.match(/Need Admin \w*/g);
    if (messageMatch !== null) {
        return messageMatch[0];
    }
    return null;
};
class NeedAdminPrivilegeError extends ContractError {
    constructor(msg, txid, status) {
        super(msg, txid, status);
        Object.setPrototypeOf(this, NeedAdminPrivilegeError.prototype);
        this.name = "NeedAdminPrivilegeError";
    }
}
exports.NeedAdminPrivilegeError = NeedAdminPrivilegeError;
const MatchAssetNotExist = (msg) => {
    const messageMatch = msg.match(/([tT]he )?[aA]sset \w* does not exist/g);
    if (messageMatch !== null) {
        return messageMatch[0];
    }
    return null;
};
class AssetNotExist extends ContractError {
    constructor(msg, txid, status) {
        super(msg, txid, status);
        Object.setPrototypeOf(this, AssetNotExist.prototype);
        this.name = "AssetNotExist";
    }
}
exports.AssetNotExist = AssetNotExist;
const MatchFunctionNotExist = (msg) => {
    const messageMatch = msg.match(/You've asked to invoke a function that does not exist: \w*/g);
    if (messageMatch !== null) {
        return messageMatch[0];
    }
    return null;
};
class FunctionNotExist extends ContractError {
    constructor(msg, txid, status) {
        super(msg, txid, status);
        Object.setPrototypeOf(this, FunctionNotExist.prototype);
        this.name = "FunctionNotExist";
    }
}
exports.FunctionNotExist = FunctionNotExist;
const MatchUnauthorizedAccessBallot = (msg) => {
    const messageMatch = msg.match(/You dont have access to read Ballot \w*/g);
    if (messageMatch !== null) {
        return messageMatch[0];
    }
    return null;
};
class UnauthorizedAccessBallot extends ContractError {
    constructor(msg, txid, status) {
        super(msg, txid, status);
        Object.setPrototypeOf(this, UnauthorizedAccessBallot.prototype);
        this.name = "UnauthorizedAccessBallot";
    }
}
exports.UnauthorizedAccessBallot = UnauthorizedAccessBallot;
const MatchNoValidResponsePeer = (msg) => {
    const msgremovline = msg.replace(/(\r\n|\n|\r)/gm, "");
    const messageMatch = msgremovline.match(/(No valid responses from any peers.*)/g);
    if (messageMatch !== null) {
        const errMsg = messageMatch[0].match(/(message=)(.*)/)[2];
        return errMsg;
    }
    return null;
};
class NoValidResponsePeerError extends ContractError {
    constructor(msg, txid, status) {
        super(msg, txid, status);
        Object.setPrototypeOf(this, NoValidResponsePeerError.prototype);
        this.name = "NoValidResponsePeerError";
    }
}
exports.NoValidResponsePeerError = NoValidResponsePeerError;
function handleError(txid, err) {
    if ((0, exports.isErrorLike)(err)) {
        const needAdminMatch = matchNeedAdminPrivilege(err.message);
        if (matchNeedAdminPrivilege(err.message) !== null) {
            return new NeedAdminPrivilegeError(needAdminMatch, txid, 403);
        }
        const matchAssetNotExist = MatchAssetNotExist(err.message);
        if (matchAssetNotExist !== null) {
            return new AssetNotExist(matchAssetNotExist, txid, 404);
        }
        const matchFunctionNotExist = MatchFunctionNotExist(err.message);
        if (matchAssetNotExist !== null) {
            return new FunctionNotExist(matchFunctionNotExist, txid, 404);
        }
        const matchUnauthorizedAccessBallot = MatchUnauthorizedAccessBallot(err.message);
        if (matchUnauthorizedAccessBallot !== null) {
            return new UnauthorizedAccessBallot(matchUnauthorizedAccessBallot, txid, 403);
        }
        const matchNoValidResponsePeer = MatchNoValidResponsePeer(err.message);
        if (matchNoValidResponsePeer !== null) {
            return new NoValidResponsePeerError(matchNoValidResponsePeer, txid, 400);
        }
    }
    return err;
}
exports.handleError = handleError;
class FabricCAError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, FabricCAError.prototype);
        this.name = "FabricCAError";
        this.status = 401;
    }
}
exports.FabricCAError = FabricCAError;
function handleFabricCAError(err) {
    if ((0, exports.isErrorLike)(err)) {
        return new FabricCAError(err.message);
    }
    return err;
}
exports.handleFabricCAError = handleFabricCAError;
//# sourceMappingURL=errors.js.map