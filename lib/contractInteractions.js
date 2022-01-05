import { BigNumber, ethers } from "ethers";
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

const FetchAllNFTs = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalMarketItemsBigNum =
    await NFTMarketplaceContract.getTotalMarketItems();
  const totalMarketItems = ethers.BigNumber.from(
    totalMarketItemsBigNum
  ).toNumber();

  const totalCollections = await getTotalCollections();

  const Collections = [];
  if (totalCollections == 0) return [];
  for (let i = 1; i <= totalCollections; i++) {
    const Collection = await NFTMarketplaceContract.idToCollection(i);
    Collections.push(Collection);
  }

  if (totalMarketItems == 0) return [];
  const MarketItems = [];
  for (let i = 1; i <= totalMarketItems; i++) {
    const MarketItem = await NFTMarketplaceContract.idToMarketItem(i);
    const MarketItemCollection = Collections.filter(
      (i) => MarketItem.nftContract == i.collectionAddress
    );

    const toPush = { ...MarketItem, name: MarketItemCollection[0].name };
    MarketItems.push(toPush);
  }

  return MarketItems;
};

const mintNFTOfCollection = async (tokenURI, collectionID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const transaction = await NFTMarketplaceContract.createNFTOfCollection(
    collectionID,
    tokenURI
  );
  const tx = await transaction.wait();
  return true;
};

const getTotalCollections = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );
  const totalCollectionsBigNum =
    await NFTMarketplaceContract.getTotalCollections();
  const totalCollections = ethers.BigNumber.from(
    totalCollectionsBigNum
  ).toNumber();

  return totalCollections;
};

const fetchCollectionsOfCurrentUser = async (addr) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalCollections = getTotalCollections();

  if (totalCollections == 0) return [];
  const userCollections = [];
  for (let i = 1; i <= totalCollections; i++) {
    const collection = await NFTMarketplaceContract.idToCollection(i);
    if (collection.owner == addr) {
      userCollections.push(collection);
    }
  }

  return userCollections;
};

const fetchMarketItemsOfCurrentUser = async (addr) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalMarketItemsBigNum =
    await NFTMarketplaceContract.getTotalMarketItems();
  const totalMarketItems = ethers.BigNumber.from(
    totalMarketItemsBigNum
  ).toNumber();

  if (totalMarketItems == 0) return [];
  const MarketItems = [];
  for (let i = 1; i <= totalMarketItems; i++) {
    const MarketItem = await NFTMarketplaceContract.idToMarketItem(i);
    if (MarketItem.owner == addr) {
      MarketItems.push(MarketItem);
    }
  }

  return MarketItems;
};

module.exports = {
  GetTokenByID,
  CreateNewCollection,
  fetchCollectionsOfCurrentUser,
  mintNFTOfCollection,
  fetchMarketItemsOfCurrentUser,
  FetchAllNFTs,
};
