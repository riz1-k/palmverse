import { useState, useEffect, useContext } from 'react';
import { useCart } from 'hooks';
import axios from 'axios';
import { EthWalletContext } from 'components/Etherum/WalletState';
import { ethers, providers, utils } from 'ethers';
import image from '../components/Ethpay.png';
import styleClasses from '../components/ReservationDetails/ReservationTotals/ReservationTotals.module.scss';
import { getDiscountedPrice } from 'components/functions/index'
import moment from 'moment'
import CurrentBookings from './Solpay/Modals/CurrentBookings';
import PreviousBookings from './Solpay/Modals/PreviousBookings';
import ReceiptModal from './Solpay/Modals/ReceiptModal';
import NftModal from './Solpay/Modals/NftModal';
import EthNav from './Etherum/EthNav'

const EthPay = () => {
    const [show, setShow] = useState(false);
    const [tID, setTID] = useState('');
    const [closed, setClosed] = useState(false);
    const [prevTransOpen, setPrevTransOpen] = useState(false);
    const [currentTransOpen, setCurrentTransOpen] = useState(false);
    const [previousBookings, setpreviousBookings] = useState([]);
    const [currentBookings, setCurrentBookings] = useState([]);
    const [nftImages, setNftImages] = useState([]);
    const [nftOpen, setNftOpen] = useState(false);
    const [hasFunds, setHasFunds] = useState(false);
    const { walletAddress, ethNfts, ethPrice, connectWallet, walletBalance } = useContext(EthWalletContext);
    const [payEthPrice, setEthPrice] = useState(0);

    useEffect(() => {
        let amount = 0;
        if (ethNfts.length > 0) {
            amount = getDiscountedPrice(payEthPrice)
        } else {
            amount = payEthPrice;
        }
        if (walletBalance <= amount) {
            setHasFunds(false);
        } else {
            setHasFunds(true);
        }
    }, [walletAddress, walletBalance, ethNfts])



    useEffect(() => {
        if (walletAddress) {
            axios.post(`${process.env.REACT_APP_URL}/api/auth`, { walletId: walletAddress }).then(res => {
                res.data.user.bookings.forEach(x => {
                    const bookingDate = moment(x.dateOut).format('L')
                    const currentDate = new Date().toLocaleDateString();

                    if (new Date(bookingDate) > new Date(currentDate)) {
                        setCurrentBookings(e => [...e, x])
                    } else {
                        setpreviousBookings(e => [...e, x]);
                    }
                })
            }).catch(error => console.error('wallet login error', error));
        }
    }, [walletAddress]);

    useEffect(() => {
        if (ethNfts.length > 0 && walletAddress) {
            let ethImages = [];
            ethNfts.forEach(nft => {
                nft.meta.content.forEach(img => {
                    ethImages.push(img.url)
                })
            });
            setNftImages(ethImages);
        }
    }, [ethNfts])

    useEffect(() => {
        if (!walletAddress) {
            connectWallet();
        }
    }, [walletAddress])


    const { totals, cart } = useCart();

    let roomPrice = totals.room / ethPrice;
    let totalAmount = totals.total;


    useEffect(() => {
        setEthPrice(totalAmount / ethPrice);
    }, [ethPrice]);

    const handleSubmit = async () => {
        if (!walletAddress) {
            alert("Please connect to your Metamask wallet")
            connectWallet()
        }

        if (!hasFunds) {
            return alert('Transaction Failed - Insufficient Funds in your wallet')
        }
        // let price = "0.000001"
        let price = ethNfts.length > 0 ? getDiscountedPrice(payEthPrice).toString() : payEthPrice.toString();
        let ether = utils.parseUnits(price, 18);
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        ethers.utils.getAddress(walletAddress);


        const tx = await signer.sendTransaction({
            to: walletAddress,
            value: ether
        });


        let body = {
            walletId: walletAddress,
            transactionId: tx.hash,
            to: tx.to,
            lamports: price,
            bookingInfo: {
                dateIn: cart.checkin,
                dateOut: cart.checkout,
                hotelName: hotel.hotel_name,
                hotelCity: hotel.city,
                price: price,
            },
        }

        axios.post(`${process.env.REACT_APP_URL}/api/newBooking`, body).then((res) => {
            console.log('Booking has been recorded', res);
            setTID(tx.hash);
            setShow(true);

        }).catch((err) => {
            console.error('booking error', err)
        })

    }

    const lowBalance = () => alert('Transaction Failed - Insufficient Funds in your wallet');

    return (
        <>

            <ReceiptModal show={show} setShow={setShow} tID={tID} setClosed={setClosed} isEth={true} />
            <PreviousBookings prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
            <CurrentBookings ookings currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>
            <NftModal isEth={true} nfts={ethNfts} nftImages={nftImages} nftOpen={nftOpen} setNftOpen={setNftOpen}></NftModal>
            <EthNav walletAddress={walletAddress} connect={connectWallet} setPrevTransOpen={setPrevTransOpen} setCurrentTransOpen={setCurrentTransOpen} setNftOpen={setNftOpen}></EthNav>
            <div className="body">


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
                                Room price / night
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
                            style={{ marginTop: "1rem" }}
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                Total Length of Stay
                            </span>
                            <span className={
                                styleClasses['reservation-details__totals__value']
                            }>
                                {moment(cart.checkin).format('ddd[,] Do MMM')}
                                {" - "}
                                {moment(cart.checkout).format('ddd[,] Do MMM')} <br />
                                <div className='flex justify-end'>
                                    <p>

                                        {cart.days} {cart.days && +cart.days > 1 ? 'Days' : 'Day'}
                                    </p>
                                </div>
                            </span>

                        </div>
                        <div
                            style={{ marginTop: "1rem" }}
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                Total Price
                            </span>
                            <span className={
                                styleClasses['reservation-details__totals__value']
                            }>
                                <p>${parseInt((totalAmount))} / {(payEthPrice).toFixed(4)} ETH</p>

                            </span>

                        </div>
                        {ethNfts.length > 0 ? (
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
                                style={{ textAlign: 'center', display: "flex", justifyContent: "center", padding: "2rem", fontSize: "20px" }}
                                className={styleClasses['reservation-details__totals__item']}
                            >
                                <span
                                    className={
                                        styleClasses['reservation-details__totals__title']
                                    }
                                >
                                    No Palmverse NFTs have been found in your wallet
                                </span>
                            </div>
                        )}
                    </li>
                </div>
                <div>
                    <h5 style={{ display: 'flex', justifyContent: 'space-between', margin: "10px auto", width: "fit-content" }}>
                        <p style={{ marginRight: '4px' }} > Total Amount in USD:</p>
                        {ethNfts.length > 0 ? (
                            <div className="d-flex">
                                <p
                                    style={{
                                        textDecoration: 'line-through',
                                        marginRight: '8px',
                                    }}
                                >
                                    ${totalAmount}
                                </p>
                                <p>
                                    $
                                    {getDiscountedPrice(totalAmount)}
                                    (30% discount)
                                </p>
                                <p></p>
                            </div>
                        ) : (
                            <p>${totalAmount}</p>
                        )}
                    </h5>
                    <h5
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '5px',
                        }}
                    >
                        <p style={{ marginRight: '4px' }}> Total Amount in ETH:</p>
                        {ethNfts.length > 0 ? (
                            <div className="d-flex">
                                <p
                                    style={{
                                        textDecoration: 'line-through',
                                        marginRight: '8px',
                                    }}
                                >
                                    {payEthPrice.toFixed(4)}
                                </p>
                                <p>{getDiscountedPrice(payEthPrice).toFixed(4)} (30% discount)
                                </p>
                                <p></p>
                            </div>
                        ) : (
                            <p>{payEthPrice.toFixed(4)}</p>
                        )}
                    </h5>
                </div>

                <button
                    disabled={walletAddress ? false : connectWallet()}
                    onClick={() => handleSubmit()}
                    style={{
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        marginTop: '2rem',
                    }}
                >
                    <img src={image} />
                </button>
            </div>
        </>
    )
}

export default EthPay

const key = localStorage.getItem('value');
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