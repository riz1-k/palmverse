import { Modal, Table } from 'react-bootstrap'
import styleClasses from '../../ReservationDetails/ReservationTotals/ReservationTotals.module.scss'
import moment from 'moment';
export default function CurrentBookings(props) {

    if (localStorage.getItem('justPayed')) {
        localStorage.removeItem('justPayed');
    }

    return (<Modal show={props.currentTransOpen} onHide={() => {
        props.setCurrentTransOpen(false);
    }} size='lg'  >
        <Modal.Header closeButton><p style={{
            fontSize: "1.2rem",
            fontWeight: "bolder",
            lineHeight: "2rem"
        }}>Your Current Bookings</p></Modal.Header>
        <div style={{
            padding: "1rem 0.5rem",
            maxHeight: "90vh",
            overflowY: "scroll"
        }}>

            {
                props.currentBookings.length > 0 ? (<Table striped bordered responsive hover>
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
                            return <tr key={index}>
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
                                }}>{booking.price} <span style={{
                                    paddingLeft: "8px"
                                }}>{props.isEth ? `ETH` : `SOL`}</span></td>
                                <td style={{
                                    padding: "0.5rem 1.2rem",
                                    width: "1.2rem",
                                    textAlign: "left"
                                }}>{moment(booking.created_at).format('L')}</td>
                            </tr>
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