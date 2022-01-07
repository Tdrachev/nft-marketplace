import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import Header from "../components/header";
import NFTBox from "../components/nftBox";

import { FetchAllNFTs, getAllCollections } from "../lib/contractInteractions";

export default function Home({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) {
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(0);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loadedNFTs, setLoadedNFTs] = useState(false);
  useEffect(async () => {
    const res = await FetchAllNFTs();

    if (res != []) {
      setNfts(res);
      setFilteredCollections(res);
    }
    const collections = await getAllCollections();
    setCollections(collections);
    setLoadedNFTs(true);
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
        <p className=" font-bold text-center text-3xl mt-5">
          All NFT for sale:
        </p>
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
  );
}
