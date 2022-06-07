import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from 'containers/App';
import SolanaPay from 'components/SolanaPay';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');
function MainRouter() {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const endpoint =
  //   'https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/';
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <BrowserRouter>
          <Routes>
            <Route element={<App />} index path="/" />
            <Route element={<SolanaPay />} index path="/solanaPay" />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MainRouter;
