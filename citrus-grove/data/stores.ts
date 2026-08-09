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
    name: 'Sunnyvale Grove',
    address: '200 Queens Quay',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5J 2Y2',
    phone: '(416) 555-0301',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '200 Queens Quay Toronto ON M5J 2Y2',
  },
  {
    id: 's2',
    name: 'Harbour Citrus',
    address: '55 Harbour Sq',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5J 2L1',
    phone: '(416) 555-0302',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '55 Harbour Sq Toronto ON M5J 2L1',
  },
  {
    id: 's3',
    name: 'Parkdale Grove',
    address: '1267 Queen St W',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M6K 1L5',
    phone: '(416) 555-0303',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '1267 Queen St W Toronto ON M6K 1L5',
  },
];
