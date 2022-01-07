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
  const NFTContract = new ethers.Contract(
    MarketItem.nftContract,
    NFT.abi,
    signer
  );

  const tokenURI = await JSON.parse(
    await NFTContract.tokenURI(MarketItem.tokenID)
  );

  //   const NFTContract = new ethers.Contract(
  //     MarketItem.nftContract,
  //     NFT.abi,
  //     signer
  //   );
  // const tokenURI = await NFTContract.tokenURI(tokenID);

  return { ...MarketItem, ...collection, tokenURI };
};

const GetTokenByItemID = async (itemID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const MarketItem = await NFTMarketplaceContract.idToMarketItem(itemID);
  const collectionID = await NFTMarketplaceContract.marketItemIdToCollectionID(
    MarketItem.itemID
  );
  const collection = await NFTMarketplaceContract.idToCollection(collectionID);
  const NFTContract = new ethers.Contract(
    MarketItem.nftContract,
    NFT.abi,
    signer
  );

  const tokenURI = await JSON.parse(
    await NFTContract.tokenURI(MarketItem.tokenID)
  );

  //   const NFTContract = new ethers.Contract(
  //     MarketItem.nftContract,
  //     NFT.abi,
  //     signer
  //   );
  // const tokenURI = await NFTContract.tokenURI(tokenID);

  return { ...MarketItem, ...collection, tokenURI };
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

  const NFTContract = new ethers.Contract(nftContract, NFT.abi, signer);

  const approveTx = await NFTContract.approve(NFTMarketplaceAddress, tokenID);
  const approved = await approveTx.wait();

  const marketplaceFee = await ethers.BigNumber.from(
    await NFTMarketplaceContract.marketplaceFee()
  );
  let transaction = await NFTMarketplaceContract.createMarketListing(
    tokenID,
    price,
    nftContract,
    { value: marketplaceFee }
  );

  let tx = await transaction.wait();
  return true;
};

const CancelMarketListing = async (tokenID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalListings = await NFTMarketplaceContract.getListingIdsLength();
  let latestListing = "";

  for (let i = totalListings; i > 0; i--) {
    const listing = await NFTMarketplaceContract.idToListing(i);
    if (listing.tokenID == tokenID) {
      latestListing = i;
    }
  }

  const transaction = await NFTMarketplaceContract.cancelMarketListing(
    tokenID,
    latestListing
  );
  const tx = await transaction.wait();
  return true;
};

const CompleteMarketListing = async (tokenID, price) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalListings = await NFTMarketplaceContract.getListingIdsLength();
  let latestListing = "";

  for (let i = totalListings; i > 0; i--) {
    const listing = await NFTMarketplaceContract.idToListing(i);
    if (listing.tokenID == tokenID) {
      latestListing = i;
    }
  }

  const gasPrice = await signer.getGasPrice();

  const transaction = await NFTMarketplaceContract.completeMarketListing(
    tokenID,
    latestListing,
    { value: price, gasPrice: gasPrice }
  );
  const tx = await transaction.wait();
  return true;
};

const BidOnMarketListing = async (tokenID, offer) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const gasPrice = await signer.getGasPrice();
  const priceInETH = ethers.utils.parseEther(
    ethers.BigNumber.from(offer).toString()
  );
  const transaction = await NFTMarketplaceContract.bidOnMarketListing(
    tokenID,
    offer,
    {
      value: priceInETH,
      gasPrice: gasPrice,
    }
  );
  const tx = await transaction.wait();
  return true;
};

const AcceptMarketBid = async (tokenID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const transaction = await NFTMarketplaceContract.acceptMarketBid(tokenID);
  const tx = await transaction.wait();
  return true;
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
    if (ethers.BigNumber.from(MarketItem.price).toNumber() == 0) {
      continue;
    }
    const MarketItemCollection = Collections.filter(
      (i) => MarketItem.nftContract == i.collectionAddress
    );

    const NFTContract = new ethers.Contract(
      MarketItem.nftContract,
      NFT.abi,
      signer
    );

    const tokenURI = await JSON.parse(
      await NFTContract.tokenURI(MarketItem.tokenID)
    );

    const toPush = {
      ...MarketItem,
      name: MarketItemCollection[0].name,
      collectionID: MarketItemCollection[0].collectionID,
      tokenURI,
    };
    MarketItems.push(toPush);
  }

  return MarketItems;
};

const FetchAllNFTsOfAddress = async (addr) => {
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
    if (MarketItem.owner != addr) {
      continue;
    }
    const MarketItemCollection = Collections.filter(
      (i) => MarketItem.nftContract == i.collectionAddress
    );

    const NFTContract = new ethers.Contract(
      MarketItem.nftContract,
      NFT.abi,
      signer
    );

    const tokenURI = await JSON.parse(
      await NFTContract.tokenURI(MarketItem.tokenID)
    );

    const toPush = {
      ...MarketItem,
      name: MarketItemCollection[0].name,
      collectionID: MarketItemCollection[0].collectionID,
      tokenURI,
    };
    MarketItems.push(toPush);
  }

  return MarketItems;
};

const FetchListedNFTsOfAddress = async (addr) => {
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
    if (MarketItem.seller != addr) {
      continue;
    }
    const MarketItemCollection = Collections.filter(
      (i) => MarketItem.nftContract == i.collectionAddress
    );

    const NFTContract = new ethers.Contract(
      MarketItem.nftContract,
      NFT.abi,
      signer
    );

    const tokenURI = await JSON.parse(
      await NFTContract.tokenURI(MarketItem.tokenID)
    );

    const toPush = {
      ...MarketItem,
      name: MarketItemCollection[0].name,
      collectionID: MarketItemCollection[0].collectionID,
      tokenURI,
    };
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

  const totalCollections = await getTotalCollections();

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

const getAllCollections = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalCollections = await getTotalCollections();

  if (totalCollections == 0) return [];
  const userCollections = [];
  for (let i = 1; i <= totalCollections; i++) {
    const collection = await NFTMarketplaceContract.idToCollection(i);

    userCollections.push(collection);
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

const FetchMarketItemHighestBid = async (tokenID) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const HighestBidID = await NFTMarketplaceContract.tokenIdToHighestBid(
    tokenID
  );
  const HighestBid = await NFTMarketplaceContract.idToBid(HighestBidID);
  return HighestBid;
};

const getLastBidIdOfAddress = async (addr) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );
};

const CancelBid = async (addr) => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const NFTMarketplaceContract = new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplace.abi,
    signer
  );

  const totalBids = await NFTMarketplaceContract.getTotalBids();
  let Bid = "";
  for (let i = totalBids; i >= 0; i--) {
    const bidToCheck = await NFTMarketplaceContract.idToBid(i);
    if (bidToCheck.buyer == addr) {
      Bid = i;
      break;
    }
  }

  const transaction = await NFTMarketplaceContract.cancelBid(Bid);
  const tx = await transaction.wait();

  return true;
};

module.exports = {
  GetTokenByID,
  CreateNewCollection,
  fetchCollectionsOfCurrentUser,
  mintNFTOfCollection,
  fetchMarketItemsOfCurrentUser,
  FetchAllNFTs,
  getAllCollections,
  CreateMarketListing,
  GetTokenByItemID,
  FetchAllNFTsOfAddress,
  FetchListedNFTsOfAddress,
  CancelMarketListing,
  CompleteMarketListing,
  BidOnMarketListing,
  FetchMarketItemHighestBid,
  AcceptMarketBid,
  CancelBid,
};
