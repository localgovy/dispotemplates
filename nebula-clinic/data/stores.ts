export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  hoursShort: string;
  hoursLines: { days: string; hours: string }[];
  mapsQuery: string;
}

export const STORES: Store[] = [
  {
    id: 's1',
    name: 'Clinic Downtown',
    address: '120 King St W',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5H 1J9',
    phone: '(416) 555-0101',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '120 King St W Toronto ON M5H 1J9',
  },
  {
    id: 's2',
    name: 'Clinic Midtown',
    address: '800 Yonge St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M4W 2G8',
    phone: '(416) 555-0102',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '800 Yonge St Toronto ON M4W 2G8',
  },
  {
    id: 's3',
    name: 'Clinic West',
    address: '100 City Centre Dr',
    city: 'Mississauga',
    province: 'ON',
    postalCode: 'L5B 2C9',
    phone: '(905) 555-0103',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '100 City Centre Dr Mississauga ON L5B 2C9',
  },
];
