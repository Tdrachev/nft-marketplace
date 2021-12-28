// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	uint256 public totalSupply;
	address public marketplaceAddress;

	//Here we set the collection name and description
	constructor(
		address _marketplaceAddress,
		uint256 _totalSupply,
		string memory __name,
		string memory __symbol
	) ERC721(__name, __symbol) {
		marketplaceAddress = _marketplaceAddress;
		totalSupply = _totalSupply;
	}

	function createNFT(string memory tokenURI) public returns (uint256) {
		_tokenIds.increment();
		uint256 newID = _tokenIds.current();
		require(newID < totalSupply, "Supply cannot be exceeded");
		_mint(msg.sender, newID);
		_setTokenURI(newID, tokenURI);
		setApprovalForAll(marketplaceAddress, true);
		return newID;
	}

	function createNFTFromMarketplace(address owner, string memory tokenURI)
		public
		returns (uint256)
	{
		_tokenIds.increment();
		uint256 newID = _tokenIds.current();
		require(newID < totalSupply, "Supply cannot be exceeded");
		_mint(marketplaceAddress, newID);
		_setTokenURI(newID, tokenURI);
		approve(owner, newID);
		return newID;
	}
}
