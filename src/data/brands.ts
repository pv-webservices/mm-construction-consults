// Brands whose materials the company uses, as listed by the client.
// Logos are the brands' own artwork in original colours, stored in public/images/brands/<slug>.<ext>.
// A brand without a logo file falls back to a text wordmark (see BrandShowcase.astro).
export type Brand = { slug: string; name: string };
export type BrandGroup = { id: string; icon: string; title: string; text: string; brands: Brand[] };

export const brandGroups: BrandGroup[] = [
  {
    id: 'paints', icon: 'paint-roller', title: 'Authorized applicator of these paint brands',
    text: 'Authorized applicator of all these brands for interior and exterior paint systems.',
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
    id: 'chemicals', icon: 'flask-conical', title: 'Authorized applicator of these construction chemical brands',
    text: 'Authorized applicator of all these brands for repair mortars, waterproofing, anchoring and protective systems.',
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
    id: 'cement', icon: 'boxes', title: 'Our trusted brands',
    text: 'Trusted cement and cementitious brands we rely on for repair and strengthening work.',
    brands: [
      { slug: 'acc', name: 'ACC' },
      { slug: 'ultratech', name: 'UltraTech' },
      { slug: 'ambuja', name: 'Ambuja' },
      { slug: 'jsw-cement', name: 'JSW Cement' },
      { slug: 'birla-cement', name: 'Birla Cement' },
    ],
  },
];
