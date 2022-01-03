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
    await expect(NFTMarketplace.cancelMarketListing(tokenID, 1)).to.emit(
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
      NFTMarketplace.connect(secondaryAddress).completeMarketListing(
        tokenID,
        1,
        {
          value: ethers.utils.parseEther("1"),
        }
      )
    ).to.emit(NFTMarketplace, "MarketItemSold");
  });

  it("Should fail to list if the marketplace fee is not covered", async () => {
    await expect(
      NFTMarketplace.connect(secondaryAddress).createMarketListing(
        1,
        1,
        NFT.address
      )
    ).to.be.revertedWith("Marketplace Fee not covered, please try again");
  });

  it("Should fail to list if price is less than 1 WEI", async () => {
    await expect(
      NFTMarketplace.connect(secondaryAddress).createMarketListing(
        1,
        0,
        NFT.address
      )
    ).to.be.revertedWith("Price must be atleast 1 WEI");
  });

  it("Should successfully create a new NFT collection", async () => {
    await expect(
      NFTMarketplace.createNewCollection("Test", "Test description", 10)
    ).to.emit(NFTMarketplace, "CollectionCreated");
  });

  it("Should successfully update description on an NFT Collection", async () => {
    await expect(
      NFTMarketplace.updateCollectionDescription(1, "New Description")
    ).to.emit(NFTMarketplace, "CollectionDescriptionUpdated");
  });

  it("Should fail to update description on non-existant collection", async () => {
    await expect(
      NFTMarketplace.updateCollectionDescription(2, "ABCDEF")
    ).to.be.revertedWith("Collection not found");
  });

  it("Should successfully create a NFT of a collection", async () => {
    await expect(
      NFTMarketplace.createNFTOfCollection(1, "test token uri")
    ).to.emit(NFTMarketplace, "CollectionNFTMinted");
  });

  it("Should fail to mint if collection is non-existant", async () => {
    await expect(
      NFTMarketplace.createNFTOfCollection(2, "test token uri")
    ).to.be.revertedWith("Collection not found");
  });

  it("Should successfully place a bid on an nft", async () => {
    await expect(
      NFTMarketplace.bidOnMarketListing(1, 1, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.emit(NFTMarketplace, "MarketItemBidOn");
  });

  it("Should fail to place a bid on an nft if value sent is less than offer", async () => {
    await expect(
      NFTMarketplace.bidOnMarketListing(1, 1, {
        value: ethers.utils.parseEther("0.9"),
      })
    ).to.be.revertedWith("Value sent does not match offer");
  });

  it("Should fail to accept bid if the caller is not the seller", async () => {
    await expect(
      NFTMarketplace.connect(secondaryAddress).acceptMarketBid(1)
    ).to.be.revertedWith("Only seller can accept this market bid");
  });

  it("Should successfully relist the NFT", async () => {
    await expect(
      NFTMarketplace.connect(secondaryAddress).createMarketListing(
        1,
        ethers.utils.parseEther("1"),
        NFT.address,
        {
          value: ethers.utils.parseEther("0.025"),
        }
      )
    ).to.emit(NFTMarketplace, "MarketItemListed");
  });

  it("Should successfully accept the bid if is the item seller", async () => {
    await NFTMarketplace.connect(adminAddress).bidOnMarketListing(1, 1, {
      value: ethers.utils.parseEther("1"),
    });

    await expect(
      NFTMarketplace.connect(secondaryAddress).acceptMarketBid(1)
    ).to.emit(NFTMarketplace, "MarketItemSold");
  });
});
