import Head from "next/head";
import Header from "../components/header";

export default function Home({ loadProvider, selectedAccount, disconnect }) {
  return (
    <div>
      <Header loadProvider={loadProvider} selectedAccount={selectedAccount} />
    </div>
  );
}
