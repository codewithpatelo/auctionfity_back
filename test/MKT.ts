import { expect } from "chai";
import { ethers } from "ethers";

import {
  acceptBid,
  approveNftsToMarket,
  approveTokenToMarket,
  fetchAccounts,
  fetchBids,
  fetchListings,
  fetchSignatures,
  initAuctionHouse,
  listNft,
  mintNft,
  offerBid,
  settleTransaction,
} from "../src/api/nfts.service";

import {
  bidsQueriesDto,
  listingQueriesDto,
  nftDto,
  signatureQueriesDto,
} from "../src/api/nfts.dtos";
import { ftaddress, nftaddress, nftmarketaddress } from "../config";
import { auctionOperationTypeEnum } from "../src/utils/utils";

let nftOwnerAddr: string;
let bidderAddr: string;

before(async () => {
  const accounts = await fetchAccounts();
  nftOwnerAddr = accounts.RESULT["nftOwner"];
  bidderAddr = accounts.RESULT["bidder"];
});

describe("NFTMarket", function () {
  it("should mint an NFT correctly", async function () {
    const result = await mintNft(
      "https://bafkreid7sghswyrd43vp56rzslhhfrjdxdp6m7oxaf7hmeojnsc5ajyctq.ipfs.nftstorage.link"
    );

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("CONTRACTADDR");
    expect(result["CONTRACTADDR"]).to.equal(nftaddress);
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });
  it("should init AuctionHouse correctly", async function () {
    const result = await initAuctionHouse();

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("CONTRACTADDR");
    expect(result["CONTRACTADDR"]).to.equal(nftaddress);
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });
  it("Owner of the NFTs should approve all NFT's to the Marketplace", async function () {
    const result = await approveNftsToMarket([
      { tokenId: 1, price: 0.035 } as nftDto,
      { tokenId: 2, price: 0.035 } as nftDto,
    ]);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("CONTRACTADDR");
    expect(result["CONTRACTADDR"]).to.equal(nftmarketaddress);
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });
  it("Owner of the NFTs should be able to sign to create an off-chain auction listing with a minimum price", async function () {
    const result = await listNft(1, 50);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });

  it("should support an HTTP interface using express.js to fetch the live listings at any given time.", async function () {
    const result = await fetchListings({
      startTime: "2021-06-01",
      endTime: "2022-09-09",
    } as listingQueriesDto);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
  });

  it("Bidder should be able to approve ERC20 tokens to Marketplace.", async function () {
    const result = await approveTokenToMarket(1000000000000000);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("CONTRACTADDR");
    expect(result["CONTRACTADDR"]).to.equal(ftaddress);
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(bidderAddr);
  });

  it("Bidder should be able to sign a bid for the auction.", async function () {
    const result = await offerBid(80, 1);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(bidderAddr);
  });

  it("should support an HTTP interface using express.js to fetch the bids at any given time.", async function () {
    const result = await fetchBids({
      startTime: "2021-06-01",
      endTime: "2022-09-09",
      tokenId: 1,
    } as bidsQueriesDto);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
  });

  it("Nft Owner should be able to approve and sign back bid.", async function () {
    const result = await acceptBid(1);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });

  it("should support an HTTP interface using express.js to fetch the signatures at any given time.", async function () {
    const result = await fetchSignatures({
      startTime: "2021-06-01",
      endTime: "2022-09-09",
    } as signatureQueriesDto);

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
  });

  it.skip("Anyone with both signatures can settle the transaction, the owner takes the ERC20 whilst the bidder takes the NFT.", async function () {
    //TODO: Finish this UT and correct mocks
    const bidderSignature = await fetchSignatures({
      operation: auctionOperationTypeEnum.OFFERBID,
    });
    const nftOwnerSignature = await fetchSignatures({
      operation: auctionOperationTypeEnum.ACCEPTBID,
    });

    const result = await settleTransaction(
      1,
      bidderSignature.RESULT as ethers.Signature,
      nftOwnerSignature.RESULT as ethers.Signature
    );

    expect(result).not.to.be.undefined;
    expect(result).to.have.property("OPERATION");
    expect(result["OPERATION"]).to.equal("SUCCESS");
    expect(result).to.have.property("SIGNER");
    expect(result["SIGNER"]).to.equal(nftOwnerAddr);
  });
});
