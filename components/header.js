import React, { useState, useEffect } from "react";

const Header = ({ loadProvider, selectedAccount, disconnect }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const [provider, setProvider] = useState(null);
  const logIn = async () => {
    loadProvider();
    setLoggedIn(true);
  };

  //   const disconnectFromWallet = async () => {
  //     disconnect();
  //     setLoggedIn(false);
  //   };

  useEffect(() => {
    if (selectedAccount == "0x0") {
      setLoggedIn(false);
    }
  }, [selectedAccount]);

  return (
    <div className="w-full h-20 bg-gray-500 flex justify-between items-center ">
      {loggedIn ? (
        <div className="flex justify-between w-full">
          <p className="ml-5 text-xl">Welcome: {selectedAccount}</p>
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
    </div>
  );
};

export default Header;
