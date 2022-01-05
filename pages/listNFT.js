import React, { Fragment } from "react";
import Header from "../components/header";

const ListNFT = ({
  loadProvider,
  selectedAccount,
  disconnect,
  balance,
  loggedIn,
}) => {
  return (
    <Fragment>
      <Header
        loadProvider={loadProvider}
        selectedAccount={selectedAccount}
        disconnect={disconnect}
        balance={balance}
        loggedIn={loggedIn}
      ></Header>
      <div className="flex flex-col justify-center items-center"></div>
    </Fragment>
  );
};

export default ListNFT;
