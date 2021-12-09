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

	struct MarketItem {
		uint256 itemID;
		uint256 tokenID;
		uint256 price;
		address nftContract;
		address payable seller;
		address payable owner;
		bool sold;
		Listing[] listingHistory;
		Purchase[] purchaseHistory;
	}

	struct Purchase {
		uint256 price;
		address seller;
		address buyer;
	}

	struct Listing {
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
		Purchase[] purchases;
		Listing[] listings;
	}

	address payable marketplaceOwner;
	uint256 marketplaceFee = 0.025 ether;

	mapping(uint256 => uint256) tokenIdToId;
	mapping(uint256 => MarketItem) idToMarketItem;
	mapping(uint256 => Collection) idToCollection;

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
		address seller,
		address owner
	);

	event CollectionCreated(
		uint256 collectionID,
		string name,
		string description,
		uint256 totalItems,
		uint256 fee,
		uint256 owner
	);

	event CollectionDescriptionUpdated(
		uint256 collectionID,
		string name,
		string description
	);

	event CollectionNFTMinted(
		uint256 collectionID,
		uint256 tokenID,
		uint256 price,
		address nftContract,
		address buyer
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
		uint256 newItemID = _itemID.current();

		Listing[] storage newListings = idToMarketItem[newItemID]
			.listingHistory;
		newListings.push(Listing(price, msg.sender, false));

		Purchase[] storage purchases = idToMarketItem[newItemID]
			.purchaseHistory;

		MarketItem storage toBeSaved = idToMarketItem[newItemID];

		toBeSaved.itemID = newItemID;
		toBeSaved.tokenID = tokenID;
		toBeSaved.price = price;
		toBeSaved.nftContract = nftContract;
		toBeSaved.seller = payable(msg.sender);
		toBeSaved.owner = payable(address(0));
		toBeSaved.sold = false;
		toBeSaved.listingHistory = newListings;
		toBeSaved.purchaseHistory = purchases;

		idToMarketItem[newItemID] = toBeSaved;
		tokenIdToId[tokenID] = newItemID;
		IERC721(nftContract).transferFrom(msg.sender, address(this), tokenID);

		emit MarketItemListed(
			tokenID,
			price,
			nftContract,
			msg.sender,
			address(0)
		);
	}

	function cancelMarketListing(uint256 tokenID) public payable nonReentrant {
		uint256 itemID = tokenIdToId[tokenID];
		MarketItem storage marketItemToCancel = idToMarketItem[itemID];
		address nftContract = marketItemToCancel.nftContract;

		marketItemToCancel.sold = false;
		marketItemToCancel.owner = payable(msg.sender);

		Listing[] storage listingHistory = marketItemToCancel.listingHistory;

		listingHistory[listingHistory.length - 1].canceled = true;

		idToMarketItem[itemID] = marketItemToCancel;

		IERC721(nftContract).safeTransferFrom(
			address(this),
			marketItemToCancel.seller,
			marketItemToCancel.tokenID
		);

		emit MarketItemCanceled(tokenID, nftContract, msg.sender, msg.sender);
	}

	function completeMarketListing(uint256 tokenID)
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

		Listing[] storage listingHistory = toBeSold.listingHistory;
		Listing storage toBeCanceled = listingHistory[
			listingHistory.length - 1
		];

		toBeCanceled.canceled = true;

		listingHistory[listingHistory.length - 1] = toBeCanceled;
		toBeSold.listingHistory = listingHistory;

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
}
