import React, { useState, useEffect } from 'react';
import validatorjs from 'validator';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.scss';
import { useForm, useLocalStorage, useHotels } from 'hooks';
import { Portlet, Button, Select, TextField } from 'components';
import Moment from 'moment';
import formClasses from 'components/Form/Form.module.scss';
import axios from 'axios';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

let afterTwoDays: string | Date = new Date();
afterTwoDays.setDate(afterTwoDays.getDate() + 1);
afterTwoDays = afterTwoDays.toString();

const step: TypeStep = {
  index: 0,
  isValid: false,
  inputs: {
    hotel: {
      value: '',
      isTouched: false,
      isValid: false,
    },
    checkin: {
      value: '',
      isTouched: false,
      isValid: false,
    },
    checkout: {
      value: '',
      isTouched: false,
      isValid: false,
    },
    adults: {
      value: '1',
      isTouched: false,
      isValid: false,
    },
    children: {
      value: '0',
      isTouched: false,
      isValid: false,
    },
  },
};

const HotelDate: React.FC<TypeReservationStep> = (
  props: TypeReservationStep
) => {
  const [storedValue, setLocalStorageValue] = useLocalStorage(
    `step-${step.index}`,
    step
  );
  const [formState, inputHandler] = useForm(
    storedValue.inputs,
    storedValue.isValid
  );
  const { hotels } = useHotels();
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('' as any);
  const [endDate, setEndDate] = useState('' as any);
  const [selectedHotelId, setSelectedHotelId] = useState(1 as number);

  const activeHotelId = formState.inputs.hotel.value;
  let selectedHotelDetails: TypeHotelDetails | undefined;
  if (hotels) {
    selectedHotelDetails = hotels.details.find(
      (item: TypeHotelDetails) => item.id === activeHotelId
    );
  }

  let maxAdultSize = 5;
  if (
    selectedHotelDetails &&
    typeof selectedHotelDetails.max_adult_size !== 'undefined'
  ) {
    maxAdultSize = selectedHotelDetails.max_adult_size;
  }

  let isChildDisabled = false;
  if (
    selectedHotelDetails &&
    typeof selectedHotelDetails.child_status !== 'undefined'
  ) {
    isChildDisabled = !selectedHotelDetails.child_status;
  }

  useEffect(() => {
    const hotelData = async () => {
      try {
        const response = await axios.get(
          'https://626d39a850a310b8a34c1bd8.mockapi.io/tkn'
        );
        setAllHotels(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    hotelData();
  }, []);

  console.log(selectedHotelId);
  return (
    <>
      <section className="grid grid-cols-2 gap-4  ">
        <div className="-ml-28 pr-32   ">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={formClasses['form__wide-row']}>
              <Select
                id="hotel"
                label="Choose a hotel"
                options={
                  allHotels
                    ? allHotels.map((hotel) => ({
                        label: hotel.hotel_name,
                        value: hotel.id,
                      }))
                    : []
                }
                onChange={(
                  id: string,
                  value: any,
                  validity: boolean
                ) => {
                  inputHandler(id, value, validity);
                  localStorage.setItem('value', value);
                  setSelectedHotelId(Number(value));
                  if (!isChildDisabled) {
                    inputHandler('children', '0', true);
                  }
                  inputHandler('adults', '1', true);
                }}
                value={selectedHotelId.toString()}
                validity={formState.inputs.hotel.isValid}
                isTouched={formState.inputs.hotel.isTouched}
                validators={[
                  [validatorjs.isLength, { min: 1, max: undefined }],
                ]}
                validationMessage="Please select a hotel"
              />
            </div>
            <div className={formClasses['form__wide-row']}>
              <div className="date-picker">
                <label htmlFor="dateIn">Check-in</label>
                <DatePicker
                  selected={startDate}
                  minDate={Moment().toDate()}
                  onChange={(date: Date) => {
                    setStartDate(date);
                    inputHandler(
                      'checkin',
                      Moment(date).format('YYYY-MM-DD'),
                      true
                    );
                  }}
                  selectsStart
                  dateFormat="dd/MM/yyyy"
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="dd/MM/yyyy"
                />
              </div>
              <div className="date-picker">
                <label htmlFor="dateOut">Check-out</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date) => {
                    setEndDate(date);
                    inputHandler(
                      'checkout',
                      Moment(date).format('YYYY-MM-DD'),
                      true
                    );
                  }}
                  selectsEnd
                  dateFormat="dd/MM/yyyy"
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || Moment().toDate()}
                  placeholderText="dd/MM/yyyy"
                />
              </div>
              <TextField
                id="adults"
                type="number"
                label="Adults"
                value={formState.inputs.adults.value}
                validity={formState.inputs.adults.isValid}
                isTouched={formState.inputs.adults.isTouched}
                validators={[
                  [validatorjs.isInt, { min: 1, max: maxAdultSize }],
                ]}
                validationMessage={`Please enter a valid number between 1 and ${maxAdultSize}.`}
                onChange={inputHandler}
              />
              <TextField
                id="children"
                type="number"
                label="Children"
                value={formState.inputs.children.value}
                validity={formState.inputs.children.isValid}
                isTouched={formState.inputs.children.isTouched}
                validators={[[validatorjs.isInt, { min: 0, max: 5 }]]}
                validationMessage="Please enter a valid number between 0 and 5."
                onChange={inputHandler}
                disabled={isChildDisabled}
                disabledMessage="Children are not allowed"
              />
            </div>
            <div
              className={[
                formClasses['form__normal-row'],
                formClasses['form__actions'],
              ].join(' ')}
            >
              <Button
                type="button"
                onClick={() => {
                  if (!formState.isValid) return;
                  props.stepChangeHandler(
                    step.index,
                    formState,
                    step.index + 1
                  );
                  setLocalStorageValue({
                    ...step,
                    isValid: formState.isValid,
                    inputs: { ...formState.inputs },
                  });
                }}
                disabled={!formState.isValid}
              >
                Save and continue
              </Button>
            </div>
          </form>
        </div>
        <div
          style={{
            transform: 'scale(1.5)',
          }}
          className="mr-5 pb-10 relative  "
        >
          <div className=" flex absolute top-0  left-[38%] justify-center items-center ">
            <h1 className="text-xl font-bold uppercase px-4 text-black border-2 ">
              PALMVERSE
            </h1>
          </div>
          <ComposableMap>
            <Geographies geography="/features.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    fill={'#d1d8de'}
                    geography={geo}
                  />
                ))
              }
            </Geographies>
            {markers.map((marker, index) => {
              return (
                <Marker
                  key={index}
                  className="cursor-pointer"
                  coordinates={[marker.co[1], marker.co[0]]}
                  onClick={(e) => {
                    let hotelId = index + 1;
                    setSelectedHotelId(hotelId);
                    inputHandler('hotel', hotelId.toString(), true);
                    localStorage.setItem('value', hotelId.toString());
                    if (!isChildDisabled) {
                      inputHandler('children', '0', true);
                    }
                    inputHandler('adults', '1', true);
                  }}
                >
                  <circle r={4} fill="black" />
                  <image
                    href="/media/favicons/favicon.ico"
                    height={24}
                  />

                  <text
                    fill="black"
                    fontSize={14}
                    fontWeight="semi-bold"
                    y="35"
                    alignmentBaseline="middle"
                  >
                    {marker.name}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
      </section>
    </>
  );
};

const markers = [
  {
    name: 'Tamarido,Costa Rica',
    co: [+10.2993, -85.8371],
  },
  {
    name: 'Listbon, Portugal',
    co: [+38.7223, -9.1393],
  },
  {
    name: 'MIAMI',
    co: [+25.7617, -80.1918],
  },
];

export default HotelDate;
