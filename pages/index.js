import Head from "next/head";
import { useState } from "react";
import Header from "../components/header";
import NFTBox from "../components/nftBox";
export default function Home({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) {
  const [nfts, setNfts] = useState([]);

  async function LoadAllNFTs() {}

  return (
    <div>
      <Header
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        balance={balance}
        loggedIn={loggedIn}
      />
      <div className="flex flex-wrap">
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
        <NFTBox></NFTBox>
      </div>
    </div>
  );
}
