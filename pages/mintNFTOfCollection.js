import { ethers } from "ethers";

import React, { Fragment, useState } from "react";

import Header from "../components/header";
const { CreateNewCollection } = require("../lib/contractInteractions");
const CreateNFTCollection = ({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [file, setFile] = useState();
  const mintNFT = async (e) => {
    e.preventDefault();

    const result = await CreateNewCollection(name, description, supplyAsBigInt);
    if (result == true) {
      window.location.href = "/";
    }
  };

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
          <label htmlFor="image">Image</label>
          <img src={file} className="w-auto h-96" />
          <input
            type={"file"}
            accept="image/*"
            name="image"
            onChange={(e) => setFile(URL.createObjectURL(e.target.files[0]))}
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
