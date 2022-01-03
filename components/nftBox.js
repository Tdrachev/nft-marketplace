import Link from "next/link";
import React from "react";

const NFT = () => {
  return (
    <Link href="/nftDetails?id=1">
      <div className="flex flex-col justify-evenly w-72  h-72 border border-gray-400 m-10 ">
        <img
          className="w-auto h-auto object-contain"
          src="https://images.unsplash.com/photo-1620912189868-b98924464e34?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8bmZ0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
        />
        <div className="flex flex-row justify-between m-2 items-center ">
          <div className="flex flex-col justify-evenly">
            <p>Collection:</p>
            <p>NFT ID</p>
          </div>
          <p>Price</p>
        </div>
      </div>
    </Link>
  );
};

export default NFT;
