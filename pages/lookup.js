import React, { Fragment } from "react";
import Header from "../components/header";
import { ethers } from "ethers";
import Head from "next/head";
import NFTBox from "../components/nftBox";
import { useEffect, useState } from "react";
import {
  FetchAllNFTsOfAddress,
  getAllCollections,
  FetchListedNFTsOfAddress,
} from "../lib/contractInteractions";

const Lookup = ({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) => {
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(0);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loadedNFTs, setLoadedNFTs] = useState(false);
  const [listedNFTs, setListedNFTs] = useState([]);
  const [filteredListedNFTs, setFilteredListedNFTs] = useState([]);
  const [listedCollection, setListedCollection] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const loadByAccount = async (e) => {
    e.preventDefault();
    const res = await FetchAllNFTsOfAddress(selectedAddress);

    if (res != []) {
      setNfts(res);
      setFilteredCollections(res);
    }
    const collections = await getAllCollections();
    setCollections(collections);
    setLoadedNFTs(true);

    const Listed = await FetchListedNFTsOfAddress(selectedAddress);

    if (Listed != []) {
      setListedNFTs(res);
      setFilteredListedNFTs(res);
    }
  };

  useEffect(async () => {
    if (collection != 0) {
      const filteredCollections = nfts.filter(
        (i) => i.collectionID == collection
      );
      setFilteredCollections(filteredCollections);
    } else {
      setFilteredCollections(nfts);
    }
  }, [collection]);

  useEffect(async () => {
    if (listedCollection != 0) {
      const filteredCollections = listedNFTs.filter(
        (i) => i.collectionID == listedCollection
      );
      setFilteredListedNFTs(filteredCollections);
    } else {
      setFilteredListedNFTs(listedNFTs);
    }
  }, [listedCollection]);

  const formatPrice = (input) => {
    try {
      return ethers.BigNumber.from(input).toNumber() != 0
        ? ethers.BigNumber.from(input).toNumber() + " ETH"
        : "Not for sale";
    } catch (e) {}
  };

  return (
    <div>
      <Header
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        balance={balance}
        loggedIn={loggedIn}
      />
      <div className="flex flex-col flex-wrap ">
        <form className="flex flex-row justify-evenly items-center m-auto border-4 p-4 mt-5">
          <label htmlFor="address">Find by account:</label>
          <input
            className="border-2 mr-2"
            name="address"
            type={"text"}
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          />
          <button className="border-4 rounded-lg p-2" onClick={loadByAccount}>
            Find
          </button>
        </form>
        {selectedAddress != "" ? (
          <span>
            <div className="p-20">
              <p className=" font-bold text-center text-3xl mt-5">Your NFTs:</p>
              <form className="flex flex-row justify-items-start align-center mt-10 ml-10 border-4 p-3 w-max">
                <label htmlFor="filter_collection">Filter by collection:</label>
                <select
                  name="filter_collection"
                  value={collection}
                  onChange={(e) => {
                    setCollection(e.target.value);
                  }}
                >
                  <option value={0}>None</option>
                  {collections.map((i) => {
                    return (
                      <option key={i.collectionAddress} value={i.collectionID}>
                        {i.name}
                      </option>
                    );
                  })}
                </select>
              </form>
              <div className="flex  flex-wrap align-center">
                {loadedNFTs
                  ? filteredCollections.map((i) => {
                      return (
                        <NFTBox
                          key={
                            ethers.BigNumber.from(i.tokenID).toNumber() + i.name
                          }
                          collection={i.name}
                          Id={ethers.BigNumber.from(i.itemID).toNumber()}
                          Price={formatPrice(i.price)}
                          image={i.tokenURI.image}
                          collectionID={i.collectionID}
                        ></NFTBox>
                      );
                    })
                  : null}
              </div>
            </div>
            <hr></hr>
            <div className="pt-8">
              <p className=" font-bold text-center text-3xl mt-5">
                Your Listed NFTs:
              </p>
              <form className="flex flex-row justify-items-start align-center mt-10 ml-10 border-4 p-3 w-max">
                <label htmlFor="filter_listed_collection">
                  Filter by collection:
                </label>
                <select
                  name="filter_listed_collection"
                  value={listedCollection}
                  onChange={(e) => {
                    setListedCollection(e.target.value);
                  }}
                >
                  <option value={0}>None</option>
                  {collections.map((i) => {
                    return (
                      <option key={i.collectionAddress} value={i.collectionID}>
                        {i.name}
                      </option>
                    );
                  })}
                </select>
              </form>
              <div className="flex  flex-wrap align-center">
                {loadedNFTs
                  ? filteredListedNFTs.map((i) => {
                      return (
                        <NFTBox
                          key={
                            ethers.BigNumber.from(i.tokenID).toNumber() + i.name
                          }
                          collection={i.name}
                          Id={ethers.BigNumber.from(i.itemID).toNumber()}
                          Price={formatPrice(i.price)}
                          image={i.tokenURI.image}
                          collectionID={i.collectionID}
                        ></NFTBox>
                      );
                    })
                  : null}
              </div>
            </div>
          </span>
        ) : (
          <p className="text-bold text-center font-bold text-4xl mt-5">
            Please lookup by address to view NFTs
          </p>
        )}
      </div>
    </div>
  );
};

export default Lookup;
