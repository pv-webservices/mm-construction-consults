// Brands whose materials the company uses, as listed by the client.
// Logos are the brands' own artwork in original colours, stored in public/images/brands/<slug>.<ext>.
// A brand without a logo file falls back to a text wordmark (see BrandShowcase.astro).
export type Brand = { slug: string; name: string };
export type BrandGroup = { id: string; icon: string; title: string; text: string; brands: Brand[] };

export const brandGroups: BrandGroup[] = [
  {
    id: 'paints', icon: 'paint-roller', title: 'Branded paints',
    text: 'Interior and exterior paint systems from India’s leading paint companies.',
    brands: [
      { slug: 'asian-paints', name: 'Asian Paints' },
      { slug: 'dulux', name: 'Dulux' },
      { slug: 'berger-paints', name: 'Berger Paints' },
      { slug: 'jotun', name: 'Jotun' },
      { slug: 'jsw-paints', name: 'JSW Paints' },
      { slug: 'birla-opus', name: 'Birla Opus' },
    ],
  },
  {
    id: 'chemicals', icon: 'flask-conical', title: 'Construction chemicals',
    text: 'Repair mortars, waterproofing, anchoring and protective systems from trusted manufacturers.',
    brands: [
      { slug: 'sika', name: 'Sika' },
      { slug: 'fosroc', name: 'Fosroc' },
      { slug: 'hilti', name: 'Hilti' },
      { slug: 'spc', name: 'SPC' },
      { slug: 'mcon', name: 'MCON' },
      { slug: 'pidilite', name: 'Pidilite' },
      { slug: 'dr-fixit', name: 'Dr. Fixit' },
      { slug: 'sunanda', name: 'Sunanda' },
      { slug: 'krishna-conchem', name: 'Krishna Conchem' },
      { slug: 'basf', name: 'BASF' },
      { slug: 'fischer', name: 'Fischer' },
      { slug: 'myk-laticrete', name: 'MYK Laticrete' },
      { slug: 'perma', name: 'Perma Construction Chemicals' },
    ],
  },
  {
    id: 'cement', icon: 'boxes', title: 'Cement & cement-based products',
    text: 'Quality-assured cement and cementitious products for repair and strengthening work.',
    brands: [
      { slug: 'acc', name: 'ACC' },
      { slug: 'ultratech', name: 'UltraTech' },
      { slug: 'ambuja', name: 'Ambuja' },
      { slug: 'jsw-cement', name: 'JSW Cement' },
      { slug: 'birla-cement', name: 'Birla Cement' },
    ],
  },
];
