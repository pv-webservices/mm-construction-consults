export const site = {
  name: 'M.M. Construction & Consults',
  founder: 'Er. Mukesh Triveni Gupta',
  founderRole: 'Founder · Structural Consultant & Contractor',
  tagline: 'Structural Solutions for a Safer Tomorrow',
  phones: [
    { label: '+91 97687 37810', href: 'tel:+919768737810' },
    { label: '+91 91525 17810', href: 'tel:+919152517810' },
    { label: '022-2512 0488', href: 'tel:+912225120488' },
  ],
  // Address and emails confirmed by the client (Oct 2026). Contact-form enquiries go to `email`.
  email: 'info@mmconstructionconsults.com',
  emails: ['info@mmconstructionconsults.com', 'sales@mmconstructionconsults.com', 'mmconstructionconsults@gmail.com'],
  address: 'A-28, Subhash Udyog Association, JMM Road, Subhash Nagar, Asalpha, Khairani Road, Ghatkopar West, Mumbai 400084',
  addressShort: 'Ghatkopar West, Mumbai 400084',
  streetAddress: 'A-28, Subhash Udyog Association, JMM Road, Subhash Nagar, Asalpha, Khairani Road',
  locality: 'Ghatkopar West, Mumbai',
  postalCode: '400084',
  // Map embed + directions search; resolves to the company's own Google Business listing in this building.
  mapQuery: 'M.M. Construction & Consults, Subhash Udyog Association, Ghatkopar West, Mumbai 400084',
  foundedYear: 2016,
  serviceArea: 'Mumbai & Maharashtra',
  instagram: 'https://www.instagram.com/mmconstructionconsults',
  facebook: 'https://www.facebook.com/mmconstruction17/',
  // WhatsApp number explicitly confirmed by the client.
  whatsapp: '919768737810',
  url: import.meta.env.PUBLIC_SITE_URL || '',
};

// Projects/clients/satisfaction come from the client-supplied homepage design; experience confirmed by the client.
export const stats = [
  { icon: 'building-2', value: 30, suffix: '+', label: 'Projects Completed' },
  { icon: 'smile', value: 250, suffix: '+', label: 'Happy Clients' },
  { icon: 'calendar-check', value: 10, suffix: '+', label: 'Years of Experience' },
  { icon: 'users-round', value: 100, suffix: '%', label: 'Client Satisfaction' },
];

// Headline achievement confirmed by the client. Shown in full zeros, without crore/lakh or comma formatting.
export const auditAchievement = {
  value: 60000000,
  suffix: '+',
  unit: 'sq ft',
  period: '2016 – 2026',
  label: 'Structural assessment & structural audit completed',
};

// ISO certificate supplied by the client.
export const certificate = {
  image: '/images/optimized/certificate.webp',
  standard: 'ISO 9001:2015',
  title: 'Quality Management System',
  number: 'QMS/16CB/0224',
  issued: '23 February 2024',
  expires: '22 February 2027',
  issuer: 'Quality Control Certification (QCC)',
  scope: 'Structural auditing, NDT testing, industrial auditing, commercial building auditing, strengthening of structures, rehabilitation, restoration, retrofitting, building repairs, interior and architecture works.',
};

export const navigation: { name: string; href: string; children?: boolean }[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services', children: true },
  { name: 'NDT Testing', href: '/ndt-services' },
  { name: 'Projects', href: '/projects' },
  { name: 'Videos', href: '/videos' },
  { name: 'Contact', href: '/contact' },
];

export const trust = [
  { icon: 'shield-check', title: 'Quality', text: 'Workmanship' },
  { icon: 'users-round', title: 'Experienced', text: 'Engineering Team' },
  { icon: 'clock-3', title: 'On-Time', text: 'Project Delivery' },
  { icon: 'chart-column-increasing', title: 'Reliable', text: 'Structural Solutions' },
  { icon: 'handshake', title: 'Client-Centric', text: 'Approach' },
];

export const values = [
  { icon: 'shield-check', title: 'Safe', text: 'Planned access, PPE and a safety-first site routine.' },
  { icon: 'layers', title: 'Durable', text: 'We treat the cause, not just the visible symptom.' },
  { icon: 'badge-check', title: 'Reliable', text: 'Clear scope, honest findings and committed timelines.' },
  { icon: 'indian-rupee', title: 'Cost-Effective', text: 'The right repair for the problem — nothing unnecessary.' },
];

export const process = [
  { icon: 'scan-search', title: 'Site Inspection', text: 'Understand the structure and identify visible concerns.' },
  { icon: 'clipboard-list', title: 'Detailed Assessment', text: 'Technical evaluation using modern NDT tools.' },
  { icon: 'pencil-ruler', title: 'Customised Solution', text: 'Plan repairs or strengthening as per requirement.' },
  { icon: 'hard-hat', title: 'Quality Execution', text: 'Work carried out by skilled, supervised teams.' },
  { icon: 'shield-check', title: 'Post-Work Support', text: 'Guidance for long-term performance and safety.' },
];

export const highlights = [
  { icon: 'shield-check', title: 'Safety', text: 'First Approach' },
  { icon: 'user-round-check', title: 'Experienced', text: 'Engineering Team' },
  { icon: 'scan-line', title: 'Modern', text: 'Testing Equipment' },
  { icon: 'pencil-ruler', title: 'Customised', text: 'Solutions' },
  { icon: 'indian-rupee', title: 'Cost-Effective', text: 'Execution' },
  { icon: 'clock-3', title: 'On-Time', text: 'Project Delivery' },
];
