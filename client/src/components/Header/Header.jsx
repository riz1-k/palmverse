import { useState, useEffect } from 'react';
import styleClasses from './Header.module.scss';
import axios from 'axios'

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import CurrentBookings from 'components/Solpay/Modals/CurrentBookings';
import NftModal from 'components/Solpay/Modals/NftModal';
import PreviousBookings from 'components/Solpay/Modals/PreviousBookings';
import { getParsedNftAccountsByOwner, createConnectionConfig, } from "@nfteyez/sol-rayz"
import { Dropdown, DropdownButton } from 'react-bootstrap'
import {
    WalletMultiButton,
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import moment from 'moment'
import { Button } from 'components';
import { clearStoredValues } from 'lib/scripts/utils';
import {
    MetaMaskProvider,
    useMetaMask,
    useConnectedMetaMask,
} from 'metamask-react';


export default function Navbar(props) {
    const [previousBookings, setpreviousBookings] = useState([])
    const [currentBookings, setCurrentBookings] = useState([])
    const [hasNfts, setHasNfts] = useState(false)
    // import { clearStoredValues } from 'lib/scripts/utils';
    const [prevTransOpen, setPrevTransOpen] = useState(false);
    const [currentTransOpen, setCurrentTransOpen] = useState(false);
    const [nftOpen, setNftOpen] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [nftImages, setNftImages] = useState([]);
    const { connection } = useConnection();

    const { publicKey, connected, disconnect } = useWallet();

    const { status, connect, account } =
        useMetaMask();




    useEffect(() => {
        if (nfts) {
            let images = []
            nfts.forEach(nft => {
                const imageUrl = nft.data.uri;
                axios.get(imageUrl).then(res => {
                    images.push(res.data.image)
                })
                setNftImages(images)
            })
        }
    }, [nfts])

    useEffect(() => {
        setCurrentBookings([]);
        setpreviousBookings([])
        setNftImages([]);
        setNfts([])
        if ((connected && publicKey) || (status == 'connected')) {

            console.log(status)
            axios.post(`${process.env.REACT_APP_URL}/api/auth`, { walletId: publicKey ? publicKey.toString() : account }).then(res => {
                console.log(res.data.user.bookings)
                res.data.user.bookings.forEach(x => {
                    const bookingDate = moment(x.dateOut).format('L')
                    const currentDate = new Date().toLocaleDateString();
                    if (bookingDate >= moment(currentDate).format('L')) {
                        setCurrentBookings(e => [...e, x])

                    } else {
                        setpreviousBookings([...previousBookings, x]);
                    }
                })
            }).catch(error => console.error('wallet login error', error));
        }
    }, [connected, status])


    useEffect(() => {
        if (nfts) {
            let images = []
            nfts.forEach(nft => {
                const imageUrl = nft.data.uri;
                axios.get(imageUrl).then(res => {
                    images.push(res.data.image)
                })
                setNftImages(images)
            })
        }
    }, [nfts])

    useEffect(() => {
        const getAllNftData = async () => {
            try {
                if (connection && publicKey) {

                    const connect = createConnectionConfig('https://ssc-dao.genesysgo.net/');
                    const rawNfts = await getParsedNftAccountsByOwner({
                        publicAddress: publicKey,
                        connection: connect,
                        serialization: true,
                    })
                    rawNfts.forEach(nft => {
                        if (nft.data.creators[0].address === 'TeEpKTJzN3yv5sabr3Bx5xNX4u7NkaPCwrWU41wSbJk') {
                            setNfts(e => [...e, nft]);
                            setHasNfts(true)
                        }
                    })
                    return nfts;
                }
            } catch (error) {
                console.error(`Error while fetching NFT's from connected wallet`, error);
            }
        }
        getAllNftData()
    }, [connection, publicKey])


    return (<>
        <header className={styleClasses['header']}>
            {
                connected || status == "connected" ? (
                    <DropdownButton style={{
                        opacity: !publicKey && !status == "connected" && "0", position: "absolute", zIndex: "99", left: "2rem"
                    }} title={account ? account.slice(0, 12) + '...' : publicKey && publicKey.toString().slice(0, 12) + '...'}>
                        <Dropdown.Item onClick={() => setCurrentTransOpen(true)}>Current Bookings</Dropdown.Item>
                        <Dropdown.Item onClick={() => setPrevTransOpen(true)}>Previous Bookings</Dropdown.Item>
                        <Dropdown.Item onClick={() => setNftOpen(true)}>View NFTs</Dropdown.Item>
                        {
                            publicKey && (

                                <Dropdown.Item onClick={() => disconnect()}>Disconnect</Dropdown.Item>
                            )
                        }
                    </DropdownButton>

                ) : (
                    <DropdownButton title="Select Wallet" className='left-8  absolute z-50' >
                        <Dropdown.Item >
                            <div className="flex items-center justify-center relative ">
                                <button className="py-[13px]  text-sm font-bold text-white rounded-md tracking-wide w-40 bg-[#5722eb] hover:bg-[#6431ef] transition-all">{
                                    status === 'connected' ? (
                                        account.slice(0, 5) + '....'
                                    ) : status === "connecting" ? (
                                        "Connecting..."
                                    ) : "Connect Phantom "
                                }</button>
                                <div className="absolute opacity-0"  >
                                    <WalletModalProvider  >
                                        <WalletMultiButton />
                                    </WalletModalProvider>

                                </div>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <div className="flex mx-5  items-center justify-center">
                                <button onClick={() => window.ethereum ? connect() : alert("Install the Metamask Extension")} className="py-[13px]  text-sm font-bold text-white rounded-md tracking-wide w-40 bg-yellow-600 hover:bg-yellow-700 transition-all">{
                                    status === 'connected' ? (
                                        account.slice(0, 5) + '....'
                                    ) : status === "connecting" ? (
                                        "Connecting..."
                                    ) : "Connect Metamask "
                                }</button>
                            </div>
                        </Dropdown.Item>
                    </DropdownButton>
                    // <div className='flex  left-8  absolute z-50'>
                    //     <div className="flex items-center justify-center relative ">
                    //         <button className="py-[13px]  text-sm font-bold text-white rounded-md tracking-wide w-40 bg-[#5722eb] hover:bg-[#6431ef] transition-all">{
                    //             status === 'connected' ? (
                    //                 account.slice(0, 5) + '....'
                    //             ) : status === "connecting" ? (
                    //                 "Connecting..."
                    //             ) : "Connect Phantom "
                    //         }</button>
                    //         <div className="absolute opacity-0"  >
                    //             <WalletModalProvider  >
                    //                 <WalletMultiButton />
                    //             </WalletModalProvider>

                    //         </div>
                    //     </div>

                    //     <div className="flex mx-5  items-center justify-center">
                    //         <button onClick={() => window.ethereum ? connect() : alert("Install the Metamask Extension")} className="py-[13px]  text-sm font-bold text-white rounded-md tracking-wide w-40 bg-yellow-600 hover:bg-yellow-700 transition-all">{
                    //             status === 'connected' ? (
                    //                 account.slice(0, 5) + '....'
                    //             ) : status === "connecting" ? (
                    //                 "Connecting..."
                    //             ) : "Connect Metamask "
                    //         }</button>
                    //     </div>
                    // </div>
                )
            }
            <div className={styleClasses['header__logo']}>
                <span className={styleClasses['header__logo__title']}>PALMVERSE</span>
                <span className={styleClasses['header__logo__slogan']}>Pay with crypto or credit card.</span>
            </div>
            {props.activeStep !== 0 && (
                <div className={styleClasses['header__actions']}>
                    <Button
                        type="button"
                        onClick={() => {
                            props.stepChangeHandler(0, { isValid: false, inputs: {} }, 0);
                            clearStoredValues();
                        }}
                    >
                        Make a new reservation
                    </Button>
                </div>
            )}
        </header>



        {/* </div>   */}
        <PreviousBookings isEth={connect ? true : false} prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
        <CurrentBookings isEth={connect ? true : false} currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>
        <NftModal nfts={nfts} nftImages={nftImages} nftOpen={nftOpen} setNftOpen={setNftOpen}></NftModal>
    </>);
}