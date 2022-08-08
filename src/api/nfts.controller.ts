import { Handler } from "../utils/utils";
import {
  bidsQueriesDto,
  listingQueriesDto,
  signatureQueriesDto,
} from "./nfts.dtos";
import {
  acceptBid,
  approveNftsToMarket,
  approveNftToMarket,
  approveTokenToMarket,
  createMarketSale,
  fetchAccounts,
  fetchApprovedNfts,
  fetchBids,
  fetchListings,
  fetchSignatures,
  initAuctionHouse,
  listNft,
  mintNft,
  offerBid,
  settleTransaction,
} from "./nfts.service";

export const fetchAccountsCtrl: Handler = async (req, res) => {
  try {
    const result = await fetchAccounts();

    if (result.OPERATION == "FAILED") {
      res.status(404).send(result);
    } else {
      res.status(201).send(result);
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const mintNftCtrl: Handler = async (req, res) => {
  try {
    const { tokenUri } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify tokenUri";
    } else if (!tokenUri) {
      throw "No tokenUri specified. You should specify tokenUri";
    } else {
      const result = await mintNft(tokenUri);

      if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const initCtrl: Handler = async (req, res) => {
  try {
    const result = await initAuctionHouse();

    if (!result) {
      res.status(500).send("Error proccesing request.");
    } else if (result.OPERATION == "FAILED") {
      res.status(404).send(result);
    } else {
      res.status(201).send(result);
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const approveNftsCtrl: Handler = async (req, res) => {
  try {
    const { nfts } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify nfts.";
    } else if (!nfts) {
      throw "No nfts specified. You should send an array of nfts.";
    } else if (nfts.length == 0) {
      throw "No nfts specified. You should send an array with at least one nft.";
    } else {
      let result;

      if (nfts.length == 1) {
        result = await approveNftToMarket(nfts[0]);
      } else {
        result = await approveNftsToMarket(nfts);
      }

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const fetchApprovedNftsCtrl: Handler = async (req, res) => {
  const result = await fetchApprovedNfts();

  if (!result) {
    res.status(500).send("Error proccesing request.");
  } else if (result.OPERATION == "FAILED") {
    res.status(404).send(result);
  } else {
    res.status(200).send(result);
  }
};

export const approveTokenCtrl: Handler = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify the token quantity you approve to operate.";
    } else if (!quantity) {
      throw "You should specify the token quantity you approve to operate.";
    } else {
      const result = await approveTokenToMarket(quantity);

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const listNftCtrl: Handler = async (req, res) => {
  try {
    const { nft, minPrice } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify an NFT to list for offchain auctions.";
    } else if (!nft) {
      throw "You should specify an NFT to list for offchain auctions.";
    } else {
      const result = await listNft(nft.tokenId, minPrice);

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const fetchListingsCtrl: Handler = async (req, res) => {
  const { startTime, endTime, tokenId, owner } = req.query;

  const queries = {
    startTime: startTime,
    endTime: endTime,
    tokenId: tokenId,
    owner: owner,
  } as listingQueriesDto;

  const result = await fetchListings(queries);

  if (!result) {
    res.status(500).send("Error proccesing request.");
  } else if (result.OPERATION == "FAILED") {
    res.status(404).send(result);
  } else {
    res.status(200).send(result);
  }
};

export const fetchSignaturesCtrl: Handler = async (req, res) => {
  const { startTime, endTime, signer, operation } = req.query;

  const queries = {
    startTime: startTime,
    endTime: endTime,
    signer,
    operation,
  } as signatureQueriesDto;

  const result = await fetchSignatures(queries);

  if (!result) {
    res.status(500).send("Error proccesing request.");
  } else if (result.OPERATION == "FAILED") {
    res.status(404).send(result);
  } else {
    res.status(200).send(result);
  }
};

export const fetchBidsCtrl: Handler = async (req, res) => {
  const { startTime, endTime, bidder, tokenId } = req.query;

  if (!tokenId) {
    throw "No tokenId provided.";
  }

  const queries = {
    startTime: startTime,
    endTime: endTime,
    bidder,
    tokenId: Number(tokenId),
  } as bidsQueriesDto;

  const result = await fetchBids(queries);

  if (!result) {
    res.status(500).send("Error proccesing request.");
  } else if (result.OPERATION == "FAILED") {
    res.status(404).send(result);
  } else {
    res.status(200).send(result);
  }
};

export const offerBidCtrl: Handler = async (req, res) => {
  try {
    const { price, tokenId } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify nfts.";
    } else if (!price) {
      throw "No price for the bid offer was specified. Please specify one.";
    } else if (!tokenId) {
      throw "No tokenId was specified. Please specify for which NFT would you like to make a bid offer.";
    } else {
      const result = await offerBid(price, tokenId);

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const acceptBidCtrl: Handler = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (req.body === {}) {
      throw "Body request is empty. You should specify nfts.";
    } else if (!tokenId) {
      throw "No tokenId was specified. Please specify for which NFT would you like to make a bid offer.";
    } else {
      const result = await acceptBid(tokenId);

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const settleTransactionCtrl: Handler = async (req, res) => {
  try {
    const { tokenId, bidderSignature, nftOwnerSignature } = req.body;
    if (req.body === {}) {
      throw "Body request is empty. You must send tokenId, bidderSignature and nftOwnerSignature data";
    } else if (!tokenId || !bidderSignature || !nftOwnerSignature) {
      throw "You must send tokenId, bidderSignature and nftOwnerSignature data";
    } else {
      const result = await settleTransaction(
        tokenId,
        bidderSignature,
        nftOwnerSignature
      );

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

export const settleTransactionNoVerifyCtrl: Handler = async (req, res) => {
  try {
    const { tokenId, bid } = req.body;
    if (req.body === {}) {
      throw "Body request is empty. You must send tokenId, and bid number.";
    } else if (!tokenId || !bid) {
      throw "You must send tokenId, and bid number.";
    } else {
      const result = await createMarketSale(bid, tokenId);

      if (!result) {
        res.status(500).send("Error proccesing request.");
      } else if (result.OPERATION == "FAILED") {
        res.status(404).send(result);
      } else {
        res.status(201).send(result);
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};
