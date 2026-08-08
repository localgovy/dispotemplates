export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  /** Single-line summary shown on cards */
  hoursShort: string;
  /** Full hours for the detail sheet */
  hoursLines: { days: string; hours: string }[];
  mapsQuery: string;
}

export const STORES: Store[] = [
  {
    id: 's1',
    name: 'Lab Downtown',
    address: '435 Bayfield St, Unit 3',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'L4M 3B5',
    phone: '(705) 555-0142',
    hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '435 Bayfield St Unit 3 Toronto ON L4M 3B5',
  },
  {
    id: 's2',
    name: 'Lab Midtown',
    address: '82 Hurontario St',
    city: 'Mississauga',
    province: 'ON',
    postalCode: 'L9Y 2L8',
    phone: '(705) 555-0198',
    hoursShort: 'Mon–Thu 9–9 · Fri–Sat 9–10 · Sun 9–8',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '82 Hurontario St Mississauga ON L9Y 2L8',
  },
  {
    id: 's3',
    name: 'Lab Uptown',
    address: '290 King St',
    city: 'Ottawa',
    province: 'ON',
    postalCode: 'L4R 3M9',
    phone: '(705) 555-0173',
    hoursShort: 'Mon–Sat 9–9 · Sun 9–7',
    hoursLines: [{ days: 'Mon – Sun', hours: '9 am – 11 pm' }],
    mapsQuery: '290 King St Ottawa ON L4R 3M9',
  },
];
