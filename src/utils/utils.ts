import { Request, Response, RequestHandler as Middleware } from "express";
import { ethers } from "ethers";

type Method =
  | "get"
  | "head"
  | "post"
  | "put"
  | "delete"
  | "connect"
  | "options"
  | "trace"
  | "patch";

export type Handler = (req: Request, res: Response) => object;

export type Route = {
  method: Method;
  path: string;
  middleware: Middleware[];
  handler: Handler;
};

export async function hashMessage(message: string) {
  const messageHash = ethers.utils.id(message);

  return ethers.utils.arrayify(messageHash);
}

export async function signOperation(
  message: string,
  signer: ethers.Wallet | ethers.providers.JsonRpcSigner 
): Promise<ethers.Signature> {
  const messageHashBytes = await hashMessage(message);

  const flatSig = await signer.signMessage(messageHashBytes);

  const sig = ethers.utils.splitSignature(flatSig);
  return sig;
}

export async function verifyMessage(
  message: string,
  addr: string,
  signature: ethers.Signature
) {
  try {
    const signerAddr = ethers.utils.verifyMessage(
      await hashMessage(message),
      signature
    );
    if (signerAddr !== addr) {
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
  }
}

export type auctionOperationDto = {
  OPERATION: auctionOperationNameEnum;
  TYPE: auctionOperationTypeEnum;
  ENV?: environmentEnum;
  NETWORK?: networkEnum;
  ISONCHAIN: boolean;
  RESULT: string | object | Array<object> | Array<string>;
  CONTRACT?: smartContractEnum;
  CONTRACTADDR?: string;
  SIGNATURE?: ethers.Signature | Array<ethers.Signature> | Array<string>;
  SIGNER: string;
  MESSAGE: string;
};

export enum environmentEnum {
  DEV = "DEV",
  STAG = "STAG",
  PROD = "PROD"
}

export enum networkEnum {
  localhost = "localhost",
  goerli = "goerli",
  ropsten = "ropsten"
}

export enum smartContractEnum {
  NFT = "NFT",
  MKT = "MKT",
  FT = "FT",
}

export enum auctionOperationNameEnum {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum auctionOperationTypeEnum {
  FETCHACCOUNTS = "FETCHACCOUNTS",
  INIT = "INIT",
  MINTNFT = "MINTNFT",
  APPROVENFT = "APPROVENFT",
  FETCHAPPROVEDNFTS = "FETCHAPPROVEDNFTS",
  LISTNFT = "LISTNFT",
  APPROVETOKEN = "APPROVETOKEN",
  FETCHLISTINGS = "FETCHLISTINGS",
  FETCHSIGNATURES = "FETCHSIGNATURES",
  OFFERBID = "OFFERBID",
  FETCHBIDS = "FETCHBIDS",
  ACCEPTBID = "ACCEPTBID",
  SETTLETRANSACTION = "SETTLETRANSACTION",
}
