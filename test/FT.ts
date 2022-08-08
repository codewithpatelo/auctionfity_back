import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FT } from "../typechain-types";

let ft: FT;
let accounts;
let bidder: SignerWithAddress;
let nftOwner: SignerWithAddress;
const initSupply = "1000000000000000000000000"; // 10 million SOL

before(async () => {
  accounts = await ethers.getSigners();
  bidder = accounts[0];
  nftOwner = accounts[1];

  const FT = await ethers.getContractFactory("FT");
  ft = await FT.deploy(initSupply);
  await ft.deployed();
});

describe("FT", function () {
  it("should set the total supply and it should allocate initial supply to owner upon deployment", async function () {
    const totalSupply = await ft.totalSupply();
    expect(totalSupply).to.equal(
      initSupply,
      "doesn't have correct total supply!"
    ); // 1000000
    const balance = await ft.balanceOf(bidder.address);
    expect(balance).to.equal(
      initSupply,
      "doesn't allocate correct initial supply to owner!"
    ); // 1000000
  });

  it("it should transfer tokens from bidder to nftOwner", async function () {
    await expect(
      ft.connect(bidder).transfer(nftOwner.address, "1000000000000000000000001") // 1000001
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    await ft
      .connect(bidder)
      .transfer(nftOwner.address, "100000000000000000000"); // 100
    let balance = await ft.balanceOf(nftOwner.address);
    expect(balance).to.equal(
      "100000000000000000000",
      "testAccount credit didn't happen after transfer!"
    ); // 100
    balance = await ft.balanceOf(bidder.address);
    expect(balance).to.equal(
      "999900000000000000000000",
      "owner debit didn't happen after transfer!"
    ); // 999900 (100 gone)
  });
});
