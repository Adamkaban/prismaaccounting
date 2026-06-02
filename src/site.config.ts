export const SITE = {
  name: 'Prisma Accounting',
  legalName: 'Prisma Accounting',
  url: 'https://prismaaccounting.com',
  defaultTitle: 'Toronto Accounting & Tax Help',
  defaultDescription:
    'Personal tax (T1), corporate tax (T2), HST, payroll, and bookkeeping for small businesses and self-employed in Toronto, Ontario. CRA-ready filing, transparent CAD pricing.',
  locale: 'en-CA',
  geoRegion: 'CA-ON',
  geoPlacename: 'Toronto',
  currency: 'CAD',
  address: {
    streetAddress: '150 King St W, Suite 200',
    locality: 'Toronto',
    region: 'ON',
    postalCode: 'M5H 1J9',
    country: 'CA',
    lat: 43.6532,
    lng: -79.3832,
  },
  contact: {
    email: 'support@prismaaccounting.com',
  },
  cta: {
    primary: 'Get a free quote',
    anchor: '#quote',
  },
  tally: {
    // was 'TALLY_FORM_ID' placeholder — fixed to match actual form URL
    formId: '5BMl8Q',
    height: 720,
  },
  social: {
    ogImage: '/og-default.png',
  },
} as const;

export type ServiceSlug =
  | 'personal-tax-t1'
  | 'corporate-tax-t2'
  | 'hst-gst'
  | 'payroll'
  | 'corporation-registration'
  | 'bookkeeping';

export interface ServiceCard {
  slug: ServiceSlug;
  title: string;
  oneLiner: string;
  href: string;
  available: boolean;
}

export const SERVICES: ServiceCard[] = [
  {
    slug: 'personal-tax-t1',
    title: 'Personal Tax (T1)',
    oneLiner: 'Slips, deductions, CRA NETFILE. Fast turnarounds.',
    href: '/services/personal-tax-t1/',
    available: true,
  },
  {
    slug: 'corporate-tax-t2',
    title: 'Corporate Tax (T2)',
    oneLiner: 'T2 returns, financial statements, schedules.',
    href: '/services/corporate-tax-t2/',
    available: true,
  },
  {
    slug: 'hst-gst',
    title: 'HST / GST',
    oneLiner: 'Registration, filings, input tax credits.',
    href: '/services/hst-gst/',
    available: true,
  },
  {
    slug: 'payroll',
    title: 'Payroll',
    oneLiner: 'Monthly run, T4 slips, CRA remittances.',
    href: '/services/payroll/',
    available: true,
  },
  {
    slug: 'corporation-registration',
    title: 'Incorporation',
    oneLiner: 'Federal or Ontario corp setup, articles, minutes.',
    href: '/services/corporation-registration/',
    available: true,
  },
  {
    slug: 'bookkeeping',
    title: 'Bookkeeping',
    oneLiner: 'Monthly clean books in QuickBooks or Xero.',
    href: '/services/bookkeeping/',
    available: true,
  },
];

export const NAV = [
  { label: 'Services', href: '/services/' },
  { label: 'Process', href: '/#process' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Calculator', href: '/tools/salary-vs-dividend/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const FOOTER_LINKS = {
  services: SERVICES.map((s) => ({ label: s.title, href: s.href })),
  company: [
    { label: 'About', href: '/about/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Salary vs Dividend', href: '/tools/salary-vs-dividend/' },
  ],
};
