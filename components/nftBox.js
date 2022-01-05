import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const NFT = ({ collection, Id, Price, image, collectionID }) => {
  return (
    <Link href={"/nftDetails?id=" + Id + "&collection=" + collectionID}>
      <div className="flex flex-col justify-evenly w-72  h-72 border border-gray-400 m-10 ">
        <img className="w-auto h-auto object-contain" src={image} />
        <div className="flex flex-row justify-between m-2 items-center ">
          <div className="flex flex-col justify-evenly">
            <p>Collection:{collection}</p>
            <p>NFT ID:{Id}</p>
          </div>
          <p>{Price}</p>
        </div>
      </div>
    </Link>
  );
};

export default NFT;
