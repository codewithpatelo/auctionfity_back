import { ethers } from "ethers";
import { auctionOperationTypeEnum } from "../utils/utils";

//Stores in memory
export const listings: listingDto[] = [];
export const signatures: signatureDto[] = [];

export type nftDto = {
  tokenId: number;
  tokenUri: string;
  price: number;
  seller: string;
  owner: string;
};

export type listingDto = {
  listingId: number;
  tokenId: number;
  minPrice: number;
  bestBid: number;
  owner: string;
  bids: Array<bidDto>;
  createdAt: Date;
  updatedAt?: Date;
};

export type listingQueriesDto = {
  startTime?: string;
  endTime?: string;
  owner?: string;
  tokenId?: string;
};

export type bidDto = {
  listingId: number;
  tokenId: number;
  price: number;
  bidder: string;
  isSigned?: boolean;
  isSignedBack?: boolean;
  createdAt: Date;
};

export type bidsQueriesDto = {
  startTime?: string;
  endTime?: string;
  bidder?: string;
  tokenId: number;
};

export type signatureDto = {
  signature: ethers.Signature;
  signer: string;
  tokenId?: number;
  createdAt: Date;
  operation?: auctionOperationTypeEnum;
};

export type signatureQueriesDto = {
  startTime?: string;
  endTime?: string;
  signer?: string;
  operation?: string;
};
