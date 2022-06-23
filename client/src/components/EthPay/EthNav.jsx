import { Dropdown, DropdownButton } from 'react-bootstrap'

export default function Navbar(props) {

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
            <div />
            <h1 style={{
                position: "absolute",
                left: "42%"
            }}>
                Pay via ETH
            </h1>
            <DropdownButton style={{
                opacity: !props.connect && "0"
            }} title="Palmverse Wallet">
                <Dropdown.Item onClick={() => props.setCurrentTransOpen(true)}>Current Bookings</Dropdown.Item>
                <Dropdown.Item onClick={() => props.setPrevTransOpen(true)}>Previous Bookings</Dropdown.Item>
                <Dropdown.Item onClick={() => props.setNftOpen(true)}>View NFTs</Dropdown.Item>
            </DropdownButton>
        </div>
    </nav>);
}