const hre = require("hardhat");

async function main() {
  const NFTMarketplaceFactory = await hre.ethers.getContractFactory(
    "NFTMarketplace"
  );
  const NFTMarketplace = await NFTMarketplaceFactory.deploy();

  await NFTMarketplace.deployed();
  console.log("NFTMarketplace deployed to:", NFTMarketplace.address);
}

module.exports = main;
