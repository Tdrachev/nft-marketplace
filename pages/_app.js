import React, { useState, useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import "tailwindcss/tailwind.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

function MyApp({ Component, pageProps }) {
  const [selectedAccount, setSelectedAccount] = useState("0x0");

  let web3Modal;
  let provider;

  async function connect() {
    web3Modal = new Web3Modal();
    provider = await web3Modal.connect();
    // provider = new ethers.providers.Web3Provider(connection);
    fetchAccountData();
    provider.on("accountsChanged", () => {
      fetchAccountData();
    });

    provider.on("connect", () => {
      fetchAccountData();
    });

    provider.on("disconnect", () => {
      setSelectedAccount("0x0");
    });
  }

  async function fetchAccountData() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] == null) {
      setSelectedAccount("0x0");
      return;
    }
    setSelectedAccount(accounts[0]);
  }

  // async function disconnect() {
  //   provider = null;

  //   setSelectedAccount("0x0");
  // }

  return (
    <Component
      {...pageProps}
      loadProvider={connect}
      selectedAccount={selectedAccount}
    />
  );
}

export default MyApp;
