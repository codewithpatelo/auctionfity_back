import {
  acceptBidCtrl,
  approveNftsCtrl,
  approveTokenCtrl,
  fetchAccountsCtrl,
  fetchApprovedNftsCtrl,
  fetchListingsCtrl,
  fetchSignaturesCtrl,
  initCtrl,
  listNftCtrl,
  mintNftCtrl,
  offerBidCtrl,
  settleTransactionCtrl,
  settleTransactionNoVerifyCtrl,
} from "./api/nfts.controller";
import { Route } from "./utils/utils";

const basePath = "/api";

export const routes: Route[] = [
  {
    method: "get",
    path: basePath + "/accounts",
    middleware: [],
    handler: fetchAccountsCtrl,
  },
  {
    method: "post",
    path: basePath + "/init",
    middleware: [],
    handler: initCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/mint",
    middleware: [],
    handler: mintNftCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/approve",
    middleware: [],
    handler: approveNftsCtrl,
  },
  {
    method: "get",
    path: basePath + "/nfts",
    middleware: [],
    handler: fetchApprovedNftsCtrl,
  },
  {
    method: "post",
    path: basePath + "/token/approve",
    middleware: [],
    handler: approveTokenCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/list",
    middleware: [],
    handler: listNftCtrl,
  },
  {
    method: "get",
    path: basePath + "/nfts/listings",
    middleware: [],
    handler: fetchListingsCtrl,
  },
  {
    method: "get",
    path: basePath + "/signatures",
    middleware: [],
    handler: fetchSignaturesCtrl,
  },
  {
    method: "get",
    path: basePath + "/nfts/listings/bids",
    middleware: [],
    handler: fetchListingsCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/listings/bid-offer",
    middleware: [],
    handler: offerBidCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/listings/bid-accept",
    middleware: [],
    handler: acceptBidCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/settle",
    middleware: [],
    handler: settleTransactionCtrl,
  },
  {
    method: "post",
    path: basePath + "/nfts/settle/noverify",
    middleware: [],
    handler: settleTransactionNoVerifyCtrl,
  },
];
