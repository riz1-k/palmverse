import { Modal } from 'react-bootstrap'
import { useCart } from 'hooks';
import { Navigate } from 'react-router-dom'
export default function ReceiptModal(props) {
    const key = localStorage.getItem('value');
    const { cart } = useCart();

    const hotels = [{ hotel_name: "PALMVERSE Tamarindo, Costa Rica", city: "Tamarido" },
    { hotel_name: "PALMVERSE Nosara, Costa Rica", city: "Nosara", },
    { hotel_name: "PALMVERSE Santa Teresa, Costa Rica", city: "Santa Teresa" },
    { hotel_name: "PALMVERSE Miami, USA", city: "Miami" }]

    const hotel = hotels[key - 1];

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

        {
            props.isEth ? (
                <>
                    <Modal.Footer style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }} ><p>We hereby confirm your reservation at  {hotel.hotel_name} , {hotel.city}  on the following dates <br />  {cart.checkin} - {cart.checkout} <br /> </p> </Modal.Footer>
                    <Modal.Footer style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                        <div className='flex justify-center  flex-col' >
                            <p className='text-center' > You can view your current Bookings <span className='text-blue-500 cursor-pointer ' onClick={() => {
                                localStorage.setItem('justPayed', true);
                                window.location.href = "/";
                            }} >here</span>  </p>
                            <p>You can view your transaction details at <a href={`https://rinkeby.etherscan.io/tx/${props.tID}`} target='_blank'> etherscan</a></p>
                        </div>
                    </Modal.Footer>


                </>
            ) : (
                <>
                    <Modal.Footer style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }} ><p>We hereby confirm your reservation at  {hotel.hotel_name} , {hotel.city}  on the following dates <br />  {cart.checkin} - {cart.checkout} <br /> </p> </Modal.Footer>
                    <Modal.Footer style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                        <div className='flex justify-center  flex-col' >
                            <p className='text-center' > You can view your current Bookings <span className='text-blue-500 cursor-pointer ' onClick={() => {
                                localStorage.setItem('justPayed', true);
                                window.location.href = "/";
                            }} >here</span>  </p>
                            <p>You can view your transaction details at <a href={`https://explorer.solana.com/tx/${props.tID}?cluster=devnet`} target='_blank'> explorer.solana.com</a></p>
                        </div>
                    </Modal.Footer>
                </>
            )
        }

    </Modal>);
}