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
    name: 'The Fifth Ave Lounge',
    address: '435 Bayfield St, Unit 3',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'L4M 3B5',
    phone: '(705) 555-0142',
        hoursShort: 'Every day  9 am – 11 pm',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 11:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 11:00 pm' },
      { days: 'Sunday', hours: '10:00 am – 11:00 pm' },
    ],
    mapsQuery: '435 Bayfield St Unit 3 Toronto ON L4M 3B5',
  },
  {
    id: 's2',
    name: 'Harbour Reserve',
    address: '82 Hurontario St',
    city: 'Hamilton',
    province: 'ON',
    postalCode: 'L9Y 2L8',
    phone: '(705) 555-0198',
        hoursShort: 'Mon–Thu 9–9 · Fri–Sat 9–10 · Sun 9–8',
    hoursLines: [
      { days: 'Monday – Thursday', hours: '9:00 am – 9:00 pm' },
      { days: 'Friday – Saturday', hours: '9:00 am – 10:00 pm' },
      { days: 'Sunday', hours: '9:00 am – 8:00 pm' },
    ],
    mapsQuery: '82 Hurontario St Hamilton ON L9Y 2L8',
  },
  {
    id: 's3',
    name: 'Oak Sanctuary',
    address: '290 King St',
    city: 'Oakville',
    province: 'ON',
    postalCode: 'L4R 3M9',
    phone: '(705) 555-0173',
        hoursShort: 'Mon–Sat 9–9 · Sun 9–7',
    hoursLines: [
      { days: 'Monday – Saturday', hours: '9:00 am – 9:00 pm' },
      { days: 'Sunday', hours: '9:00 am – 7:00 pm' },
    ],
    mapsQuery: '290 King St Oakville ON L4R 3M9',
  },
];
