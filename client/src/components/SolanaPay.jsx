import { useEffect, useState, useCallback } from 'react';
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
import { Modal, DropdownButton, Dropdown, Table, Card } from 'react-bootstrap'
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz"
import axios from 'axios';
import moment from 'moment';
const shopAddress = new PublicKey('HekSQzW1Yx7hiGqk41iSy8bcELLHvWn34fUe5ukyDya1')


function ReceiptModal(props) {
  return (<Modal show={props.show} onHide={() => {
    props.setShow(false);
    props.setClosed(true);
    window.location.href = "/";
  }}>
    <Modal.Header closeButton>Successful Transaction!</Modal.Header>
    <Modal.Title style={{
      fontSize: "20px",
      marginLeft: "6px",
      padding: "20px 10px"
    }}>Thank you for your reservation at Palmverse !</Modal.Title>
    <div className='code' style={{
      width: "95%"
    }}>

      <Modal.Body className='code2' style={{
        overflowX: "scroll"
      }}>Your transaction ID is :<code> {props.tID}</code> </Modal.Body>
    </div>
    <button style={{
      backgroundColor: "skyblue",
      width: "fit-content",
      margin: "auto",
      padding: "6px",
      borderRadius: "4px",
      marginBottom: "16px"
    }} onClick={() => {
      navigator.clipboard.writeText(props.tID);
      alert('Transaction ID copied to your clipboard');
    }}>Copy Transaction ID</button>

    <Modal.Footer>You can check your recently made transaction on <a href="https://solscan.io" target='_blank'>www.solscan.io</a> </Modal.Footer>
  </Modal>);
}


function PreviousBookings(props) {
  return (<Modal show={props.prevTransOpen} onHide={() => {
    props.setPrevTransOpen(false);
  }} size='lg'>
    <Modal.Header closeButton><p style={{
      fontSize: "1.2rem",
      fontWeight: "bolder",
      lineHeight: "2rem"
    }}>Your Previous Bookings</p></Modal.Header>
    <div style={{
      padding: "1rem",
      maxHeight: "90vh",
      overflowY: "scroll"
    }}>

      {
        props.previousBookings.length > 0 ? (

          <Table striped bordered responsive hover>
            <thead style={{
              padding: "5rem"
            }}>
              <tr>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>No.</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>Date In</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>Date Out</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>Hotel Name</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>City</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>Price</th>
                <th style={{
                  padding: "0.5rem 1rem",
                  width: "1.2rem",
                  textAlign: "center"
                }}>Transaction Date</th>
              </tr>
            </thead>
            <tbody>
              {props.previousBookings.map((booking, index) => {
                return <tr>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{index + 1}</td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{moment(booking.dateIn).format('L')}</td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{moment(booking.dateOut).format('L')}</td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{booking.hotelName}</td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{booking.hotelCity}</td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{booking.price}<span style={{
                    paddingLeft: "8px"
                  }}>SOL</span></td>
                  <td style={{
                    padding: "0.5rem 1.2rem",
                    width: "1.2rem",
                    textAlign: "left"
                  }}>{moment(booking.created_at).format('L')}</td>
                </tr>;
              })}
            </tbody>
          </Table>
        ) : (<div style={{
          textAlign: 'center',
          display: "flex",
          justifyContent: "center",
          padding: "2rem",
          fontSize: "20px"
        }} className={styleClasses['reservation-details__totals__item']}>
          <span className={styleClasses['reservation-details__totals__title']}>
            No Previous Bookings found in your wallet
          </span>


        </div>)
      }

    </div>
  </Modal>);
}



function CurrentBookings(props) {
  return (<Modal show={props.currentTransOpen} onHide={() => {
    props.setCurrentTransOpen(false);
  }} size='lg'>
    <Modal.Header closeButton><p style={{
      fontSize: "1.2rem",
      fontWeight: "bolder",
      lineHeight: "2rem"
    }}>Your Current Bookings</p></Modal.Header>
    <div style={{
      padding: "1rem",
      maxHeight: "90vh",
      overflowY: "scroll"
    }}>

      {
        props.currentBookings ? (<Table striped bordered responsive hover>
          <thead style={{
            padding: "5rem"
          }}>
            <tr>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>No.</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>Date In</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>Date Out</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>Hotel Name</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>City</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>Price</th>
              <th style={{
                padding: "0.5rem 1rem",
                width: "1.2rem",
                textAlign: "center"
              }}>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {props.currentBookings.map((booking, index) => {
              return <tr>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{index + 1}</td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{moment(booking.dateIn).format('L')}</td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{moment(booking.dateOut).format('L')}</td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{booking.hotelName}</td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{booking.hotelCity}</td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{booking.price}<span style={{
                  paddingLeft: "8px"
                }}>SOL</span></td>
                <td style={{
                  padding: "0.5rem 1.2rem",
                  width: "1.2rem",
                  textAlign: "left"
                }}>{moment(booking.created_at).format('L')}</td>
              </tr>;
            })}
          </tbody>
        </Table>) : (<div style={{
          textAlign: 'center',
          display: "flex",
          justifyContent: "center",
          padding: "2rem",
          fontSize: "20px"
        }} className={styleClasses['reservation-details__totals__item']}>
          <span className={styleClasses['reservation-details__totals__title']}>
            No Current Bookings found in your wallet
          </span>


        </div>)
      }


    </div>
  </Modal>);
}


function SolanaPay() {
  const [solanaRate, setSolanaRate] = useState(0)
  const { totals, cart } = useCart();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
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
  const [walletId] = useState(localStorage.getItem('walletId') && localStorage.getItem('walletId'));
  const [nftImages, setNftImages] = useState([]);
  const [nftOpen, setNftOpen] = useState(false)
  let id;

  useEffect(() => {
    axios.post("http://localhost:4000/api/auth", { walletId }).then(res => {
      res.data.user.bookings.map(x => {
        const bookingDate = moment(x.dateOut).format('L')
        const currentDate = new Date().toLocaleDateString();
        if (bookingDate >= moment(currentDate).format('L')) {
          setCurrentBookings(e => [...e, x])

        } else {
          setpreviousBookings([...previousBookings, x]);
        }
      })
    }).catch(error => console.error('wallet login error', error));
  }, [walletId])

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
          console.log(rawNfts);
          rawNfts.map(nft => {
            if (nft.data.creators[0].address === 'TeEpKTJzN3yv5sabr3Bx5xNX4u7NkaPCwrWU41wSbJk') {
              setNfts(e => [...e, nft])
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
    if (publicKey) {
      localStorage.setItem('walletId', publicKey._bn.words.toString())
    }
  }, [publicKey, connection])

  useEffect(() => console.log(nftImages), [nftImages])

  useEffect(() => {
    if (closed) {
      localStorage.clear();
      window.location.href('/')
    }
  }, [closed])

  useEffect(() => {
    if (nfts) {
      let images = []
      nfts.map(nft => {
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
  const pay = useCallback(async () => {
    let amount;
    if (nfts.length > 0) {
      amount = (a.toFixed(3) - (a.toFixed(3) * .30))
    } else {
      amount = parseFloat(a.toFixed(3))
    }
    if (!publicKey) throw new WalletNotConnectedError();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: shopAddress,
        lamports: LAMPORTS_PER_SOL * amount,
      })
    );


    await sendTransaction(transaction, connection).then((res) => {
      id = res;
      setTID(res);
      setShow(true);

      const body = {
        walletId: walletId ? walletId : localStorage.getItem('walletId'),
        bookingInfo: {
          dateIn: cart.checkin,
          dateOut: cart.checkout,
          hotelName: hotel.hotel_name,
          hotelCity: hotel.city,
          price: parseFloat(a.toFixed(3))
        }
      }

      axios.post(`http://localhost:4000/api/newBooking`, body).then((res) => {
        console.log('Booking has been recorded', res);
      }).catch(err => {
        alert('Error while Registering the booking info');
        console.error('booking error', err)
      })

    }).catch(err => {
      console.error(err);
    })

  }, [publicKey, sendTransaction, connection]);


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

  console.log(nfts)


  useEffect(() => {
    setA(totalAmount / solanaRate)
  }, [solanaRate])

  return (
    <div className='solcontainer' >
      <PreviousBookings prevTransOpen={prevTransOpen} setPrevTransOpen={setPrevTransOpen} previousBookings={previousBookings}></PreviousBookings>
      <ReceiptModal show={show} setShow={setShow} tID={tID} setClosed={setClosed} />
      <CurrentBookings currentTransOpen={currentTransOpen} setCurrentTransOpen={setCurrentTransOpen} currentBookings={currentBookings}></CurrentBookings>
      <Modal show={nftOpen} onHide={() => {
        setNftOpen(false);
      }} size='lg'>
        <Modal.Header closeButton><p style={{
          fontSize: "1.2rem",
          fontWeight: "bolder",
          lineHeight: "2rem"
        }}>NFTs in your Wallet</p></Modal.Header>
        <Modal.Body>
          {
            nfts && nftImages.length > 0 ? (<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-evenly", alignItems: "center" }}>
              {
                nftImages.map((nft, index) => {
                  return <>
                    <Card style={{ width: "fit-content", margin: "1rem" }} >
                      <Card.Img variant='top' src={nft} alt={`Nft no.${index + 1}`} style={{ height: "140px", width: "140px" }} />
                      <Card.Title style={{ textAlign: "center" }} >{nfts[index].data.name}</Card.Title>
                    </Card>

                  </>

                })
              }
            </div>) : (<div style={{
              textAlign: 'center',
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
              fontSize: "20px"
            }} className={styleClasses['reservation-details__totals__item']}>
              <span className={styleClasses['reservation-details__totals__title']}>
                No Palmverse NFTs in your wallet
              </span>


            </div>)
          }

        </Modal.Body>
        <div style={{
          padding: "1rem",
          maxHeight: "90vh",
          overflowY: "scroll"
        }}>



        </div>
      </Modal>
      <nav className='head'>

        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", position: "relative", padding: "12px 0" }}>
          <div ></div>
          <h1 style={{ position: "absolute", left: "42%" }} >
            Pay via Solana
          </h1>
          <DropdownButton style={{ opacity: !publicKey && "0" }} title="Palmverse Wallet" >
            <Dropdown.Item onClick={() => setCurrentTransOpen(true)} >Current Bookings</Dropdown.Item>
            <Dropdown.Item onClick={() => setPrevTransOpen(true)} >Previous Bookings</Dropdown.Item>
            <Dropdown.Item onClick={() => setNftOpen(true)} >View NFTs</Dropdown.Item>
          </DropdownButton>
        </div>
      </nav>
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