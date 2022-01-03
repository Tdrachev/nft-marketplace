import { ethers } from "ethers";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Web3Modal from "web3modal";
const { NFTMarketplaceAddress } = require("../configs.json");
const NFTAddress = process.env.NFTAddress;

const GetTokenByID = async (tokenID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const Id = await NFTMarketplaceContract.tokenIdToId(tokenID);
  const MarketItem = await NFTMarketplaceContract.idToMarketItem(Id);
  const collectionID = await NFTMarketplaceContract.marketItemIdToCollectionID(
    MarketItem.itemID
  );
  const collection = await NFTMarketplaceContract.idToCollection(collectionID);

  //   const NFTContract = new ethers.Contract(
  //     MarketItem.nftContract,
  //     NFT.abi,
  //     signer
  //   );
  // const tokenURI = await NFTContract.tokenURI(tokenID);

  return { ...MarketItem, ...collection };
};

const CreateMarketListing = async (tokenID, price, nftContract) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const marketplaceFee = await NFTMarketplaceContract.marketplaceFee;
  let transaction = await NFTMarketplaceContract.createMarketListing(
    tokenID,
    price,
    nftContract,
    { value: marketplaceFee }
  );

  let tx = await transaction.wait();
};

const CreateNewCollection = async (name, description, totalSupply) => {
  console.log(name, description, totalSupply);
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const transaction = await NFTMarketplaceContract.createNewCollection(
    name,
    description,
    totalSupply
  );

  const tx = await transaction.wait();

  return true;
};

const FetchAllNFTs = async () => {};

module.exports = {
  GetTokenByID,
  CreateNewCollection,
};
