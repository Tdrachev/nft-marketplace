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

const YourNFT = ({
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

  useEffect(async () => {
    const res = await FetchAllNFTsOfAddress(selectedAccount);

    if (res != []) {
      setNfts(res);
      setFilteredCollections(res);
    }
    const collections = await getAllCollections();
    setCollections(collections);
    setLoadedNFTs(true);
  }, []);

  useEffect(async () => {
    const res = await FetchListedNFTsOfAddress(selectedAccount);

    if (res != []) {
      setListedNFTs(res);
      setFilteredListedNFTs(res);
    }
  }, []);

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
        <div>
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
                      key={ethers.BigNumber.from(i.tokenID).toNumber() + i.name}
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
      </div>
      <hr></hr>
      <div>
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
                    key={ethers.BigNumber.from(i.tokenID).toNumber() + i.name}
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
    </div>
  );
};

export default YourNFT;
