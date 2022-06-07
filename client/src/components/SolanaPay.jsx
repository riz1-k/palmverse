// import { useEffect, useState, useCallback } from "react";
// import { useCart } from "hooks";
// import {
//   PublicKey,
//   Transaction,
//   SystemProgram,
//   LAMPORTS_PER_SOL,
//   clusterApiUrl,
// } from "@solana/web3.js";
// import image from "../components/pay.png";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import {
//   WalletMultiButton,
//   WalletModalProvider,
// } from "@solana/wallet-adapter-react-ui";
// import styleClasses from "../components/ReservationDetails/ReservationTotals/ReservationTotals.module.scss";
// import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
// import "./sol.css";
// import { Modal } from "react-bootstrap";
// import {
//   getParsedNftAccountsByOwner,
//   createConnectionConfig,
// } from "@nfteyez/sol-rayz";
// import axios from "axios";

// const shopAddress = new PublicKey(
//   "HekSQzW1Yx7hiGqk41iSy8bcELLHvWn34fUe5ukyDya1"
// );

// function SolanaPay() {
//   const [solanaRate, setSolanaRate] = useState(0);
//   const { totals, cart } = useCart();
//   const { connection } = useConnection();
//   const { publicKey, sendTransaction } = useWallet();
//   const totalAmount = totals.total.toFixed(2);
//   const key = localStorage.getItem("value");
//   const [show, setShow] = useState(false);
//   const [tID, setTID] = useState("");
//   const [closed, setClosed] = useState(false);
//   const [a, setA] = useState();
//   const [nfts, setNfts] = useState([]);
//   let id;

//   useEffect(() => {
//     const getAllNftData = async () => {
//       try {
//         if (connection && publicKey) {
//           const connect = createConnectionConfig(clusterApiUrl("devnet"));
//           const allnfts = await getParsedNftAccountsByOwner({
//             publicAddress: publicKey,
//             connection: connect,
//             serialization: true,
//           });
//           setNfts(allnfts.filter(nft => nft.data.symbol === 'PLM'));
//           return nfts;
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     getAllNftData();
//   }, [connection, publicKey]);

//   useEffect(() => {
//     if (closed) {
//       localStorage.clear();
//       window.location.href("/");
//     }
//   }, [closed]);

//   const hotels = [
//     { hotel_name: "PALMVERSE Tamarindo, Costa Rica", city: "Tamarido" },
//     { hotel_name: "PALMVERSE Nosara, Costa Rica", city: "Nosara" },
//     { hotel_name: "PALMVERSE Santa Teresa, Costa Rica", city: "Santa Teresa" },
//     { hotel_name: "PALMVERSE Miami, USA", city: "Miami" },
//   ];

//   const hotel = hotels[key - 1];
//   let roomPrice = totals.room / solanaRate;

//   const pay = useCallback(async () => {
//     if (!publicKey) throw new WalletNotConnectedError();
//     console.log(publicKey)
//     let amount;

//     if (nfts.length > 0) {
//       amount = a.toFixed(3) - (a.toFixed(3) * .30)
//     } else {
//       amount = a.toFixed(3)
//     }
//     const transaction = new Transaction().add(
//       SystemProgram.transfer({
//         fromPubkey: publicKey,
//         toPubkey: shopAddress,
//         lamports: LAMPORTS_PER_SOL * amount,
//       })
//     );


//     const signature = await sendTransaction(transaction, connection)
//       .then((res) => {
//         id = res;
//         setTID(res);
//         setShow(true);
//       })

//     const body = {
//       walletId: publicKey,
//       bookingInfo: {
//         dateIn: cart.checkin,
//         dateOut: cart.checkout,
//         hotelName: hotel.hotel_name,
//         hotelCity: hotel.city,
//         price: a.toFixed(3)
//       }
//     }


//     await connection.confirmTransaction(signature, "processed").then((res => {
//       console.log(res);
//       axios.post(`http://localhost:4000/api/newBooking`, body).then((res) => {
//         console.log('Booking has been recorded', res);
//       })
//     }))

//   }, [publicKey, sendTransaction, connection]);

//   console.log(connection               )


//   const getPrice = () => {
//     var requestOptions = {
//       method: "GET",
//       redirect: "follow",
//     };

//     fetch(
//       "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
//       requestOptions
//     )
//       .then((response) => response.json())
//       .then((result) => {
//         setSolanaRate(result.solana.usd);
//       })
//       .catch((error) => console.log("error", error));

//     setTimeout(getPrice, 500);
//   };

//   getPrice();


//   useEffect(() => {
//     setA(totalAmount / solanaRate);
//   }, [solanaRate]);

//   return (
//     <div className="solcontainer">
//       <Modal
//         show={show}
//         onHide={() => {
//           setShow(false);
//           setClosed(true);
//           window.location.href = "/";
//         }}
//       >
//         <Modal.Header closeButton>Successful Transaction!</Modal.Header>
//         <Modal.Title
//           style={{ fontSize: "20px", marginLeft: "6px", padding: "20px 10px" }}
//         >
//           Thank you for your reservation at Palmverse !
//         </Modal.Title>
//         <div className="code" style={{ width: "95%" }}>
//           <Modal.Body className="code2" style={{ overflowX: "scroll" }}>
//             Your transaction ID is :<code> {tID}</code>{" "}
//           </Modal.Body>
//         </div>
//         <button
//           style={{
//             backgroundColor: "skyblue",
//             width: "fit-content",
//             margin: "auto",
//             padding: "6px",
//             borderRadius: "4px",
//             marginBottom: "16px",
//           }}
//           onClick={() => {
//             navigator.clipboard.writeText(tID);
//             alert("Transaction ID copied to your clipboard");
//           }}
//         >
//           Copy Transaction ID
//         </button>

//         <Modal.Footer>
//           You can check your recently made transaction on{" "}
//           <a href="https://solscan.io" target="_blank">
//             www.solscan.io
//           </a>{" "}
//         </Modal.Footer>
//       </Modal>
//       <div className="head">
//         <h1>Pay via Solana</h1>
//       </div>
//       <div className="body">
//         <div>
//           <h5 style={{ display: "flex", justifyContent: "center" }}>
//             <p style={{ marginRight: "4px" }}>Amount in USD:</p>
//             {nfts.length ? (
//               <div className="d-flex">
//                 <p
//                   style={{ textDecoration: "line-through", marginRight: "8px" }}
//                 >
//                   ${parseInt(totalAmount)}
//                 </p>
//                 <p>
//                   ${parseInt(totalAmount) - (parseInt(totalAmount) * 30) / 100}{" "}
//                   (30% discount)
//                 </p>
//                 <p></p>
//               </div>
//             ) : (
//               <p>${parseInt(totalAmount)}</p>
//             )}
//           </h5>
//           <h5
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               marginTop: "5px",
//             }}
//           >
//             <p style={{ marginRight: "4px" }}>Amount in Sol:</p>
//             {nfts.length ? (
//               <div className="d-flex">
//                 <p
//                   style={{ textDecoration: "line-through", marginRight: "8px" }}
//                 >
//                   {solanaRate && a.toFixed(3)}
//                 </p>
//                 <p>
//                   {solanaRate && (a - (solanaRate && a * 30) / 100).toFixed(3)}{" "}
//                   (30% discount)
//                 </p>
//                 <p></p>
//               </div>
//             ) : (
//               <p>{solanaRate && a.toFixed(3)}</p>
//             )}
//           </h5>
//         </div>
//         <button
//           onClick={() => pay()}
//           style={{
//             border: "none",
//             outline: "none",
//             padding: 0,
//             marginTop: "2rem",
//           }}
//         >
//           <img src={image} />
//         </button>
//         <button className="phantom">
//           <WalletModalProvider>
//             <WalletMultiButton />
//           </WalletModalProvider>
//         </button>

//         <div className="details">
//           <li className={styleClasses["reservation-details__totals"]}>
//             <div className={styleClasses["reservation-details__totals__item"]}>
//               <span
//                 className={styleClasses["reservation-details__totals__title"]}
//               >
//                 Hotel name
//               </span>
//               <span
//                 className={styleClasses["reservation-details__totals__value"]}
//               >
//                 {hotel.hotel_name}
//               </span>
//             </div>
//             <div className={styleClasses["reservation-details__totals__item"]}>
//               <span
//                 className={styleClasses["reservation-details__totals__title"]}
//               >
//                 City
//               </span>
//               <span
//                 className={styleClasses["reservation-details__totals__value"]}
//               >
//                 {hotel.city}
//               </span>
//             </div>
//             <div className={styleClasses["reservation-details__totals__item"]}>
//               <span
//                 className={styleClasses["reservation-details__totals__title"]}
//               >
//                 Room price
//               </span>
//               <span
//                 className={styleClasses["reservation-details__totals__value"]}
//               >
//                 {roomPrice.toFixed(3)} SOL
//               </span>
//             </div>

//             <div className={styleClasses["reservation-details__totals__item"]}>
//               <span
//                 className={styleClasses["reservation-details__totals__title"]}
//               >
//                 Accomodation{" "}
//               </span>
//               <span
//                 className={styleClasses["reservation-details__totals__value"]}
//               >
//                 {cart.days} {cart.days && +cart.days > 1 ? "Days" : "Day"}
//               </span>
//             </div>
//             {nfts.length > 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "2rem",
//                   fontSize: "24px",
//                 }}
//                 className={styleClasses["reservation-details__totals__item"]}
//               >
//                 Palmverse NFTs found
//               </div>
//             ) : (
//               <div
//                 style={{
//                   textAlign: "center",
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "2rem",
//                   fontSize: "24px",
//                 }}
//                 className={styleClasses["reservation-details__totals__item"]}
//               >
//                 <span
//                   className={styleClasses["reservation-details__totals__title"]}
//                 >
//                   No Palmverse NFTs are found in your wallet
//                 </span>
//               </div>
//             )}
//           </li>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SolanaPay;


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
import { Modal } from 'react-bootstrap'
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz"

const shopAddress = new PublicKey('HekSQzW1Yx7hiGqk41iSy8bcELLHvWn34fUe5ukyDya1')

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
  const [nfts, setNfts] = useState([])
  const [walletId, setWalletId] = useState('')

  let id;

  useEffect(() => {
    const getAllNftData = async () => {
      try {
        if (connection && publicKey) {
          setWalletId(publicKey._bn.words.toString())
          const connect = await createConnectionConfig(clusterApiUrl("devnet"))
          const result = await isValidSolanaAddress(publicKey);
          console.log(connect);
          console.log("result", result);
          const nfts = await getParsedNftAccountsByOwner({
            publicAddress: publicKey,
            connection: connect,
            serialization: true,
          })
          setNfts(nfts)
          return nfts;
        }
      } catch (error) {
        console.log(error);
      }
    }

    getAllNftData()
  }, [connection, publicKey])


  useEffect(() => {
    if (closed) {
      localStorage.clear();
      window.location.href('/')
    }
  }, [closed])
  const hotels = [{ hotel_name: "PALMVERSE Tamarindo, Costa Rica", city: "Tamarido" },
  { hotel_name: "PALMVERSE Nosara, Costa Rica", city: "Nosara", },
  { hotel_name: "PALMVERSE Santa Teresa, Costa Rica", city: "Santa Teresa" },
  { hotel_name: "PALMVERSE Miami, USA", city: "Miami" }]

  const hotel = hotels[key - 1];

  let roomPrice = totals.room / solanaRate;

  const pay = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    let amount = 0;
    console.log(a)
    if (nfts.length > 0) {
      amount = a.toFixed(3) - (a.toFixed(3) * .30)
      console.log(parseFloat(amount))
    } else {
      amount = a.toFixed(3)
    }
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: shopAddress,
        lamports: LAMPORTS_PER_SOL * parseFloat(amount)
      })
    );



    const signature = await sendTransaction(transaction, connection).then((res) => {
      id = res;
      setTID(res);
      setShow(true);

    }).catch(err => {
      // alert('Something went wrong')
      console.error(err);
    })

    await connection.confirmTransaction(signature, 'processed').then((response) => {
      console.log(response);
      const body = {
        walletId: publicKey,
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
      })
    }).catch(err => {
      alert('Something went wrong');
      console.error(err)
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
  useEffect(() => getPrice(), [])



  useEffect(() => {
    setA(totalAmount / solanaRate)
  }, [solanaRate])
  return (
    <div className="solcontainer">
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setClosed(true);
          window.location.href = "/";
        }}
      >
        <Modal.Header closeButton>Successful Transaction!</Modal.Header>
        <Modal.Title
          style={{ fontSize: "20px", marginLeft: "6px", padding: "20px 10px" }}
        >
          Thank you for your reservation at Palmverse !
        </Modal.Title>
        <div className="code" style={{ width: "95%" }}>
          <Modal.Body className="code2" style={{ overflowX: "scroll" }}>
            Your transaction ID is :<code> {tID}</code>{" "}
          </Modal.Body>
        </div>
        <button
          style={{
            backgroundColor: "skyblue",
            width: "fit-content",
            margin: "auto",
            padding: "6px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
          onClick={() => {
            navigator.clipboard.writeText(tID);
            alert("Transaction ID copied to your clipboard");
          }}
        >
          Copy Transaction ID
        </button>

        <Modal.Footer>
          You can check your recently made transaction on{" "}
          <a href="https://solscan.io" target="_blank">
            www.solscan.io
          </a>{" "}
        </Modal.Footer>
      </Modal>
      <div className="head">
        <h1>Pay via Solana</h1>
      </div>
      <div className="body">
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
          style={{
            border: "none",
            outline: "none",
            padding: 0,
            marginTop: "2rem",
          }}
        >
          <img src={image} />
        </button>
        <button className="phantom">
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </button>

        <div className="details">
          <li className={styleClasses["reservation-details__totals"]}>
            <div className={styleClasses["reservation-details__totals__item"]}>
              <span
                className={styleClasses["reservation-details__totals__title"]}
              >
                Hotel name
              </span>
              <span
                className={styleClasses["reservation-details__totals__value"]}
              >
                {hotel.hotel_name}
              </span>
            </div>
            <div className={styleClasses["reservation-details__totals__item"]}>
              <span
                className={styleClasses["reservation-details__totals__title"]}
              >
                City
              </span>
              <span
                className={styleClasses["reservation-details__totals__value"]}
              >
                {hotel.city}
              </span>
            </div>
            <div className={styleClasses["reservation-details__totals__item"]}>
              <span
                className={styleClasses["reservation-details__totals__title"]}
              >
                Room price
              </span>
              <span
                className={styleClasses["reservation-details__totals__value"]}
              >
                {roomPrice.toFixed(3)} SOL
              </span>
            </div>

            <div className={styleClasses["reservation-details__totals__item"]}>
              <span
                className={styleClasses["reservation-details__totals__title"]}
              >
                Accomodation{" "}
              </span>
              <span
                className={styleClasses["reservation-details__totals__value"]}
              >
                {cart.days} {cart.days && +cart.days > 1 ? "Days" : "Day"}
              </span>
            </div>
            {nfts.length > 0 ? (
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                  fontSize: "24px",
                }}
                className={styleClasses["reservation-details__totals__item"]}
              >
                Palmverse NFTs found
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                  fontSize: "24px",
                }}
                className={styleClasses["reservation-details__totals__item"]}
              >
                <span
                  className={styleClasses["reservation-details__totals__title"]}
                >
                  No Palmverse NFTs are found in your wallet
                </span>
              </div>
            )}
          </li>
        </div>
      </div>
    </div>
  );
}

export default SolanaPay