import { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from 'containers/App';
import SolanaPay from 'components/SolanaPay';
import EthPay from 'components/EthereumPay';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { EthWalletProvider } from 'components/Etherum/WalletState';
// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

function MainRouter() {
  const network = WalletAdapterNetwork.Devnet;

  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = 'https://devnet.genesysgo.net/';
  // const endpoint = 'https://ssc-dao.genesysgo.net/';
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <EthWalletProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<App />} index path="/" />
              <Route
                element={<SolanaPay />}
                index
                path="/solanapay"
              />
              <Route element={<EthPay />} index path="/ethpay" />
            </Routes>
          </BrowserRouter>
        </EthWalletProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MainRouter;
