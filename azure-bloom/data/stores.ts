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
    name: 'Azure Annex',
    address: '90 Elgin St',
    city: 'Ottawa',
    province: 'ON',
    postalCode: 'K1P 5E1',
    phone: '(613) 555-0401',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '90 Elgin St Ottawa ON K1P 5E1',
  },
  {
    id: 's2',
    name: 'Bloom Market',
    address: '240 Sparks St',
    city: 'Ottawa',
    province: 'ON',
    postalCode: 'K1P 5B2',
    phone: '(613) 555-0402',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '240 Sparks St Ottawa ON K1P 5B2',
  },
  {
    id: 's3',
    name: 'Canal Bloom',
    address: '1 Rideau St',
    city: 'Ottawa',
    province: 'ON',
    postalCode: 'K1N 8S7',
    phone: '(613) 555-0403',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '1 Rideau St Ottawa ON K1N 8S7',
  },
];
