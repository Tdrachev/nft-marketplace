// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./NFT.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ReentrancyGuard {
	using Counters for Counters.Counter;
	Counters.Counter private _itemID;
	Counters.Counter private _listingID;
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
	}

	struct Purchase {
		uint256 purchaseID;
		uint256 price;
		address seller;
		address buyer;
	}

	struct Listing {
		uint256 listingID;
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

	mapping(uint256 => MarketItem) idToMarketItem;
	mapping(uint256 => Purchase[]) idToPurchaseHistory;
	mapping(uint256 => Listing[]) idToListingHistory;
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

		_itemID.increment();
		uint256 newItemID = _itemID.current();
		idToMarketItem[newItemID] = MarketItem(
			newItemID,
			tokenID,
			price,
			nftContract,
			payable(msg.sender),
			payable(address(0)),
			false
		);
		IERC721(nftContract).approve(address(this), tokenID);
		IERC721(nftContract).safeTransferFrom(
			msg.sender,
			address(this),
			tokenID
		);

		_listingID.increment();
		uint256 newListingID = _listingID.current();

		Listing[] memory oldListings = idToListingHistory[newItemID];
		Listing[] memory newListings = new Listing[](oldListings.length + 1);
		newListings[oldListings.length] = Listing(
			newListingID,
			price,
			msg.sender,
			false
		);

		idToListingHistory[newItemID] = newListings;

		emit MarketItemListed(
			tokenID,
			price,
			nftContract,
			msg.sender,
			address(0)
		);
	}
}
