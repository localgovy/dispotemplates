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
    name: 'Downtown Seattle',
    address: '1420 1st Ave',
    city: 'Seattle',
    province: 'ON',
    postalCode: '98101',
    phone: '(206) 555-0201',
    hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '1420 1st Ave Seattle ON 98101',
  },
  {
    id: 's2',
    name: 'Capitol Hill',
    address: '512 Broadway E',
    city: 'Seattle',
    province: 'ON',
    postalCode: '98102',
    phone: '(206) 555-0202',
    hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '512 Broadway E Seattle ON 98102',
  },
  {
    id: 's3',
    name: 'Bellevue Grove',
    address: '88 Bellevue Way',
    city: 'Bellevue',
    province: 'ON',
    postalCode: '98004',
    phone: '(425) 555-0203',
    hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '88 Bellevue Way Bellevue ON 98004',
  },
];
