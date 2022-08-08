import { ethers } from "hardhat";
import { expect } from "chai";
import { NFT } from "../typechain-types";

let mkt;
let nft: NFT;
let ft;

before(async () => {
  const initSupply = ethers.utils.parseEther("1000000").toString(); // 1000000 sol

  const FT = await ethers.getContractFactory("FT");
  ft = await FT.deploy(initSupply);
  await ft.deployed();

  const MKT = await ethers.getContractFactory("MKT");
  mkt = await MKT.deploy(ft.address);
  await mkt.deployed();

  const NFT = await ethers.getContractFactory("NFT");
  nft = await NFT.deploy(mkt.address);
  await nft.deployed();
});

describe("NFT", function () {
  it("should initialize NFT correctly", async function () {
    const _contractAddress = await nft.getNFTMarketAddress();
    expect(_contractAddress).to.not.equal(
      0x0,
      "NFT doesn't have NFTMarket contractAddress instance correctly initialized!"
    );
  });
});
