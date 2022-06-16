import { useState, useEffect } from 'react';
import styleClasses from './Header.module.scss';
import axios from 'axios'

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import CurrentBookings from 'components/Solpay/Modals/CurrentBookings';
import NftModal from 'components/Solpay/Modals/NftModal';
import PreviousBookings from 'components/Solpay/Modals/PreviousBookings';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { getParsedNftAccountsByOwner, createConnectionConfig, } from "@nfteyez/sol-rayz"
import { Dropdown, DropdownButton } from 'react-bootstrap'
import {
    WalletMultiButton,
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import moment from 'moment'
import { Button } from 'components';



// type TypeHeader = {
//     activeStep?: number;
//     stepChangeHandler: (stepIndex: number, formState: TypeFormState, targetStep: number) => void;
// };
// const Header: React.FC<TypeHeader> = (props: TypeHeader) => (
//     <header className={styleClasses['header']}>
//         <div className={styleClasses['header__logo']}>
//             <span className={styleClasses['header__logo__title']}>PALMVERSE</span>
//             <span className={styleClasses['header__logo__slogan']}>Pay with crypto or credit card.</span>
//         </div>
//         {props.activeStep !== 0 && (
//             <div className={styleClasses['header__actions']}>
//                 <Button
//                     type="button"
//                     onClick={() => {
//                         props.stepChangeHandler(0, { isValid: false, inputs: {} }, 0);
//                         clearStoredValues();
//                     }}
//                 >
//                     Make a new reservation
//                 </Button>
//             </div>
//         )}
//     </header>
// );

// export default Header;


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
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
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
        if (connected && publicKey) {

            axios.post(`${process.env.REACT_APP_URL}/api/auth"`, { walletId: publicKey.toString() }).then(res => {
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
    }, [connected])


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

                    const connect = createConnectionConfig(clusterApiUrl("mainnet-beta"))
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

    return (<nav className='head'>
        <div style={{
            display: 'flex',
            justifyContent: "space-between",
            alignItems: "center",
            width: "90%",
            margin: "auto",
            position: "relative",
            padding: "12px 0"
        }}>

            {
                connected ? (
                    <DropdownButton style={{
                        opacity: !publicKey && "0", position: "absolute", zIndex: "99", left: "2rem"
                    }} title="Palmverse Wallet">
                        <Dropdown.Item onClick={() => setCurrentTransOpen(true)}>Current Bookings</Dropdown.Item>
                        <Dropdown.Item onClick={() => setPrevTransOpen(true)}>Previous Bookings</Dropdown.Item>
                        <Dropdown.Item onClick={() => setNftOpen(true)}>View NFTs</Dropdown.Item>
                    </DropdownButton>

                ) : (
                    <div style={{ position: "absolute", zIndex: "99", left: "2rem" }} >

                        <WalletModalProvider>
                            <WalletMultiButton />
                        </WalletModalProvider>
                    </div>
                )
            }


            <div style={{ widht: "140px !important" }} >

                <div style={{ width: "fit-content" }} className={styleClasses['header__logo']}>
                    <span className={styleClasses['header__logo__title']}>PALMVERSE</span>
                    <span className={styleClasses['header__logo__slogan']}>Pay with crypto or credit card.</span>
                </div>
            </div>

            {props.activeStep !== 0 && (
                <div className={styleClasses['header__actions']}>
                    <Button
                        type="button"
                        onClick={() => {
                            props.stepChangeHandler(0, { isValid: false, inputs: {} }, 0);
                            localStorage.clear();
                            window.location.reload();
                        }}
                    >
                        Make a new reservation
                    </Button>
                </div>
            )}



        </div>
        <PreviousBookings prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
        <CurrentBookings currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>
        <NftModal nfts={nfts} nftImages={nftImages} nftOpen={nftOpen} setNftOpen={setNftOpen}></NftModal>
    </nav>);
}