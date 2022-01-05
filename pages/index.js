import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import Header from "../components/header";
import NFTBox from "../components/nftBox";

import { FetchAllNFTs } from "../lib/contractInteractions";

export default function Home({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) {
  const [nfts, setNfts] = useState([]);

  useEffect(async () => {
    const res = await FetchAllNFTs();
    if (res != []) {
      setNfts(res);
    }
  }, []);

  return (
    <div>
      <Header
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        balance={balance}
        loggedIn={loggedIn}
      />
      <div className="flex flex-wrap">
        {nfts.map((i) => {
          return (
            <NFTBox
              key={ethers.BigNumber.from(i.tokenID).toNumber() + i.name}
              collection={i.name}
              Id={ethers.BigNumber.from(i.tokenID).toNumber()}
              Price={
                ethers.BigNumber.from(i.price).toNumber() != 0
                  ? ethers.BigNumber.from(i.price).toNumber()
                  : "Not for sale"
              }
            ></NFTBox>
          );
        })}
      </div>
    </div>
  );
}
