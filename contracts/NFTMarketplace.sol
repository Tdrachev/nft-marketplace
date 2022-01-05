// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./NFT.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";

contract NFTMarketplace is ReentrancyGuard {
	using Counters for Counters.Counter;
	Counters.Counter private _itemID;
	Counters.Counter private _itemsSold;
	Counters.Counter private _collectionID;
	Counters.Counter private _listingID;
	Counters.Counter private _purchaseID;
	Counters.Counter private _bidId;

	struct MarketItem {
		uint256 itemID;
		uint256 tokenID;
		uint256 price;
		address nftContract;
		address payable seller;
		address payable owner;
		bool sold;
	}

	struct Purchase {
		uint256 tokenID;
		uint256 price;
		address seller;
		address buyer;
	}

	struct Listing {
		uint256 tokenID;
		uint256 price;
		address seller;
		bool canceled;
	}

	struct Collection {
		uint256 collectionID;
		uint256 fee;
		uint256 foorPrice;
		uint256 highestPrice;
		uint256 totalItems;
		uint256 totalItemsOwners;
		string name;
		string description;
		address payable owner;
		address collectionAddress;
	}

	struct Bid {
		address nftAddress;
		address buyer;
		uint256 tokenId;
		uint256 offer;
		bool accepted;
	}

	address payable marketplaceOwner;
	uint256 public marketplaceFee = 0.025 ether;

	uint256[] public Listings;
	uint256[] public Purchases;
	uint256[] public Bids;

	mapping(uint256 => uint256) public tokenIdToId;
	mapping(uint256 => MarketItem) public idToMarketItem;
	mapping(uint256 => Collection) public idToCollection;
	mapping(uint256 => uint256) public marketItemIdToCollectionID;
	mapping(uint256 => Purchase) public idToPurchase;
	mapping(uint256 => Listing) public idToListing;
	mapping(uint256 => Bid) public idToBid;
	mapping(uint256 => uint256) public tokenIdToHighestBid;

	event MarketItemListed(
		uint256 tokenID,
		uint256 price,
		address nftContract,
		address seller,
		address owner
	);

	event MarketItemSold(
		uint256 tokenID,
		uint256 price,
		address nftContract,
		address seller,
		address owner,
		bool sold
	);

	event MarketItemCanceled(
		uint256 tokenID,
		address nftContract,
		address seller,
		address owner
	);

	event MarketItemBidOn(
		uint256 tokenID,
		uint256 bid,
		address nftContract,
		address buyer
	);

	event CollectionCreated(
		uint256 collectionID,
		uint256 totalItems,
		uint256 fee,
		string name,
		string description,
		address owner,
		address collectionAddress
	);

	event CollectionDescriptionUpdated(
		uint256 collectionID,
		string name,
		string description,
		address collectionAddress
	);

	event CollectionNFTMinted(
		uint256 collectionID,
		uint256 tokenID,
		uint256 price,
		address owner,
		address collectionAddress
	);

	function createMarketListing(
		uint256 tokenID,
		uint256 price,
		address nftContract
	) public payable nonReentrant {
		require(price > 0, "Price must be atleast 1 WEI");
		require(
			msg.value == marketplaceFee,
			"Marketplace Fee not covered, please try again"
		);

		if (tokenIdToId[tokenID] == 0) {
			_itemID.increment();
		}

		if (idToListing[_listingID.current()].price == 0) {
			_listingID.increment();
		}

		uint256 newItemID = _itemID.current();
		uint256 newListingID = _listingID.current();

		IERC721(nftContract).transferFrom(msg.sender, address(this), tokenID);

		Listing memory newListing = Listing(tokenID, price, msg.sender, false);
		idToListing[newListingID] = newListing;
		Listings.push(newListingID);

		idToMarketItem[newItemID] = MarketItem(
			newItemID,
			tokenID,
			price,
			nftContract,
			payable(msg.sender),
			payable(address(0)),
			false
		);

		tokenIdToId[tokenID] = newItemID;

		emit MarketItemListed(
			tokenID,
			price,
			nftContract,
			msg.sender,
			address(0)
		);
	}

	function cancelMarketListing(uint256 tokenID, uint256 listingID)
		public
		payable
		nonReentrant
	{
		uint256 itemID = tokenIdToId[tokenID];
		MarketItem storage marketItemToCancel = idToMarketItem[itemID];
		address nftContract = marketItemToCancel.nftContract;

		require(
			marketItemToCancel.seller == msg.sender,
			"Only original seller can cancel"
		);

		marketItemToCancel.sold = false;
		marketItemToCancel.owner = payable(msg.sender);

		idToListing[listingID].canceled = true;

		idToMarketItem[itemID] = marketItemToCancel;

		IERC721(nftContract).safeTransferFrom(
			address(this),
			marketItemToCancel.seller,
			marketItemToCancel.tokenID
		);

		emit MarketItemCanceled(tokenID, nftContract, msg.sender, msg.sender);
	}

	function completeMarketListing(uint256 tokenID, uint256 listingID)
		public
		payable
		nonReentrant
	{
		uint256 itemID = tokenIdToId[tokenID];
		MarketItem storage toBeSold = idToMarketItem[itemID];

		require(
			msg.value == toBeSold.price,
			"The item you are trying to buy costs more than you are trying to send"
		);

		IERC721(toBeSold.nftContract).transferFrom(
			address(this),
			msg.sender,
			tokenID
		);

		marketplaceOwner.transfer(marketplaceFee);
		toBeSold.seller.transfer(msg.value);
		toBeSold.sold = true;
		toBeSold.seller = payable(msg.sender);
		toBeSold.owner = payable(msg.sender);

		idToListing[listingID].canceled = true;

		idToMarketItem[itemID] = toBeSold;
		_itemsSold.increment();
		emit MarketItemSold(
			tokenID,
			msg.value,
			toBeSold.nftContract,
			toBeSold.seller,
			msg.sender,
			true
		);
	}

	function getAllListedItems() public view returns (MarketItem[] memory) {
		uint256 totalListed = _itemID.current();
		uint256 totalNotSold = totalListed - _itemsSold.current();
		uint256 toBeReturnedIndex = 0;
		MarketItem[] memory toBeReturned = new MarketItem[](totalNotSold);

		for (uint256 i = 0; i < totalNotSold; i++) {
			if (idToMarketItem[i + 1].owner == payable(address(0))) {
				uint256 currentID = idToMarketItem[i + 1].itemID;
				MarketItem storage currentItem = idToMarketItem[currentID];
				toBeReturned[toBeReturnedIndex] = currentItem;
				toBeReturnedIndex++;
			}
		}

		return toBeReturned;
	}

	function getListingIdsLength() public view returns (uint256) {
		return Listings.length;
	}

	function getPurchaseIdsLength() public view returns (uint256) {
		return Purchases.length;
	}

	function createNewCollection(
		string calldata name,
		string calldata description,
		uint256 totalSupply
	) public payable nonReentrant {
		_collectionID.increment();

		uint256 newCollectionId = _collectionID.current();

		NFT newCollectionNFT = new NFT(
			address(this),
			totalSupply,
			name,
			description
		);

		idToCollection[newCollectionId] = Collection(
			newCollectionId,
			0,
			0,
			0,
			totalSupply,
			0,
			name,
			description,
			payable(msg.sender),
			address(newCollectionNFT)
		);

		emit CollectionCreated(
			newCollectionId,
			totalSupply,
			0,
			name,
			description,
			address(msg.sender),
			address(newCollectionNFT)
		);
	}

	function updateCollectionDescription(
		uint256 collectionID,
		string calldata newDescription
	) public payable nonReentrant {
		require(
			idToCollection[collectionID].totalItems != 0,
			"Collection not found"
		);

		idToCollection[collectionID].description = newDescription;

		emit CollectionDescriptionUpdated(
			collectionID,
			idToCollection[collectionID].name,
			newDescription,
			idToCollection[collectionID].collectionAddress
		);
	}

	function createNFTOfCollection(
		uint256 collectionID,
		string calldata tokenURI
	) public payable nonReentrant {
		require(
			idToCollection[collectionID].totalItems != 0,
			"Collection not found"
		);

		_itemID.increment();

		uint256 newItemID = _itemID.current();

		NFT collectionNFT = NFT(idToCollection[collectionID].collectionAddress);
		uint256 tokenID = collectionNFT.createNFTFromMarketplace(
			address(msg.sender),
			tokenURI
		);

		IERC721(collectionNFT).transferFrom(address(this), msg.sender, tokenID);

		tokenIdToId[tokenID] = newItemID;

		idToMarketItem[newItemID] = MarketItem(
			newItemID,
			tokenID,
			0,
			address(collectionNFT),
			payable(address(0)),
			payable(msg.sender),
			false
		);

		marketItemIdToCollectionID[newItemID] = collectionID;

		emit CollectionNFTMinted(
			collectionID,
			tokenID,
			0,
			address(msg.sender),
			address(collectionNFT)
		);
	}

	function bidOnMarketListing(uint256 tokenId, uint256 offer)
		public
		payable
		nonReentrant
	{
		uint256 valueInEth = offer * (1 ether);

		require(msg.value == valueInEth, "Value sent does not match offer");
		_bidId.increment();

		uint256 currentBidId = _bidId.current();
		uint256 itemId = tokenIdToId[tokenId];
		address nftAddress = idToMarketItem[itemId].nftContract;

		idToBid[currentBidId] = Bid(
			nftAddress,
			msg.sender,
			tokenId,
			offer,
			false
		);
		tokenIdToHighestBid[tokenId] = currentBidId;
		Bids.push(currentBidId);

		emit MarketItemBidOn(tokenId, offer, nftAddress, msg.sender);
	}

	function acceptMarketBid(uint256 tokenId) public payable nonReentrant {
		uint256 highestBidId = tokenIdToHighestBid[tokenId];
		Bid memory highestBid = idToBid[highestBidId];
		uint256 itemID = tokenIdToId[tokenId];
		MarketItem memory ToBeSold = idToMarketItem[itemID];

		uint256 bidValue = highestBid.offer;

		require(
			msg.sender == ToBeSold.seller,
			"Only seller can accept this market bid"
		);

		require(ToBeSold.sold == false, "Item is already sold");

		ToBeSold.seller.transfer(bidValue);

		IERC721(ToBeSold.nftContract).transferFrom(
			address(this),
			highestBid.buyer,
			tokenId
		);

		highestBid.accepted = true;
		idToBid[highestBidId] = highestBid;

		ToBeSold.sold = true;

		idToMarketItem[itemID] = ToBeSold;

		_itemsSold.increment();
		emit MarketItemSold(
			tokenId,
			bidValue,
			ToBeSold.nftContract,
			ToBeSold.seller,
			highestBid.buyer,
			true
		);
	}

	function getTotalCollections() public view returns (uint256) {
		uint256 collections = _collectionID.current();

		return collections;
	}

	function getTotalMarketItems() public view returns (uint256) {
		uint256 toReturn = _itemID.current();
		return toReturn;
	}
}
