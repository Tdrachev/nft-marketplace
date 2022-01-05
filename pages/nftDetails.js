const {
  GetTokenByID,
  CreateMarketListing,
  GetTokenByItemID,
} = require("../lib/contractInteractions");

import React, { useEffect, useState } from "react";
import { Fragment } from "react/cjs/react.production.min";
import Header from "../components/header";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const NftDetails = ({ loggedIn, loadProvider, selectedAccount, balance }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [collection, setCollection] = useState("");
  const [tokenID, setTokenID] = useState();
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [marketItem, setMarketItem] = useState();
  const router = useRouter();

  useEffect(async () => {
    const ID = router.query.id;

    const MarketItem = await GetTokenByItemID(ID);
    console.log(MarketItem);
    setMarketItem(MarketItem);

    setTokenID(ethers.BigNumber.from(MarketItem.tokenID).toNumber());
    setPrice(ethers.BigNumber.from(MarketItem.price).toNumber());
    setCollection(MarketItem.name);
    setDescription(MarketItem.description);
    setImgSrc(MarketItem.tokenURI.image);
  }, []);

  const listNFT = async (e) => {
    e.preventDefault();
    const ID = router.query.id;

    const result = await CreateMarketListing(
      ID,
      salePrice,
      marketItem.nftContract
    );
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
        <form className="flex flex-col mt-10 border border-gray-500 p-10" rel>
          <label htmlFor="price">Price in ETH:</label>
          <input
            className="border border-gray-600"
            name="price"
            type={"text"}
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          ></input>
          <button className="mt-5 border-2 p-2 rounded-xl " onClick={listNFT}>
            Create Listing
          </button>
        </form>
      </div>
    </Fragment>
  );
};

export default NftDetails;
