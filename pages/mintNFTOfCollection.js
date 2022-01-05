import { ethers } from "ethers";
import React, { Fragment, useState, useEffect } from "react";
import Header from "../components/header";
import { create } from "ipfs-http-client";

const ipfs = create("https://ipfs.infura.io:5001/api/v0");

const {
  fetchCollectionsOfCurrentUser,
  mintNFTOfCollection,
} = require("../lib/contractInteractions");
const CreateNFTCollection = ({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) => {
  const [file, setFile] = useState();
  const [imgPreview, setImagePreview] = useState();
  const [collection, setCollection] = useState(1);
  const [collections, setCollections] = useState([]);
  const [hasCollections, setHasCollections] = useState(false);
  const mintNFT = async (e) => {
    e.preventDefault();
    console.log(file);
    let tokenURI = "";
    try {
      const imageUp = await ipfs.add(file);
      const imagePath = `https://ipfs.infura.io/ipfs/${imageUp.path}`;

      const { name, description } = collections[collection];
      tokenURI = JSON.stringify({ name, description, image: imagePath });
      const res = await mintNFTOfCollection(tokenURI, collection);
      if (res) {
        window.location.href = "/";
      }
    } catch (e) {
      console.log(e.message);
      return;
    }
  };

  useEffect(async () => {
    const result = await fetchCollectionsOfCurrentUser(selectedAccount);
    setCollections(result);
    if (result != []) {
      setHasCollections(true);
    }
  }, []);

  return (
    <Fragment>
      <Header
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        balance={balance}
        loggedIn={loggedIn}
      ></Header>
      <div className="flex flex-col justify-evenly items-center align-center w-full h-full mt-5">
        <p className="text-xl bold  uppercase">Mint a new NFT of Collection:</p>
        <form className="flex flex-col items-center justify-center border border-gray-400 p-20">
          <select
            name="collection"
            value={collection}
            onChange={(e) => {
              setCollection(e.target.value);
            }}
          >
            {collections.map((i) => {
              return (
                <option key={i.collectionAddress} value={i.collectionID}>
                  {i.name}
                </option>
              );
            })}
          </select>
          <label htmlFor="image">Image</label>
          <img src={imgPreview} className="w-auto h-96" />
          <input
            type={"file"}
            accept="image/*"
            name="image"
            onChange={(e) => {
              setImagePreview(URL.createObjectURL(e.target.files[0]));
              setFile(e.target.files[0]);
            }}
          ></input>
          {/* <label htmlFor="name">Name</label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(v) => {
              setName(v.target.value);
            }}
            className="border border-gray-400"
          ></input> */}
          {/* <label htmlFor="description">Description</label>
          <input
            name="description"
            type="text"
            value={description}
            onChange={(v) => {
              setDescription(v.target.value);
            }}
            className="border border-gray-400"
          ></input> */}
          {/* <label htmlFor="fee">Fee in %:</label>
          <input
            name="fee"
            type="number"
            value={fee}
            onChange={(v) => {
              setFee(v.value);
            }}
            className="border border-gray-400"
          ></input> */}
          {/* <label htmlFor="supply">Total supply:</label>
          <input
            name="supply"
            type="number"
            value={totalSupply}
            onChange={(v) => {
              setTotalSupply(v.target.value);
            }}
            className="border border-gray-400"
          ></input> */}
          <button
            className="border border-gray-400 p-5 mt-2 rounded-3xl"
            onClick={mintNFT}
          >
            Mint NFT
          </button>
        </form>
      </div>
    </Fragment>
  );
};

export default CreateNFTCollection;
