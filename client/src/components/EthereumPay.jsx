import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useCart } from 'hooks';
import image from '../components/Ethpay.png';
import styleClasses from '../components/ReservationDetails/ReservationTotals/ReservationTotals.module.scss';
import './sol.css';
import EthNav from '../components/EthPay/EthNav'
import {
    MetaMaskProvider,
    useMetaMask,
    useConnectedMetaMask,
} from 'metamask-react';
// import { NftProvider, useNft } from "use-nft"
import { ethers, getDefaultProvider } from 'ethers'
import CurrentBookings from './Solpay/Modals/CurrentBookings';
import PreviousBookings from './Solpay/Modals/PreviousBookings';
import ReceiptModal from './Solpay/Modals/ReceiptModal';

if (window.ethereum) {
    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((res) => {
            // Return the address of the wallet

        });
}



function SolanaPay() {

    const [ethereumRate, setethereumRate] = useState(0);
    const { totals, cart } = useCart();
    const totalAmount = totals.total.toFixed(2);
    const key = localStorage.getItem('value');
    const [show, setShow] = useState(false);
    const [tID, setTID] = useState('');
    const [closed, setClosed] = useState(false);
    const [a, setA] = useState();
    const [nfts, setNfts] = useState([]);
    const [prevTransOpen, setPrevTransOpen] = useState(false);
    const [currentTransOpen, setCurrentTransOpen] = useState(false);
    const [previousBookings, setpreviousBookings] = useState([]);
    const [currentBookings, setCurrentBookings] = useState([]);
    const [nftImages, setNftImages] = useState([]);
    const [nftOpen, setNftOpen] = useState(false);
    const [hasNfts, setHasNfts] = useState(false);
    const [hasFunds, setHasFunds] = useState(true);
    let id;



    const { status, connect, account } =
        useMetaMask();

    useEffect(() => {
        if (status == "connected") {
            window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            }).then(balance => {

                const b = ethers.utils.formatEther(balance);
                if (b < a) {
                    setHasFunds(false);
                }
            })
        }


    }, [status]);


    useEffect(() => {
        if (status == "connected") {
            axios.post(`${process.env.REACT_APP_URL}/api/auth`, { walletId: account }).then(res => {
                res.data.user.bookings.forEach(x => {
                    const bookingDate = moment(x.dateOut).format('L')
                    const currentDate = new Date().toLocaleDateString();
                    console.log(bookingDate, currentDate)
                    if (bookingDate >= moment(currentDate).format('L')) {
                        setCurrentBookings(e => [...e, x])

                    } else {
                        setpreviousBookings([...previousBookings, x]);
                    }
                })
            })
        }
    }, [connect])
    // const { loading, error, nft } = useNft(
    //     account,
    //     "90473"
    // )

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (hasFunds) {

            await startPayment({
                ether: "0.000001",
                // ether: a.toString(),
                addr: "0x11Db46D02dC30F632Cb988eb7eB7aD8045004f71"
            });
        } else {
            alert(`Insufficient amount in your account`)
        }
    };

    const startPayment = async ({ ether, addr }) => {


        try {
            if (!window.ethereum) {
                return alert("Please Install the Metamask Extension")
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            ethers.utils.getAddress(addr);

            const tx = await signer.sendTransaction({
                to: addr,
                value: ethers.utils.parseEther(ether)
            });
            const body = {
                walletId: account,
                transactionId: tx.hash,
                to: tx.to,
                lamports: ether,
                bookingInfo: {
                    dateIn: cart.checkin,
                    dateOut: cart.checkout,
                    hotelName: hotel.hotel_name,
                    hotelCity: hotel.city,
                    price: ether,
                },
            }
            console.log("tx", tx);

            axios.post(`${process.env.REACT_APP_URL}/api/newBooking`, body).then((res) => {
                console.log('Booking has been recorded', res);
                setTID(tx.hash);
                setShow(true);
            }).catch((err) => {
                console.error('booking error', err)
            })

        } catch (err) {
            console.error(err)
            alert(err.message)
        }

    }


    const hotels = [
        {
            hotel_name: 'PALMVERSE Tamarindo, Costa Rica',
            city: 'Tamarido',
        },
        { hotel_name: 'PALMVERSE Nosara, Costa Rica', city: 'Nosara' },
        {
            hotel_name: 'PALMVERSE Santa Teresa, Costa Rica',
            city: 'Santa Teresa',
        },
        { hotel_name: 'PALMVERSE Miami, USA', city: 'Miami' },
    ];

    const hotel = hotels[key - 1];
    let roomPrice = totals.room / ethereumRate;

    const getPrice = () => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
        };

        fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                setethereumRate(result.ethereum.usd);
            })
            .catch((error) => console.log('error', error));

        setTimeout(getPrice, 5000);
    };

    useEffect(() => getPrice(), []);

    useEffect(() => {
        setA(totalAmount / ethereumRate);
    }, [ethereumRate]);

    return (
        <>

            <ReceiptModal show={show} setShow={setShow} tID={tID} setClosed={setClosed} isEth={true} />
            <PreviousBookings prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
            <CurrentBookings currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>

            <EthNav status={status} connect={connect} setPrevTransOpen={setPrevTransOpen} setCurrentTransOpen={setCurrentTransOpen} setNftOpen={setNftOpen}></EthNav>
            <div className="solcontainer">
                <div className="body">
                    <div>
                        <h5 style={{ display: 'flex', justifyContent: 'center' }}>
                            <p style={{ marginRight: '4px' }}>Amount in USD:</p>
                            {nfts.length > 0 ? (
                                <div className="d-flex">
                                    <p
                                        style={{
                                            textDecoration: 'line-through',
                                            marginRight: '8px',
                                        }}
                                    >
                                        ${parseInt(totalAmount)}
                                    </p>
                                    <p>
                                        $
                                        {parseInt(totalAmount) -
                                            (parseInt(totalAmount) * 30) / 100}{' '}
                                        (30% discount)
                                    </p>
                                    <p></p>
                                </div>
                            ) : (
                                <p>${parseInt(totalAmount)}</p>
                            )}
                        </h5>
                        <h5
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '5px',
                            }}
                        >
                            <p style={{ marginRight: '4px' }}>Amount in ETH:</p>
                            {nfts.length > 0 ? (
                                <div className="d-flex">
                                    <p
                                        style={{
                                            textDecoration: 'line-through',
                                            marginRight: '8px',
                                        }}
                                    >
                                        {ethereumRate && a.toFixed(4)}
                                    </p>
                                    <p>
                                        {ethereumRate &&
                                            (a - (ethereumRate && a * 30) / 100).toFixed(
                                                3
                                            )}{' '}
                                        (30% discount)
                                    </p>
                                    <p></p>
                                </div>
                            ) : (
                                <p>{ethereumRate && a.toFixed(4)}</p>
                            )}
                        </h5>
                    </div>

                    <button
                        disabled={connect ? false : true}
                        onClick={handleSubmit}
                        style={{
                            border: 'none',
                            outline: 'none',
                            padding: 0,
                            marginTop: '2rem',
                        }}
                    >
                        <img src={image} />
                    </button>

                    <div className="details">
                        <li
                            className={styleClasses['reservation-details__totals']}
                        >
                            <div
                                className={
                                    styleClasses['reservation-details__totals__item']
                                }
                            >
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__title']
                                    }
                                >
                                    Hotel name
                                </span>
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__value']
                                    }
                                >
                                    {hotel.hotel_name}
                                </span>
                            </div>
                            <div
                                className={
                                    styleClasses['reservation-details__totals__item']
                                }
                            >
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__title']
                                    }
                                >
                                    City
                                </span>
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__value']
                                    }
                                >
                                    {hotel.city}
                                </span>
                            </div>
                            <div
                                className={
                                    styleClasses['reservation-details__totals__item']
                                }
                            >
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__title']
                                    }
                                >
                                    Room price
                                </span>
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__value']
                                    }
                                >
                                    {roomPrice.toFixed(3)} ETH
                                </span>
                            </div>

                            <div
                                className={
                                    styleClasses['reservation-details__totals__item']
                                }
                            >
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__title']
                                    }
                                >
                                    Accomodation{' '}
                                </span>
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__value']
                                    }
                                >
                                    {cart.days}{' '}
                                    {cart.days && +cart.days > 1 ? 'Days' : 'Day'}
                                </span>
                            </div>
                            {nfts.length > 0 ? (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        fontSize: '20px',
                                    }}
                                    className={
                                        styleClasses['reservation-details__totals__item']
                                    }
                                >
                                    <span
                                        className={
                                            styleClasses[
                                            'reservation-details__totals__title'
                                            ]
                                        }
                                    >
                                        Palmverse NFTs have been found in your wallet!
                                    </span>
                                    <br />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        fontSize: '20px',
                                    }}
                                    className={
                                        styleClasses['reservation-details__totals__item']
                                    }
                                >
                                    <span
                                        className={
                                            styleClasses[
                                            'reservation-details__totals__title'
                                            ]
                                        }
                                    >
                                        No Palmverse NFTs have been found in your wallet
                                    </span>
                                </div>
                            )}
                        </li>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SolanaPay;
