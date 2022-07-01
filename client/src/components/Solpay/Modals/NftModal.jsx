import { Modal, Card } from 'react-bootstrap'
import styleClasses from '../../ReservationDetails/ReservationTotals/ReservationTotals.module.scss'
export default function NftModal(props) {
    return (<Modal show={props.nftOpen} onHide={() => {
        props.setNftOpen(false);
    }} size='lg'>
        <Modal.Header closeButton><p style={{
            fontSize: "1.2rem",
            fontWeight: "bolder",
            lineHeight: "2rem"
        }}>NFTs in your Wallet</p></Modal.Header>
        <Modal.Body>
            {props.nfts && props.nftImages.length > 0 ? <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                alignItems: "center"
            }}>
                {props.nftImages.map((nft, index) => {
                    return <div key={index}>
                        <Card style={{
                            width: "fit-content",
                            margin: "1rem"
                        }}>
                            <Card.Img variant='top' src={nft} alt={`Nft no.${index + 1}`} style={{
                                height: "140px",
                                width: "140px"
                            }} />
                            {
                                !props.isEth && (
                                    <Card.Title style={{
                                        textAlign: "center"
                                    }}>{props.nfts[index].data.name && props.nfts[index].data.name}</Card.Title>
                                )
                            }
                        </Card>

                    </div>;
                })}
            </div> : <div style={{
                textAlign: 'center',
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
                fontSize: "20px"
            }} className={styleClasses['reservation-details__totals__item']}>
                <span className={styleClasses['reservation-details__totals__title']}>
                    No Palmverse NFTs found in your wallet
                </span>


            </div>}

        </Modal.Body>
        <div style={{
            padding: "1rem",
            maxHeight: "90vh",
            overflowY: "scroll"
        }}>



        </div>
    </Modal>);
}