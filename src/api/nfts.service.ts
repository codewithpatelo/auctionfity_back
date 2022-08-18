import { ethers } from "ethers";

import axios from "axios";

import moment from "moment";

import FT from "../../artifacts/contracts/FT.sol/FT.json";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import MKT from "../../artifacts/contracts/MKT.sol/MKT.json";

import { ftaddress, nftaddress, nftmarketaddress } from "../../config";
import {
  bidDto,
  bidsQueriesDto,
  listingDto,
  listingQueriesDto,
  listings,
  nftDto,
  signatureDto,
  signatureQueriesDto,
  signatures,
} from "./nfts.dtos";
import {
  auctionOperationDto,
  signOperation,
  verifyMessage,
} from "../utils/utils";

const environment = process.env.ENVIRONMENT;

let nftOwnerAddr: string | number = 0; // Address or index
let bidderAddr: string | number = 1; // Address or index

let network = "";
let providerUrl = "";


if (environment == "STAG" && process.env.GI_API_KEY) {
  network = "goerli";
  providerUrl = `https://eth-goerli.g.alchemy.com/v2/${process.env.GI_API_KEY}`;
} else {
  network = "localhost";
  providerUrl = "http://127.0.0.1:8545";
}

if (
  environment == "STAG" &&
  process.env.BIDDER_ADDR &&
  process.env.NFTOWNER_ADDR
) {
  nftOwnerAddr = process.env.NFTOWNER_ADDR;
  bidderAddr = process.env.BIDDER_ADDR;
}

const provider =
  network == "goerli"
    ? new ethers.providers.AlchemyProvider(network="goerli", process.env.GI_API_KEY)
    : new ethers.providers.JsonRpcProvider(providerUrl);


const nftOwnerSigner = (environment == 'STAG' && process.env.NFTOWNER_PRIVATE_KEY) ? new ethers.Wallet(process.env.NFTOWNER_PRIVATE_KEY, provider): provider.getSigner(nftOwnerAddr); //  - Signer who owns NFT
const bidderSigner = (environment == 'STAG' && process.env.BIDDER_PRIVATE_KEY) ? new ethers.Wallet(process.env.BIDDER_PRIVATE_KEY, provider): provider.getSigner(bidderAddr); // - Signer who owns Auction Tokens

export async function fetchAccounts(): Promise<auctionOperationDto> {
  try {
    return {
      OPERATION: "SUCCESS",
      TYPE: "FETCHACCOUNTS",
      ENV: environment,
      ISONCHAIN: false,
      NETWORK: network,
      RESULT: {
        nftOwner: await nftOwnerSigner.getAddress(),
        bidder: await bidderSigner.getAddress(),
      },
      SIGNER: "root",
      MESSAGE: `Accounts requested by root user at ${moment()}.`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "FETCHACCOUNTS",
      ENV: environment,
      ISONCHAIN: false,
      NETWORK: network,
      RESULT: err,
      SIGNER: "root",
      MESSAGE: `Fetch Operation failed at ${moment()}`,
    } as auctionOperationDto;
  }
}

export async function mintNft(tokenUri?: string): Promise<auctionOperationDto> {
  const signerAddr = await nftOwnerSigner.getAddress();
  try {
    const nftContract = new ethers.Contract(
      nftaddress,
      NFT.abi,
      nftOwnerSigner
    );
    const mintedToken = await nftContract.mintToken(tokenUri);

    const mintTx = await mintedToken.wait();

    const mintEvent = mintTx.events[0];

    const tokenValue = mintEvent.args[2];

    const tokenId = tokenValue.toNumber();

    return {
      OPERATION: "SUCCESS",
      TYPE: "MINTNFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: {tokenId: tokenId, tx: mintTx},
      CONTRACT: "NFT",
      CONTRACTADDR: nftaddress,
      SIGNER: signerAddr,
      MESSAGE: `NFT id #${tokenId} minted by ${signerAddr} at ${moment()}. Details: ${JSON.stringify(
        mintEvent
      )}`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "MINTNFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "NFT",
      CONTRACTADDR: nftaddress,
      SIGNER: signerAddr,
      MESSAGE: `Mint Operation failed at ${moment()}`,
    } as auctionOperationDto;
  }
}

export async function initAuctionHouse(): Promise<auctionOperationDto> {
  try {
    // We start by minting two different NFTs
    const nft1 = await mintNft(
      "https://bafkreiaf7bagtnxfrspddvls2yoppac6qr432ki5hqwvsp7exgomxlaft4.ipfs.nftstorage.link"
    );

    const sig1 = ""; //await nftOwnerSigner.signTransaction(nft1.RESULT.tx);

    const nft2 = await mintNft(
      "https://bafkreid7sghswyrd43vp56rzslhhfrjdxdp6m7oxaf7hmeojnsc5ajyctq.ipfs.nftstorage.link"
    );

    const sig2 = ""; //await nftOwnerSigner.signTransaction(nft2.RESULT.tx);

    if (nft1.OPERATION == "SUCCESS" && nft2.OPERATION == "SUCCESS") {
      return {
        OPERATION: "SUCCESS",
        TYPE: "INIT",
        ENV: environment,
        ISONCHAIN: true,
        NETWORK: network,
        RESULT: [nft1.RESULT, nft2.RESULT],
        CONTRACT: "NFT",
        CONTRACTADDR: nftaddress,
        SIGNER: await nftOwnerSigner.getAddress(),
        SIGNATURE: [sig1, sig2],
        MESSAGE: `NFT ids #${nft1.RESULT}, #${
          nft2.RESULT
        } minted by ${await nftOwnerSigner.getAddress()} at ${moment()}.`,
      } as auctionOperationDto;
    } else {
      throw `Auction House initilization failed. Couldn't mint the requested NFTs. NFTs jobs: #1= ${nft1.OPERATION} #2= ${nft2.OPERATION}`;
    }
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "INIT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: [],
      CONTRACT: "NFT",
      CONTRACTADDR: nftaddress,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: err,
    } as auctionOperationDto;
  }
}

export async function approveNftsToMarket(tokens: Array<nftDto>) {
  try {
    for (const token of tokens) {
      const result = await approveNftToMarket(token);
      if (result.OPERATION == "FAILED") {
        throw `There was a problem approving NFT id #${token.tokenId}: ${result.RESULT}`;
      }
    }

    return {
      OPERATION: "SUCCESS",
      TYPE: "APPROVENFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: (await fetchApprovedNfts()).RESULT,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: `All minted NFTs were approved by ${await nftOwnerSigner.getAddress()} at ${moment()} to operate at NFT Marketplace (${nftmarketaddress})`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "APPROVENFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: `Could not approve all minted NFTs.`,
    } as auctionOperationDto;
  }

  //  return fetchNFTsFunc();
}

export async function approveNftToMarket(
  nft: nftDto
): Promise<auctionOperationDto> {
  try {
    // Owner of the NFT approves all NFT’s to the Marketplace
    const tokenIdValue = nft.tokenId;

    const mktContract = new ethers.Contract(
      nftmarketaddress,
      MKT.abi,
      nftOwnerSigner
    );

    const priceValue = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const marketItemApproved = await mktContract.makeMarketItem(
      nftaddress,
      tokenIdValue,
      priceValue
    );

    await marketItemApproved.wait();

    return {
      OPERATION: "SUCCESS",
      TYPE: "APPROVENFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: marketItemApproved,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: `Nft id #${tokenIdValue} was approved by ${await nftOwnerSigner.getAddress()} at ${moment()} to operate at NFT Marketplace (${nftmarketaddress})`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "APPROVENFT",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: `The request to approve Nft by ${await nftOwnerSigner.getAddress()} to operate at NFT Marketplace (${nftmarketaddress}) could not be fulfilled.`,
    } as auctionOperationDto;
  }
}

export async function approveTokenToMarket(
  quantity: number
): Promise<auctionOperationDto> {
  // Bidder approves ERC20 tokens to Marketplace

  try {
    const ftContract = new ethers.Contract(ftaddress, FT.abi, bidderSigner);

    const ap = await ftContract
      .connect(bidderSigner)
      .approve(nftmarketaddress, quantity);

    await ap.wait();

    return {
      OPERATION: "SUCCESS",
      TYPE: "APPROVETOKEN",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: {
        tx: ap,
        balance: await ftContract
          .connect(bidderSigner)
          .balanceOf(await bidderSigner.getAddress()),
      },
      CONTRACT: "FT",
      CONTRACTADDR: ftaddress,
      SIGNER: await bidderSigner.getAddress(),
      MESSAGE: `${quantity} of Auction Tokens were approved by ${await bidderSigner.getAddress()} at ${moment()} to operate at NFT Marketplace (${nftmarketaddress})`,
    } as auctionOperationDto;
  } catch (err) {
    return {
      OPERATION: "FAILED",
      TYPE: "APPROVETOKEN",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "FT",
      CONTRACTADDR: ftaddress,
      SIGNER: await bidderSigner.getAddress(),
      MESSAGE: `Couldn't complete transaction.`,
    } as auctionOperationDto;
  }
}

export async function listNft(
  tokenId: number,
  minPrice: number
): Promise<auctionOperationDto> {
  // Owner of the NFT signs to create an off-chain auction listing with a minimum price
  try {
    const signer = await nftOwnerSigner.getAddress();
    let id = 0;
    if (listings.length !== 0) {
      id = listings[listings.length - 1].listingId + 1;
    }
    const listedNft = {
      listingId: id,
      tokenId,
      minPrice,
      owner: signer,
      bestBid: minPrice,
      bids: [] as Array<bidDto>,
      createdAt: new Date(),
    } as listingDto;

    const signature = await signOperation(
      JSON.stringify(listedNft),
      nftOwnerSigner
    );
    const signatureData = {
      signature,
      signer,
      operation: "LISTNFT",
      createdAt: new Date(),
    } as signatureDto;

    signatures.push(signatureData);
    listings.push(listedNft);

    return {
      OPERATION: "SUCCESS",
      TYPE: "LISTNFT",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: listings,
      SIGNATURE: signature,
      SIGNER: signer,
      MESSAGE: `You (${signer}) just signed at ${moment()} to list NFT id #${tokenId} for set minimum price of ${minPrice} at sillibing offchain AuctionHouse. You will be able to start receiving bid offers for that NFT from now. Please save the above signature in a safe place for further operations.`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "LISTNFT",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: err,
      SIGNER: await nftOwnerSigner.getAddress(),
      MESSAGE: `Listing of NFT couldn't be completed.`,
    } as auctionOperationDto;
  }
}

export async function fetchListings(
  q?: listingQueriesDto
): Promise<auctionOperationDto> {
  try {
    let result: Array<listingDto> | listingDto | undefined;

    if (q) {
      if (q.startTime && q.endTime) {
        // SEARCH BY CREATION DATE

        const start = new Date(q.startTime);
        const end = new Date(q.endTime);
        result =
          listings.find(
            (listing) => start < listing.createdAt && listing.createdAt < end
          ) ?? [];
      } else if (q.owner) {
        // SEARCH BY OWNER
        result = listings.find((listing) => listing.owner == q.owner) ?? [];
      } else if (q.tokenId) {
        // SEARCH BY TOKEN ID
        result =
          listings.find((listing) => listing.tokenId == Number(q.tokenId)) ??
          [];
      } else {
        result = listings;
      }
    } else {
      result = listings;
    }

    if (result) {
      return {
        OPERATION: "SUCCESS",
        TYPE: "FETCHLISTINGS",
        ENV: environment,
        ISONCHAIN: false,
        RESULT: result,
        MESSAGE: `Fetching listings succeded.`,
      } as auctionOperationDto;
    } else {
      throw "Could not process fetch request.";
    }
  } catch (err) {
    return {
      OPERATION: "FAILED",
      TYPE: "FETCHLISTINGS",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: err,
      MESSAGE: `Fetching listings failed.`,
    } as auctionOperationDto;
  }
}

export async function fetchSignatures(
  q?: signatureQueriesDto
): Promise<auctionOperationDto> {
  // ROOT ONLY

  try {
    let result: Array<signatureDto> | signatureDto | undefined;

    if (q) {
      if (q.startTime && q.endTime) {
        // SEARCH BY CREATION DATE

        const start = new Date(q.startTime);
        const end = new Date(q.endTime);
        result =
          signatures.find((s) => start < s.createdAt && s.createdAt < end) ??
          [];
      } else if (q.operation) {
        // SEARCH BY OPERATION
        result = signatures.find((s) => s.operation == q.operation) ?? [];
      } else if (q.signer) {
        // SEARCH BY SIGNER
        result = signatures.find((s) => s.signer == q.signer) ?? [];
      } else {
        result = signatures;
      }
    } else {
      result = signatures;
    }

    if (result) {
      return {
        OPERATION: "SUCCESS",
        TYPE: "FETCHSIGNATURES",
        ENV: environment,
        ISONCHAIN: false,
        RESULT: result,
        MESSAGE: `Fetching signatures succeded.`,
      } as auctionOperationDto;
    } else {
      throw "Could not process fetch request.";
    }
  } catch (err) {
    return {
      OPERATION: "FAILED",
      TYPE: "FETCHSIGNATURES",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: err,
      MESSAGE: `Fetching signatures failed.`,
    } as auctionOperationDto;
  }
}

export const getListing = (tokenId: number): listingDto | undefined => {
  return listings.find((l) => l.tokenId === tokenId);
};

export async function offerBid(
  price: number,
  tokenId: number
): Promise<auctionOperationDto> {
  //Bidder signs a bid for the auction
  try {
    const signer = await bidderSigner.getAddress();
    const listing = getListing(tokenId);
    if (listing == undefined) {
      throw "Invalid tokenId provided. Try with another one.";
    } else if (price == 0) {
      throw "Price should not be 0";
    } else if (price == listing["minPrice"]) {
      throw "Price cannot equal auction minimum price.";
    } else if (price < listing["minPrice"]) {
      throw "Price should be higher than nftOwner minimum price requested.";
    } else if (price == listing["bestBid"]) {
      throw "Price shouldn't be equal to the current best bid for this listed NFT.";
    } else if (price < listing["bestBid"]) {
      throw "Price should be higher than previous bids for this listed NFT.";
    }
    const newBid = {
      listingId: listing["listingId"],
      price,
      bidder: await bidderSigner.getAddress(),
      tokenId: tokenId,
      createdAt: new Date(),
    } as bidDto;

    if (listing !== undefined) {
      listing["bids"].push(newBid);
    }

    listing["bestBid"] = newBid["price"];

    // Bidder signs a bid for the auction
    const signature = await signOperation(String(newBid.price), bidderSigner);

    const signatureData = {
      signature,
      signer,
      operation: "OFFERBID",
      tokenId: tokenId,
      createdAt: new Date(),
    } as signatureDto;

    signatures.push(signatureData);

    listing["bids"][listing["bids"].length - 1]["isSigned"] = true;

    return {
      OPERATION: "SUCCESS",
      TYPE: "OFFERBID",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: getListing(tokenId),
      SIGNATURE: signature,
      SIGNER: await bidderSigner.getAddress(),
      MESSAGE: `You ${await bidderSigner.getAddress()} just signed a bid offer of ${price} for NFT id #${tokenId} at ${moment()}, please ensure you save this signature in a safe place. ${
        listing.owner
      } should accept and sign back this bid offer in order to complete transaction. Verified signer: ${await verifyMessage(
        String(newBid.price),
        signer,
        signature
      )}`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "OFFERBID",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: err,
      SIGNER: await bidderSigner.getAddress(),
      MESSAGE: `Bid offer could not be fulfilled nor signed.`,
    } as auctionOperationDto;
  }
}

export async function fetchBids(
  q: bidsQueriesDto
): Promise<auctionOperationDto> {
  try {
    let result: Array<bidDto> | bidDto | undefined;

    const listing = getListing(q.tokenId);

    let bids = [] as Array<bidDto>;

    if (listing) {
      bids = listing["bids"];
    }

    if (q) {
      if (q.startTime && q.endTime) {
        // SEARCH BY CREATION DATE

        const start = new Date(q.startTime);
        const end = new Date(q.endTime);
        result =
          bids.find((b) => start < b.createdAt && b.createdAt < end) ?? [];
      } else if (q.bidder) {
        // SEARCH BY BIDDER
        result = bids.find((b) => b.bidder == q.bidder) ?? [];
      } else {
        result = bids;
      }
    } else {
      result = bids;
    }

    if (result) {
      return {
        OPERATION: "SUCCESS",
        TYPE: "FETCHBIDS",
        ENV: environment,
        ISONCHAIN: false,
        RESULT: result,
        MESSAGE: `Fetching bids succeded.`,
      } as auctionOperationDto;
    } else {
      throw "Could not process fetch request.";
    }
  } catch (err) {
    return {
      OPERATION: "FAILED",
      TYPE: "FETCHBIDS",
      ENV: environment,
      ISONCHAIN: false,
      RESULT: err,
      MESSAGE: `Fetching bids failed.`,
    } as auctionOperationDto;
  }
}

export async function acceptBid(tokenId: number): Promise<auctionOperationDto> {
  const signer = await nftOwnerSigner.getAddress();

  // NFT Owner approval of bid
  const listing = getListing(tokenId);
  if (!listing) {
    throw "Invalid token id";
  }
  const bid = listing["bestBid"];

  const signature = await signOperation(String(bid), nftOwnerSigner);
  const signatureData = {
    signature,
    signer,
    operation: "ACCEPTBID",
    tokenId: tokenId,
    createdAt: new Date(),
  } as signatureDto;

  listing["bids"][listing["bids"].length - 1]["isSignedBack"] = true;

  signatures.push(signatureData);

  return {
    OPERATION: "SUCCESS",
    TYPE: "ACCEPTBID",
    ENV: environment,
    ISONCHAIN: false,
    RESULT: getListing(tokenId),
    SIGNATURE: signature,
    SIGNER: signer,
    MESSAGE: `You ${signer} just signed back bid operation please ensure you save this signature in a safe place since you will need it to settle transaction. Verified signer: ${await verifyMessage(
      String(bid),
      signer,
      signature
    )}`,
  } as auctionOperationDto;
}

export async function fetchApprovedNfts(): Promise<auctionOperationDto> {
  try {
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      MKT.abi,
      provider
    );
    const data = await marketContract.fetchMarketTokens();

    const items = await Promise.all(
      data.map(async (i: nftDto) => {
        const tokenUri = await nftContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
        const item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    return {
      OPERATION: "SUCCESS",
      TYPE: "FETCHAPPROVEDNFTS",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: items,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      MESSAGE: "Fetch approved nfts succeded.",
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "FETCHAPPROVEDNFTS",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      MESSAGE: `Couldn't fetch approved NFTs.`,
    } as auctionOperationDto;
  }
}

export async function settleTransaction(
  tokenId: number,
  bidderSignature: ethers.Signature,
  nftOwnerSignature: ethers.Signature
): Promise<auctionOperationDto> {
  try {
    const bidderSignerAddr = await bidderSigner.getAddress();
    const nftOwnerSignerAddr = await nftOwnerSigner.getAddress();

    const l = getListing(tokenId);
    if (!l) {
      throw "Invalid tokenId (or otherwise there is not a listing for that token Id).";
    }
    const bid = String(l["bestBid"]);

    if (
      (await verifyMessage(bid, bidderSignerAddr, bidderSignature)) == false
    ) {
      throw `Invalid bidder signature. Cannot settle transaction. Details: Message: ${bid}, Bidder Address: ${bidderSignerAddr}, Signature: ${JSON.stringify(
        bidderSignature
      )}  Result: ${JSON.stringify(
        await verifyMessage(bid, bidderSignerAddr, bidderSignature)
      )} Actual Signer ${ethers.utils.verifyMessage(bid, bidderSignature)}`;
    }

    if (
      (await verifyMessage(bid, nftOwnerSignerAddr, nftOwnerSignature)) == false
    ) {
      throw "Invalid owner signature. Cannot settle transaction.";
    }

    const tx = await createMarketSale(Number(bid), tokenId);

    if (tx.error) {
      throw tx;
    }

    return {
      OPERATION: "SUCCESS",
      TYPE: "SETTLETRANSACTION",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: tx,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER:
        (await nftOwnerSigner.getAddress()) +
        "," +
        (await bidderSigner.getAddress()),
      MESSAGE: `${nftOwnerSignerAddr} has sold NFT #${tokenId} for ${bid} Auction tokens from ${bidderSignerAddr} who now owns this NFT (${moment()}).`,
    } as auctionOperationDto;
  } catch (err) {
    console.log(err);
    return {
      OPERATION: "FAILED",
      TYPE: "SETTLETRANSACTION",
      ENV: environment,
      ISONCHAIN: true,
      NETWORK: network,
      RESULT: err,
      CONTRACT: "MKT",
      CONTRACTADDR: nftmarketaddress,
      SIGNER:
        (await nftOwnerSigner.getAddress()) +
        "," +
        (await bidderSigner.getAddress()),
      MESSAGE: `There was a problem with this transaction. Make sure you count with both signatures to settle the transaction, check that the token is approved at the marketplace and has an off-chain listing attached to its id. You also need to make sure that bidder account has approved Auction tokens and has sufficient funds and allowance to complete the transaction.`,
    } as auctionOperationDto;
  }
}

export async function createMarketSale(bid: number, tokenId: number) {
  try {
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      MKT.abi,
      nftOwnerSigner
    );

    const price = ethers.utils.parseUnits(bid.toString(), "ether");

    //TODO: Handle this logic within MKT Contract
  
    const ftContract = new ethers.Contract(ftaddress, FT.abi, bidderSigner);
    const ap = await ftContract.connect(bidderSigner).transfer(nftmarketaddress, price);
    await ap.wait(); 
 

    const transaction = await marketContract.createMarketSale(
      nftaddress,
      Number(tokenId),
      {
        value: price,
      }
    );

    const tx = await transaction.wait();

    return tx;
  } catch (err) {
    console.log(err);
    return err;
  }
}
