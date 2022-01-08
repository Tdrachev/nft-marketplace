# Limechain NFT Marketplace project

This project demonstrates the integration between smart contracts and a front end using metamask wallet, giving the ability for the users to create NFT Collections, mint nft's of collections, Bid and sell NFTs and also lookup other user's NFT's by their address.

To setup the project on a local dev environment you need to run these commands:

```shell
yarn
npx hardhat compile
npx hardhat node
npx hardhat NFT --network localhost
copy the address in the log to the config.js file (usually the first time you wont need to change anything)
yarn dev
```

Then you can open localhost:3000 to view the project, connect your metamask wallet and interact with the different functionalities of the project
