import React from 'react';

import { useHotels, useCart } from 'hooks';
import ReservationDetailsItem from './ReservationDetailsItem';
import ReservationCoupon from './ReservationCoupon';
import ReservationTotals from './ReservationTotals';

import styleClasses from './ReservationDetails.module.scss';
import itemStyleClasses from './ReservationDetailsItem/ReservationDetailsItem.module.scss';
import { Card } from 'react-bootstrap';

type TypeDetail =
  | 'checkin'
  | 'checkout'
  | 'days'
  | 'adults'
  | 'children'
  | 'room'
  | 'view'
  | 'coupon'
  | 'totals';
type TypeReservationDetailsProps = {
  show: TypeDetail[];
  type?: 'boxes';
};

const ReservationDetails: React.FC<TypeReservationDetailsProps> = (
  props: TypeReservationDetailsProps
) => {
  const { roomDetails, selectedHotel } = useHotels();
  const { cart } = useCart();

  if (!cart.hotelId) return null;

  const renderDetailsItem = (key: TypeDetail) => {
    if (
      !cart.checkin ||
      !cart.checkout ||
      !cart.days ||
      !cart.days ||
      !cart.adults ||
      !cart.children
    )
      return null;

    const items: any = {
      checkin: (
        <ReservationDetailsItem
          title="Check-in date"
          value={cart.checkin}
        />
      ),
      checkout: (
        <ReservationDetailsItem
          title="Check-out date"
          value={cart.checkout}
        />
      ),
      days: (
        <ReservationDetailsItem
          title="Duration"
          value={`${cart.days} Days`}
        />
      ),
      adults: (
        <ReservationDetailsItem title="Adults" value={cart.adults} />
      ),
      children: (
        <ReservationDetailsItem
          title="Children"
          value={cart.children}
        />
      ),
      room:
        !!roomDetails && roomDetails.type ? (
          <ReservationDetailsItem
            title="Room"
            value={roomDetails.type.title}
          />
        ) : null,

      coupon: <ReservationCoupon />,
      totals: <ReservationTotals />,
    };

    if (props.show.includes(key)) {
      return items[key];
    }

    return null;
  };

  const elClasses = [styleClasses['reservation-details']];
  if (props.type) {
    elClasses.push(itemStyleClasses['reservation-details--boxes']);
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
  const hotelId: string = selectedHotel?.details?.id!;

  console.log(selectedHotel);
  return (
    <div
      style={{
        marginRight: '5rem',
        padding: '1rem 2rem',
        backgroundColor: 'white',
      }}
      className={elClasses.join(' ')}
    >
      <h2
        className={styleClasses['reservation-details__title']}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <p>
          {!!hotels ? hotels[Number(hotelId) - 1].hotel_name : ''}{' '}
        </p>
        {!!hotels && (
          <span>{`(${hotels[Number(hotelId) - 1].city})`}</span>
        )}
      </h2>
      <ul className="flex flex-col space-y-2">
        {renderDetailsItem('checkin')}
        {renderDetailsItem('checkout')}
        {renderDetailsItem('days')}
        {renderDetailsItem('adults')}
        {renderDetailsItem('children')}
        {renderDetailsItem('room')}
        {renderDetailsItem('view')}
        {renderDetailsItem('coupon')}
        {renderDetailsItem('totals')}
      </ul>
    </div>
  );
};

export default ReservationDetails;
