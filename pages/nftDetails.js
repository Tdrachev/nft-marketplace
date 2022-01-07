const {
  GetTokenByID,
  CreateMarketListing,
  GetTokenByItemID,
  CancelMarketListing,
  CompleteMarketListing,
  BidOnMarketListing,
  FetchMarketItemHighestBid,
  AcceptMarketBid,
  CancelBid,
} = require("../lib/contractInteractions");

import React, { useEffect, useState } from "react";
import { Fragment } from "react/cjs/react.production.min";
import Header from "../components/header";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const NftDetails = ({
  loggedIn,
  loadProvider,
  selectedAccount,
  balance,
  id,
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const [collection, setCollection] = useState("");
  const [tokenID, setTokenID] = useState();
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [marketItem, setMarketItem] = useState();
  const [bidPrice, setBidPrice] = useState(0);
  const [highestBid, setHighestBid] = useState(null);
  const router = useRouter();

  useEffect(async () => {
    const params = new URLSearchParams(window.location.search);
    const ID = router.query.id || params.get("id");

    const MarketItem = await GetTokenByItemID(ID);

    setMarketItem(MarketItem);

    setTokenID(ethers.BigNumber.from(MarketItem.tokenID).toNumber());
    setPrice(ethers.BigNumber.from(MarketItem.price).toNumber());
    setCollection(MarketItem.name);
    setDescription(MarketItem.description);
    setImgSrc(MarketItem.tokenURI.image);

    const highestBid = await FetchMarketItemHighestBid(MarketItem.tokenID);
    console.log(ethers.BigNumber.from(highestBid.offer).toNumber());
    if (highestBid) {
      setHighestBid(highestBid);
    }
  }, []);

  const listNFT = async (e) => {
    e.preventDefault();
    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();

    const result = await CreateMarketListing(
      ID,
      salePrice,
      marketItem.nftContract
    );
    if (result) {
      router.push("/");
    }
  };

  const cancelNFT = async (e) => {
    e.preventDefault();
    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();

    const result = await CancelMarketListing(ID);
    if (result) {
      router.push("/yourNFT");
    }
  };

  const buyNFT = async (e) => {
    e.preventDefault();
    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();
    const price = ethers.utils.parseEther(
      ethers.BigNumber.from(marketItem.price).toString()
    );

    const result = await CompleteMarketListing(ID, price);
    if (result) {
      router.push("/yourNFT");
    }
  };

  const bidOnNFT = async (e) => {
    e.preventDefault();
    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();
    const lastHigherOffer = ethers.BigNumber.from(highestBid.offer).toNumber();

    if (bidPrice <= lastHigherOffer) {
      setBidPrice("Bid must be higher than the last one");
      return;
    }
    const result = await BidOnMarketListing(ID, bidPrice);
    if (result) {
      router.push("/");
    }
  };

  const acceptHighestBid = async (e) => {
    e.preventDefault();

    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();

    const result = await AcceptMarketBid(ID, selectedAccount);
    if (result) {
      router.push("/yourNFT");
    }
  };

  const cancelBid = async (e) => {
    e.preventDefault();

    const ID = ethers.BigNumber.from(marketItem.tokenID).toNumber();

    const result = await CancelBid(selectedAccount);
    if (result) {
      router.push("/");
    }
  };

  return (
    <Fragment>
      <Header
        loggedIn={loggedIn}
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        balance={balance}
      />
      <div className="flex flex-col justify-evenly items-center w-full mt-5 ">
        <img className="border border-gray-300 w-96 h-96" src={imgSrc} />
        <div className="mt-5">
          <p>{tokenID}</p>
          <p>{collection}</p>
          <p>{price == 0 ? "Not for sale" : price + " ETH"}</p>
          <p>{description}</p>
        </div>
        {loggedIn ? (
          price == 0 ? (
            <form
              className="flex flex-col mt-10 border border-gray-500 p-10"
              rel
            >
              <label htmlFor="price">Price in ETH:</label>
              <input
                className="border border-gray-600"
                name="price"
                type={"text"}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              ></input>
              <button
                className="mt-5 border-2 p-2 rounded-xl "
                onClick={listNFT}
              >
                Create Listing
              </button>
            </form>
          ) : selectedAccount == marketItem.seller ? (
            <form
              className="flex flex-col mt-10 border border-gray-500 p-10"
              rel
            >
              <button
                className="mt-5 border-2 p-2 rounded-xl "
                onClick={cancelNFT}
              >
                Cancel Listing
              </button>
              {highestBid ? (
                ethers.BigNumber.from(highestBid.offer).toNumber() > 0 ? (
                  <span className="flex flex-col">
                    <br></br>
                    <hr></hr>
                    <br></br>
                    <label htmlFor="highest_bid">
                      Highest Bid:
                      {ethers.BigNumber.from(highestBid.offer).toNumber() +
                        " ETH"}
                    </label>
                    <button
                      className="mt-5 border-2 p-2 rounded-xl "
                      onClick={acceptHighestBid}
                    >
                      Accept Bid
                    </button>
                  </span>
                ) : null
              ) : null}
            </form>
          ) : (
            <form
              className="flex flex-col mt-10 border border-gray-500 p-10"
              rel
            >
              <button
                className="mt-5 border-2 p-2 rounded-xl "
                onClick={buyNFT}
              >
                Buy NFT
              </button>
              {highestBid ? (
                highestBid.buyer != selectedAccount ? (
                  <span className="flex flex-col">
                    <br></br>
                    <hr></hr>
                    <br></br>
                    <label htmlFor="bid">Price in ETH:</label>
                    <input
                      className="border border-gray-600"
                      name="bid"
                      type={"text"}
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                    ></input>
                    <button
                      className="mt-5 border-2 p-2 rounded-xl "
                      onClick={bidOnNFT}
                    >
                      Bid on NFT
                    </button>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    <br></br>
                    <hr></hr>
                    <br></br>
                    <button
                      className="mt-5 border-2 p-2 rounded-xl "
                      onClick={cancelBid}
                    >
                      Cancel Bid
                    </button>
                  </span>
                )
              ) : (
                <span className="flex flex-col">
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <label htmlFor="bid">Price in ETH:</label>
                  <input
                    className="border border-gray-600"
                    name="bid"
                    type={"text"}
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                  ></input>
                  <button
                    className="mt-5 border-2 p-2 rounded-xl "
                    onClick={bidOnNFT}
                  >
                    Bid on NFT
                  </button>
                </span>
              )}
            </form>
          )
        ) : (
          <p className="mt-5 text-xl font-bold  border p-5">
            Connect wallet to interact with the NFT
          </p>
        )}
      </div>
    </Fragment>
  );
};

export default NftDetails;
