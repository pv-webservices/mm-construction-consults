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
  // Address and email as published in the company's own brand film.
  email: 'mmconstruction17@rediffmail.com',
  address: 'Ghatkopar West, Mumbai, Maharashtra 400086',
  serviceArea: 'Mumbai & Maharashtra',
  instagram: 'https://www.instagram.com/mmconstructionconsults',
  facebook: 'https://www.facebook.com/mmconstruction17/',
  // WhatsApp number explicitly confirmed by the client.
  whatsapp: '919768737810',
  url: import.meta.env.PUBLIC_SITE_URL || '',
};

// Figures taken from the client-supplied homepage design. Confirm with the client before launch.
export const stats = [
  { icon: 'building-2', value: 30, suffix: '+', label: 'Projects Completed' },
  { icon: 'smile', value: 250, suffix: '+', label: 'Happy Clients' },
  { icon: 'calendar-check', value: 8, suffix: '+', label: 'Years of Experience' },
  { icon: 'users-round', value: 100, suffix: '%', label: 'Client Satisfaction' },
];

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
