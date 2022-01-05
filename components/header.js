import Link from "next/link";
import React, { useState, useEffect } from "react";

const Header = ({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) => {
  const logIn = async () => {
    loadProvider();
  };

  //   const disconnectFromWallet = async () => {
  //     disconnect();
  //     setLoggedIn(false);
  //   };

  //   useEffect(() => {
  //     if (selectedAccount == "0x0") {
  //       setLoggedIn(false);
  //     }
  //   }, [selectedAccount]);

  return (
    <div className="w-full h-20 bg-gray-500 flex flex-nowrap justify-between items-center pl-10 ">
      {loggedIn ? (
        <div className="flex justify-between ">
          <p className="ml-5 text-md">
            Welcome: {selectedAccount} - Balance: {balance} ether
          </p>
          {/* <button
            className=" border border-gray-300 rounded-md p-3 bg-gray-500  "
            onClick={() => {
              disconnectFromWallet();
            }}
          >
            Disconnect Wallet
          </button> */}
        </div>
      ) : (
        <div className="mr-10">
          <button
            className=" border border-gray-300 rounded-md p-3 bg-gray-500  "
            onClick={() => {
              logIn();
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}
      <div className="mr-5">
        <Link href="/">
          <a className="mr-5 font-bold text-lg">Home</a>
        </Link>
        <Link href="/createNFTCollection">
          <a className="mr-5 font-bold text-lg">Create NFT Collection</a>
        </Link>
        <Link href="/">
          <a className="mr-5 font-bold text-lg">List NFT</a>
        </Link>
        <Link href="/mintNFTOfCollection">
          <a className="mr-5 font-bold text-lg">Mint NFTs</a>
        </Link>
        <Link href="/">
          <a className="mr-5 font-bold text-lg">Your NFTs</a>
        </Link>
      </div>
    </div>
  );
};

export default Header;
