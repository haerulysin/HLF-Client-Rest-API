import {
  Wallet,
  Contract,
  Wallets,
  Gateway,
  GatewayOptions,
  DefaultEventHandlerStrategies,
  DefaultQueryHandlerStrategies,
  Network,
  Transaction,

} from "fabric-network";
import * as config from "./util/config.js";
import * as fproto from '@hyperledger/fabric-protos';
import { createHash } from "crypto";
import { handleError } from "./util/errors.js";
import ccp from './connection/ccp.json' assert {type: 'json'}
import { X509 } from 'jsrsasign';
import { decodeBlock, decodeProcessedTransaction } from "./util/qscc.helper.js";



export const getWallet = async (): Promise<Wallet> => {
  const wallet = await Wallets.newFileSystemWallet('./connection/_wallet');
  return wallet;
}

export async function getCertCN(uid: string): Promise<any> {
  const wallet: Wallet = await getWallet();
  // const cert = (await wallet.get(uid) as any).credentials.certificate;
  const identity: any = await wallet.get(uid);
  const cert = identity.credentials.certificate;
  const c = new X509();
  c.readCertPEM(cert);
  const subject = c.getSubject();
  const CN = subject.str.match(/CN(.*)/gm)[0].split('=')[1];
  return CN;
}

export const createWallet = async (
  publicCertPem: string,
  privKey: string
): Promise<{ uid: string; wallet: Wallet }> => {
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

  const wallet = await Wallets.newFileSystemWallet('./connection/_wallet');
  const uid = createHash("sha256")
    .update(JSON.stringify(identity))
    .digest("hex");
  await wallet.put(uid, identity);
  return { uid, wallet };
};

export const createGateway = async (
  wallet: any | Wallet,
  identity: string
): Promise<Gateway> => {
  const gateway = new Gateway();
  const gatewayOpts: GatewayOptions = {
    wallet,
    identity,
    discovery: { enabled: false, asLocalhost: true },
    eventHandlerOptions: {
      commitTimeout: 300,
      endorseTimeout: 30,
      strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ANYFORTX,
    },
    queryHandlerOptions: {
      timeout: 3,
      strategy: DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
    },
  };

  await gateway.connect(ccp, gatewayOpts);

  return gateway;
};

export const getNetwork = async (gateway: Gateway): Promise<Network> => {
  return await gateway.getNetwork(config.channelName);
};

export const GetContract = async (
  network: Network
): Promise<{ assetContract: Contract; qsccContract: Contract }> => {
  const assetContract = network.getContract(config.chaincodeName);
  const qsccContract = network.getContract("qscc");
  return { assetContract, qsccContract };
};

export async function evaluateTransaction(
  contract: Contract,
  transactionName: string,
  ...transactionArgs: string[]
): Promise<Buffer> {
  const transaction = contract.createTransaction(transactionName);
  const txid = transaction.getTransactionId();
  try {
    return await transaction.evaluate(...transactionArgs);
  } catch (err) {
    throw handleError(txid, err);
  }
}

export async function submitTransaction(
  transaction: Transaction,
  ...transactionArgs: string[]
): Promise<any> {
  const txid = transaction.getTransactionId();
  try {
    const payload = await transaction.submit(...transactionArgs);
    return payload;
  } catch (err) {
    throw handleError(txid, err);
  }
}

export const getTransactionValidationCode = async (
  qsccContract: Contract,
  txid: string
): Promise<number> => {
  const data = await evaluateTransaction(
    qsccContract,
    "GetTransactionByID",
    config.channelName,
    txid
  );

  const processedTx = fproto.peer.ProcessedTransaction.deserializeBinary(data);
  return processedTx.getValidationcode();
};

export const getBlockHeight = async (
  qscc: Contract
): Promise<number> => {
  const data = await qscc.evaluateTransaction(
    "GetChainInfo",
    config.channelName
  );
  const info = fproto.common.BlockchainInfo.deserializeBinary(data);
  return info.getHeight();
};


export const getAllBlock = async (qscc: Contract): Promise<object[]> => {
  try {
    let blockList: any[] = [];
    const blockHeight: number = await getBlockHeight(qscc) as number;
    for (let blockNumber = 0; blockNumber < blockHeight; blockNumber++) {
      const blockRaw = await qscc.evaluateTransaction("GetBlockByNumber", config.channelName, blockNumber.toString());
      const data = fproto.common.Block.deserializeBinary(blockRaw);
      const decodedBlock = decodeBlock(data);
      blockList.push(decodedBlock);
    }
    return blockList.reverse();
  } catch (e) {
    throw handleError("0", e);
  }
}

export const getBlock = async (qscc: Contract, paramType: string, blockArgs: string): Promise<object> => {
  let qsccFn: string = '';
  switch (paramType) {
    case 'number': qsccFn = 'GetBlockByNumber'; break;
    case 'hash': qsccFn = 'GetBlockByHash'; break;
    case 'txid': qsccFn = 'GetBlockByTxID'; break;
    default: qsccFn = 'GetBlockByNumber'; break;
  }
  try {
    const blockraw = await qscc.evaluateTransaction(qsccFn, config.channelName, blockArgs);
    const data = fproto.common.Block.deserializeBinary(blockraw);
    return decodeBlock(data);
  } catch (e) {
    throw handleError("0", e);
  }
}

export const getTransactionById = async (qscc: Contract, txid: string): Promise<object> => {
  try {
    const txRaw = await qscc.evaluateTransaction('GetTransactionByID', config.channelName, txid);
    const decodedTx = decodeProcessedTransaction(txRaw);
    const blockraw = await qscc.evaluateTransaction('GetBlockByTxID', config.channelName, txid);
    const decodedBlock = decodeBlock(fproto.common.Block.deserializeBinary(blockraw));
    return {
      txData: decodedTx,
      blockData: decodedBlock
    }
  }catch(e){
    throw handleError("0", e);
  }
}


export const countElectionVote = async (contract: Contract, electionID: string): Promise<number> => {

  const queryGetBallot = { selector: { docType: 'Ballot', isCasted: true, electionID: electionID } };
  const dataBallot = await evaluateTransaction(
    contract,
    "FindAsset",
    JSON.stringify(queryGetBallot)
  );
  const ballotlength = JSON.parse(dataBallot.toString()).length;

  return ballotlength;
}