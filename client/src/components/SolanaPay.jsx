import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useCart } from 'hooks'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import image from '../components/pay.png'
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  WalletMultiButton,
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import styleClasses from '../components/ReservationDetails/ReservationTotals/ReservationTotals.module.scss'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import './sol.css'
import { getParsedNftAccountsByOwner, createConnectionConfig, } from "@nfteyez/sol-rayz"


import CurrentBookings from './Solpay/Modals/CurrentBookings';
import PreviousBookings from './Solpay/Modals/PreviousBookings';
import ReceiptModal from './Solpay/Modals/ReceiptModal';
import NftModal from './Solpay/Modals/NftModal';
import Navbar from './Solpay/Navbar';

const shopAddress = new PublicKey('HekSQzW1Yx7hiGqk41iSy8bcELLHvWn34fUe5ukyDya1')

function SolanaPay() {
  const [solanaRate, setSolanaRate] = useState(0)
  const { totals, cart } = useCart();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const totalAmount = totals.total.toFixed(2);
  const key = localStorage.getItem('value');
  const [show, setShow] = useState(false);
  const [tID, setTID] = useState('');
  const [closed, setClosed] = useState(false);
  const [a, setA] = useState();
  const [nfts, setNfts] = useState([]);
  const [prevTransOpen, setPrevTransOpen] = useState(false);
  const [currentTransOpen, setCurrentTransOpen] = useState(false);
  const [previousBookings, setpreviousBookings] = useState([])
  const [currentBookings, setCurrentBookings] = useState([])
  const [nftImages, setNftImages] = useState([]);
  const [nftOpen, setNftOpen] = useState(false);
  const [hasNfts, setHasNfts] = useState(false)
  let id;

  useEffect(() => {
    if (connected && publicKey) {

      axios.post(`${process.env.REACT_APP_URL}/api/auth`, { walletId: publicKey.toString() }).then(res => {
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
    const getAllNftData = async () => {
      try {
        if (connection && publicKey) {
          const connect = createConnectionConfig(clusterApiUrl("mainnet-beta"));
          const rawNfts = await getParsedNftAccountsByOwner({
            publicAddress: publicKey,
            connection: connect,
            serialization: true,
          })
          console.log(rawNfts)
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

  useEffect(() => {
    if (publicKey && connected) {
      localStorage.setItem('walletId', publicKey.toString())
    }
  }, [publicKey, connection])

  useEffect(() => {
    if (closed) {
      localStorage.clear();
      window.location.href('/')
    }
  }, [closed])

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


  const hotels = [{ hotel_name: "PALMVERSE Tamarindo, Costa Rica", city: "Tamarido" },
  { hotel_name: "PALMVERSE Nosara, Costa Rica", city: "Nosara", },
  { hotel_name: "PALMVERSE Santa Teresa, Costa Rica", city: "Santa Teresa" },
  { hotel_name: "PALMVERSE Miami, USA", city: "Miami" }]

  const hotel = hotels[key - 1];
  let roomPrice = totals.room / solanaRate;


  const pay = async () => {
    let amount;
    if (hasNfts) {
      amount = (a.toFixed(3) - (a.toFixed(3) * .30))
    } else {
      amount = parseFloat(a.toFixed(3))
    }
    console.log(amount)
    if (!publicKey) throw new WalletNotConnectedError();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: shopAddress,
        // lamports: parseFloat(LAMPORTS_PER_SOL * amount),
        lamports: 1,
      })
    );


    await sendTransaction(transaction, connection).then((res) => {
      id = res;
      setTID(res);
      setShow(true);

      const body = {
        walletId: publicKey.toString(),
        transactionId: res,
        to: shopAddress.toString(),
        lamports: 1,
        // lamports: LAMPORTS_PER_SOL * amount,
        bookingInfo: {
          dateIn: cart.checkin,
          dateOut: cart.checkout,
          hotelName: hotel.hotel_name,
          hotelCity: hotel.city,
          price: amount,
        },
      }

      axios.post(`${process.env.REACT_APP_URL}/api/newBooking`, body).then((res) => {
        console.log('Booking has been recorded', res);
      }).catch((err) => {
        console.error('booking error', err)
      })

    }).catch(err => {
      console.error(err);
    })

  }


  const getPrice = () => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'

    };

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", requestOptions)
      .then(response => response.json())
      .then(result => {
        setSolanaRate(result.solana.usd);
      })
      .catch(error => console.log('error', error));

    setTimeout(getPrice, 5000)
  }

  useEffect(() => getPrice(), []);


  useEffect(() => {
    setA(totalAmount / solanaRate)
  }, [solanaRate])

  return (
    <div className='solcontainer' >

      <ReceiptModal show={show} setShow={setShow} tID={tID} setClosed={setClosed} />
      <PreviousBookings prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
      <CurrentBookings currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>
      <NftModal nfts={nfts} nftImages={nftImages} nftOpen={nftOpen} setNftOpen={setNftOpen}></NftModal>

      <Navbar publicKey={publicKey} setPrevTransOpen={setPrevTransOpen} setCurrentTransOpen={setCurrentTransOpen} setNftOpen={setNftOpen}></Navbar>

      <div className='body' >

        <div>
          <h5 style={{ display: "flex", justifyContent: "center" }}>
            <p style={{ marginRight: "4px" }}>Amount in USD:</p>
            {nfts.length ? (
              <div className="d-flex">
                <p
                  style={{ textDecoration: "line-through", marginRight: "8px" }}
                >
                  ${parseInt(totalAmount)}
                </p>
                <p>
                  ${parseInt(totalAmount) - (parseInt(totalAmount) * 30) / 100}{" "}
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
              display: "flex",
              justifyContent: "center",
              marginTop: "5px",
            }}
          >
            <p style={{ marginRight: "4px" }}>Amount in Sol:</p>
            {nfts.length ? (
              <div className="d-flex">
                <p
                  style={{ textDecoration: "line-through", marginRight: "8px" }}
                >
                  {solanaRate && a.toFixed(3)}
                </p>
                <p>
                  {solanaRate && (a - (solanaRate && a * 30) / 100).toFixed(3)}{" "}
                  (30% discount)
                </p>
                <p></p>
              </div>
            ) : (
              <p>{solanaRate && a.toFixed(3)}</p>
            )}
          </h5>
        </div>

        <button
          disabled={connected ? false : true}
          onClick={() => pay()}
          style={{ border: 'none', outline: 'none', padding: 0, marginTop: "2rem" }}
        >
          <img src={image} />
        </button>
        <div className='phantom' style={{ display: "flex", justifyContent: "center" }} >
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>

        <div className="details">
          <li className={styleClasses['reservation-details__totals']}>
            <div
              className={styleClasses['reservation-details__totals__item']}
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
              className={styleClasses['reservation-details__totals__item']}
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
              className={styleClasses['reservation-details__totals__item']}
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
                {roomPrice.toFixed(3)} SOL
              </span>
            </div>

            <div
              className={styleClasses['reservation-details__totals__item']}
            >
              <span
                className={
                  styleClasses['reservation-details__totals__title']
                }
              >
                Accomodation{' '}
              </span>
              <span className={
                styleClasses['reservation-details__totals__value']
              }>
                {cart.days} {cart.days && +cart.days > 1 ? 'Days' : 'Day'}
              </span>

            </div>
            {
              nfts.length > 0 ? (<div
                style={{ textAlign: 'center', display: "flex", justifyContent: "center", padding: "2rem", fontSize: "20px" }}
                className={styleClasses['reservation-details__totals__item']}
              >
                <span
                  className={
                    styleClasses['reservation-details__totals__title']
                  }
                >

                  Palmverse NFTs have been found in your wallet!
                </span>
                <br />


              </div>) : (
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
              )
            }
          </li>
        </div>
      </div>
    </div >

  )
}

export default SolanaPay