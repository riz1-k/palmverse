import { useState, useEffect, createContext } from 'react';
import { ethers } from 'ethers';
const EthWalletContext = createContext();

const ethWallet = window.ethereum;

const EthWalletProvider = ({ children }) => {

    const [walletAddress, setWalletAddress] = useState('');
    const [ethNfts, setEthNfts] = useState([]);
    const [ethPrice, setEthPrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (walletAddress) {
            window.ethereum.request({
                method: 'eth_getBalance',
                params: [walletAddress, 'latest']
            }).then(balance => {
                setWalletBalance(ethers.utils.formatEther(balance))
            })
        }
    }, [walletAddress])

    if (ethWallet) {

        ethWallet.on('accountsChanged', () => {
            localStorage.removeItem('ethWalletAddress')
            setWalletAddress();
        })
    }

    //Get current Ethereum price
    const getEthPrice = async () => {


        try {
            let res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            let data = await res.json();
            const price = data.ethereum.usd
            setEthPrice(price);

        } catch (err) {
            console.log(err);
            alert("Error fetching current ETH price");
        }
        setTimeout(getEthPrice, 5000);

    }


    useEffect(() => getEthPrice(), [])

    // Get the wallet address 
    const connectWallet = async () => {

        try {

            if (localStorage.getItem('ethWalletAddress')) {
                setWalletAddress(localStorage.getItem('ethWalletAddress'));
            } else {
                const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
                localStorage.setItem('ethWalletAddress', accounts[0]);
                setWalletAddress(accounts[0]);
            }
        } catch (err) {
            console.error(err);
        }
    }



    //fetching nfts
    useEffect(() => {
        if (!walletAddress) return;
        const getNfts = async () => {
            try {
                const res = await fetch(`https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${walletAddress}`);
                const data = await res.json();
                console.log('unfiltered nfts', data)
                let eligibleNfts = data.items.filter(item => item.creators[0].account === "ETHEREUM:0x11db46d02dc30f632cb988eb7eb7ad8045004f71");
                console.log('eligibleNfts', eligibleNfts)
                setEthNfts(eligibleNfts)

            } catch (err) {
                console.error(err);
            }
        }
        getNfts();

    }, [walletAddress]);

    return (
        <EthWalletContext.Provider value={{ walletAddress, ethNfts, ethPrice, connectWallet, walletBalance }}>
            {children}
        </EthWalletContext.Provider>
    )
}

export { EthWalletContext, EthWalletProvider };