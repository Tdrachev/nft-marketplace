import React, { useState, useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import "tailwindcss/tailwind.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

function MyApp({ Component, pageProps }) {
  const [selectedAccount, setSelectedAccount] = useState("0x0");
  const [balance, setBalance] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  let web3Modal;
  let provider;

  async function connect() {
    web3Modal = new Web3Modal();
    provider = await web3Modal.connect();
    setLoggedIn(true);

    fetchAccountData();
    provider.on("accountsChanged", () => {
      fetchAccountData();
    });

    provider.on("connect", () => {
      fetchAccountData();
      setLoggedIn(true);
    });

    provider.on("disconnect", () => {
      setSelectedAccount("0x0");
      setLoggedIn(false);
    });
  }

  async function fetchAccountData() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] == null) {
      setSelectedAccount("0x0");
      setLoggedIn(false);
      return;
    }
    await setSelectedAccount(accounts[0]);
    const balanceInWei = await web3.eth.getBalance(accounts[0]);
    const balanceInEth = await web3.utils.fromWei(balanceInWei, "ether");
    setBalance(balanceInEth);
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
      balance={balance}
      loggedIn={loggedIn}
    />
  );
}

export default MyApp;
