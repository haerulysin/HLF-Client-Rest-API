"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockHeight = exports.getTransactionValidationCode = exports.submitTransaction = exports.evaluateTransaction = exports.GetContract = exports.getNetwork = exports.createGateway = exports.createWallet = void 0;
const fabric_network_1 = require("fabric-network");
const config = __importStar(require("./util/config"));
const protos = __importStar(require("fabric-protos"));
const crypto_1 = require("crypto");
const errors_1 = require("./util/errors");
const createWallet = async (publicCertPem, privKey) => {
    const certificate = Buffer.from(publicCertPem, "base64").toString("ascii");
    const privateKey = Buffer.from(privKey, "base64").toString("ascii");
    const identity = {
        credentials: {
            certificate,
            privateKey,
        },
        type: "X.509",
        mspId: "SampleOrg",
    };
    const wallet = await fabric_network_1.Wallets.newInMemoryWallet();
    const uid = (0, crypto_1.createHash)("sha256")
        .update(JSON.stringify(identity))
        .digest("hex");
    await wallet.put(uid, identity);
    return { uid, wallet };
};
exports.createWallet = createWallet;
const createGateway = async (wallet, identity) => {
    const ccp = require("./connection/ccp.json");
    const gateway = new fabric_network_1.Gateway();
    const gatewayOpts = {
        wallet,
        identity,
        discovery: { enabled: false, asLocalhost: true },
        eventHandlerOptions: {
            commitTimeout: 300,
            endorseTimeout: 30,
            strategy: fabric_network_1.DefaultEventHandlerStrategies.MSPID_SCOPE_ANYFORTX,
        },
        queryHandlerOptions: {
            timeout: 3,
            strategy: fabric_network_1.DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
        },
    };
    await gateway.connect(ccp, gatewayOpts);
    return gateway;
};
exports.createGateway = createGateway;
const getNetwork = async (gateway) => {
    return await gateway.getNetwork(config.channelName);
};
exports.getNetwork = getNetwork;
const GetContract = async (network) => {
    const assetContract = network.getContract(config.chaincodeName);
    const qsccContract = network.getContract("qscc");
    return { assetContract, qsccContract };
};
exports.GetContract = GetContract;
async function evaluateTransaction(contract, transactionName, ...transactionArgs) {
    const transaction = contract.createTransaction(transactionName);
    const txid = transaction.getTransactionId();
    try {
        return await transaction.evaluate(...transactionArgs);
    }
    catch (err) {
        throw (0, errors_1.handleError)(txid, err);
    }
}
exports.evaluateTransaction = evaluateTransaction;
async function submitTransaction(transaction, ...transactionArgs) {
    const txid = transaction.getTransactionId();
    try {
        const payload = await transaction.submit(...transactionArgs);
        return payload;
    }
    catch (err) {
        throw (0, errors_1.handleError)(txid, err);
    }
}
exports.submitTransaction = submitTransaction;
const getTransactionValidationCode = async (qsccContract, txid) => {
    const data = await evaluateTransaction(qsccContract, "GetTransactionByID", config.channelName, txid);
    const processedTx = protos.protos.ProcessedTransaction.decode(data);
    return protos.protos.TxValidationCode[processedTx.validationCode];
};
exports.getTransactionValidationCode = getTransactionValidationCode;
const getBlockHeight = async (qscc) => {
    const data = await qscc.evaluateTransaction("GetChainInfo", config.channelName);
    const info = protos.common.BlockchainInfo.decode(data);
    return info.height;
};
exports.getBlockHeight = getBlockHeight;
//# sourceMappingURL=fabric.js.map