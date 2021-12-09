const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", () => {
  let adminAddress;
  let secondaryAddress;
  let NFTMarketplaceFactory;
  let NFTMarketplace;
  let NFTFactory;
  let NFT;

  let tokenID = 1;

  it("Should successfully deploy marketplace contract to the local blockchain", async () => {
    NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    NFTMarketplace = await NFTMarketplaceFactory.deploy();
    await NFTMarketplace.deployed();
    const [owner, addr1] = await ethers.getSigners();
    adminAddress = owner;
    secondaryAddress = addr1;

    expect(NFTMarketplace).to.not.be.null;
  });

  it("Should successfully deploy NFT contract to the local blockchain", async () => {
    NFTFactory = await ethers.getContractFactory("NFT");
    NFT = await NFTFactory.deploy(NFTMarketplace.address, 5, "Test NFT", "TST");
    await NFT.deployed();

    expect(NFT).to.not.be.null;
  });

  it("Should successfully mint a test NFT", async () => {
    const mintTx = await NFT.createNFT("Test");
    await mintTx.wait();

    expect(tokenID).to.equal(1);
  });

  it("Should successfully create a new listing", async () => {
    await expect(
      NFTMarketplace.createMarketListing(
        tokenID,
        ethers.utils.parseEther("1"),
        NFT.address,
        {
          value: ethers.utils.parseEther("0.025"),
        }
      )
    ).to.emit(NFTMarketplace, "MarketItemListed");
  });

  it("Should successfully cancel a listing", async () => {
    await expect(NFTMarketplace.cancelMarketListing(tokenID)).to.emit(
      NFTMarketplace,
      "MarketItemCanceled"
    );
  });

  it("Should successfully relist again", async () => {
    expect(
      await NFTMarketplace.createMarketListing(
        tokenID,
        ethers.utils.parseEther("1"),
        NFT.address,
        {
          value: ethers.utils.parseEther("0.025"),
        }
      )
    ).to.emit(NFTMarketplace, "MarketItemListed");
  });
  it("Should successfully return all listings", async () => {
    expect(await NFTMarketplace.getAllListedItems()).to.be.an("array");
  });
  it("Should successfully complete a listing", async () => {
    await expect(
      NFTMarketplace.connect(secondaryAddress).completeMarketListing(tokenID, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.emit(NFTMarketplace, "MarketItemSold");
  });
});
