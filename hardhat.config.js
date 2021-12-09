const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("NFT", "Deploys the NFT Contracts", async (taskArgs, hre) => {
  const deployNFTContracts = require("./scripts/deploy");
  await deployNFTContracts();
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ropsten: {
      url: "https://ropsten.infura.io/v3/de353b7a62b84dce96f296644f1268fd",
      accounts: [
        "2ee5d72fa3ad990573b2e152f891b8cbc9fa571b6fb5011d025f4798123bf268",
      ],
    },
  },
};
