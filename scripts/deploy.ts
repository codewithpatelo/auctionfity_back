import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const FT = await ethers.getContractFactory("FT");
  const ft = await FT.deploy("1000000000000000000000000");
  await ft.deployed();
  console.log("FT deployed to:", ft.address);

  const NFTMarket = await ethers.getContractFactory("MKT");
  const nftMarket = await NFTMarket.deploy(ft.address);
  await nftMarket.deployed();
  console.log("auctionHouse deployed to: ", nftMarket.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("NFT contract deployed to: ", nftMarket.address);

  const config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const ftaddress = "${ft.address}"
  `;

  const data = JSON.stringify(config);
  fs.writeFileSync("config.ts", JSON.parse(data));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
