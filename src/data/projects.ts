export type Project = {
  slug: string; title: string; category: string; location: string; image: string; alt: string;
  description: string; gallery: string[]; service: string; video: string; note: string;
  /** Approximate contract value as confirmed by the client, e.g. "₹75+ Lakhs". */
  value?: string;
  /** Main elements of the work, shown on the project page. */
  scope: string[];
};

const SOCIETY_NOTE = 'Project value as confirmed by M.M. Construction & Consults. The scope summary is based on the site photographs; detailed specifications belong to the society’s contract documents.';
const img = (name: string) => `/images/optimized/${name}.webp`;

export const projects: Project[] = [
  {
    slug: 'park-corner-sagar-shilp-chs', title: 'Park Corner Sagar Shilp CHS', category: 'Repair & Repainting', location: 'Dadar, Mumbai', value: '₹75+ Lakhs',
    image: img('project-park-corner-1'), alt: 'Park Corner Sagar Shilp CHS in Dadar before and after external repair and repainting',
    description: 'Complete external repair and repainting of a residential society building in Dadar — from a weathered, stained facade to a clean, protected finish.',
    gallery: [img('project-park-corner-1')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Condition survey of the external facade', 'External plaster and concrete repairs', 'Crack treatment and surface preparation', 'Exterior repainting with branded paints'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'kapil-ratna-chs', title: 'Kapil Ratna CHS', category: 'Rehabilitation', location: 'Dadar, Mumbai', value: '₹45+ Lakhs',
    image: img('project-kapil-ratna-1'), alt: 'Kapil Ratna CHS in Dadar under full-height scaffolding during structural repair work',
    description: 'Structural repair and rehabilitation of a multistorey society building in Dadar, carried out from full-height scaffolding with safety netting.',
    gallery: [img('project-kapil-ratna-1'), img('project-kapil-ratna-2')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Full-height scaffolding and safety netting', 'Removal of loose and damaged plaster', 'RCC and external plaster repairs', 'Surface protection and finishing'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'himgiri-sai-shyam-chs', title: 'Himgiri Sai Shyam CHS', category: 'Repair & Repainting', location: 'Virar, Maharashtra', value: '₹75+ Lakhs',
    image: img('project-himgiri-sai-shyam-1'), alt: 'Himgiri Sai Shyam CHS in Virar after external repair and repainting',
    description: 'External repair and repainting of a residential society in Virar, finished in a fresh multi-tone colour scheme.',
    gallery: [img('project-himgiri-sai-shyam-1')], service: 'external-painting', video: '',
    scope: ['External plaster and crack repairs', 'Surface preparation and primer', 'Weatherproof exterior repainting', 'Multi-tone facade colour scheme'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'atharva-heights-chs', title: 'Atharva Heights CHS', category: 'Repair & Repainting', location: 'Virar, Maharashtra', value: '₹75+ Lakhs',
    image: img('project-atharva-heights-1'), alt: 'Atharva Heights CHS in Virar, a long mixed-use building after external repair and repainting',
    description: 'External repair and repainting of a large mixed-use society building in Virar, with shops at ground level and residences above.',
    gallery: [img('project-atharva-heights-1'), img('project-atharva-heights-2')], service: 'external-painting', video: 'project-atharva-heights',
    scope: ['External repairs along the full building length', 'Crack treatment and surface preparation', 'Weatherproof exterior repainting', 'Work planned around active ground-floor shops'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'hamza-tower', title: 'Hamza Tower', category: 'Rehabilitation', location: 'Mazgaon, Mumbai', value: '₹75+ Lakhs',
    image: img('project-hamza-tower-1'), alt: 'Hamza Tower in Mazgaon under full-height scaffolding during repair and repainting',
    description: 'Repair and repainting of a high-rise residential tower in Mazgaon, including its decorative jali facade, worked from full-height scaffolding.',
    gallery: [img('project-hamza-tower-1'), img('project-hamza-tower-2'), img('project-hamza-tower-3')], service: 'structural-repairs-rehabilitation', video: 'project-hamza-tower',
    scope: ['Full-height scaffolding on a high-rise tower', 'External plaster and concrete repairs', 'Repair of decorative facade elements', 'Exterior repainting with branded paints'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'prestige-park-chs', title: 'Prestige Park CHS', category: 'Repair & Repainting', location: 'Thane, Maharashtra', value: '₹1 Crore',
    image: img('project-prestige-park-1'), alt: 'Prestige Park CHS in Thane during exterior repainting',
    description: 'External repair and repainting of a multistorey residential society in Thane, with the facade finished in a two-tone colour scheme.',
    gallery: [img('project-prestige-park-1'), img('project-prestige-park-2')], service: 'external-painting', video: 'project-prestige-park',
    scope: ['External plaster and crack repairs', 'Surface preparation and primer', 'Weatherproof exterior repainting', 'Two-tone facade colour scheme'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'sukur-enclave', title: 'Sukur Enclave', category: 'Rehabilitation', location: 'Thane, Maharashtra', value: '₹25+ Lakhs',
    image: img('project-sukur-enclave-1'), alt: 'Sukur Enclave in Thane under scaffolding with fresh external plaster',
    description: 'External repair and replastering of a residential building in Thane, carried out from full-height scaffolding.',
    gallery: [img('project-sukur-enclave-1'), img('project-sukur-enclave-2')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Full-height scaffolding', 'Removal of damaged plaster', 'External replastering', 'Preparation for protective coating'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'sunshine-chs', title: 'Sunshine CHS', category: 'Rehabilitation', location: 'Oshiwara, Mumbai', value: '₹75 Lakhs',
    image: img('project-sunshine-1'), alt: 'Sunshine CHS in Oshiwara under scaffolding during repair work',
    description: 'Repair and rehabilitation of a multistorey residential society in Oshiwara, executed from full-height scaffolding.',
    gallery: [img('project-sunshine-1')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Full-height scaffolding', 'External plaster and concrete repairs', 'Crack treatment', 'Exterior repainting'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'mahindra-park-chs', title: 'Mahindra Park CHS', category: 'Repair & Repainting', location: 'Ghatkopar, Mumbai', value: '₹1.50 Crore',
    image: img('project-mahindra-park-1'), alt: 'Mahindra Park CHS in Ghatkopar after repair and repainting of the clubhouse and tower',
    description: 'Repair and repainting of a residential complex in Ghatkopar, covering the high-rise tower and the clubhouse building.',
    gallery: [img('project-mahindra-park-1'), img('project-mahindra-park-2')], service: 'external-painting', video: '',
    scope: ['External repairs to the tower and clubhouse', 'Crack treatment and surface preparation', 'Exterior repainting with branded paints', 'Finishing of architectural features'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'neelkanth-nagar-chs', title: 'Neelkanth Nagar CHS', category: 'Repair & Repainting', location: 'Ghatkopar, Mumbai', value: '₹55 Lakhs',
    image: img('project-neelkanth-nagar-1'), alt: 'Neelkanth Nagar CHS in Ghatkopar before and after external repair and repainting',
    description: 'External repair and repainting of a residential society in Ghatkopar — the before-and-after shows a heavily stained facade restored to a clean finish.',
    gallery: [img('project-neelkanth-nagar-1')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['External plaster and crack repairs', 'Cleaning and surface preparation', 'Weatherproof exterior repainting'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'zelam-chs', title: 'Zelam CHS', category: 'Rehabilitation', location: 'Dadar, Mumbai', value: '₹25+ Lakhs',
    image: img('project-zelam-1'), alt: 'Zelam CHS in Dadar under scaffolding during repair work',
    description: 'External repair work on a residential society building in Dadar, carried out from full-height scaffolding.',
    gallery: [img('project-zelam-1')], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Full-height scaffolding', 'External plaster and concrete repairs', 'Exterior repainting'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'peace-haven-chs', title: 'Peace Haven CHS', category: 'Repair & Repainting', location: 'Chembur, Mumbai', value: '₹20+ Lakhs',
    image: img('project-peace-haven-3'), alt: 'Peace Haven CHS in Chembur after external repair and repainting',
    description: 'External repair and repainting of a residential building in Chembur, including its decorative facade mouldings and name signage.',
    gallery: [img('project-peace-haven-3'), img('project-peace-haven-1'), img('project-peace-haven-2')], service: 'external-painting', video: '',
    scope: ['External plaster and crack repairs', 'Restoration of facade mouldings', 'Exterior repainting with branded paints'],
    note: SOCIETY_NOTE,
  },
  {
    slug: 'building-rehabilitation', title: 'Residential Building Repair & Rehabilitation', category: 'Rehabilitation', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/scaffold.webp', alt: 'Residential building covered in scaffolding during repair work',
    description: 'Full-height scaffold access for exterior repair and rehabilitation of a residential building.',
    gallery: ['/images/optimized/scaffold.webp'], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Full-height scaffolding with safety netting', 'External plaster and RCC repairs', 'Crack treatment', 'Preparation for protective coating'],
    note: 'The photograph documents the site during work. Client name, completion date and detailed scope are not published.',
  },
  {
    slug: 'rcc-column-repair', title: 'RCC Column Repair', category: 'Structural Repair', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/repair.webp', alt: 'Before and after photographs of a repaired RCC column',
    description: 'Before-and-after record of a deteriorated RCC column with exposed reinforcement, restored by our team.',
    gallery: ['/images/optimized/repair.webp', '/images/optimized/inspection.webp'], service: 'structural-repairs-rehabilitation', video: '',
    scope: ['Removal of loose and carbonated concrete', 'Cleaning and treatment of corroded reinforcement', 'Rebuilding the section with repair mortar', 'Protective finish'],
    note: 'The photographs show exposed reinforcement and the repaired surfaces. The engineering assessment and material specifications are project-specific.',
  },
  {
    slug: 'building-exterior', title: 'Building Exterior Restoration', category: 'Repair & Repainting', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/completed.webp', alt: 'Completed multistorey residential building exterior',
    description: 'A completed residential building exterior from the company’s work photographs.',
    gallery: ['/images/optimized/completed.webp'], service: 'external-painting', video: '',
    scope: ['External repairs', 'Surface preparation', 'Exterior repainting'],
    note: 'Shown as a work photograph. The exact contracted scope and completion date are not published.',
  },
  {
    slug: 'concrete-investigation', title: 'Concrete Investigation & NDT', category: 'Testing', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-4.webp', alt: 'Engineers using concrete testing equipment on a staircase',
    description: 'On-site concrete investigation with testing equipment as part of a structural assessment.',
    gallery: ['/images/optimized/video-4.webp', '/images/optimized/video-11.webp'], service: 'ndt-structural-audit', video: 'work-4',
    scope: ['Visual inspection of structural members', 'Non-destructive testing on site', 'Recording of test locations', 'Findings for the structural audit report'],
    note: 'The footage documents activity on site. Test results and structural conclusions belong to the client report.',
  },
  {
    slug: 'column-jacketing', title: 'Column Jacketing & Strengthening', category: 'Structural Repair', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-3.webp', alt: 'New reinforcement cage fixed around a column for jacketing',
    description: 'Additional reinforcement and shuttering for RCC column jacketing on an existing building.',
    gallery: ['/images/optimized/video-3.webp', '/images/optimized/video-6.webp'], service: 'structural-repairs-rehabilitation', video: 'work-3',
    scope: ['Preparation of the existing column surface', 'Fixing additional reinforcement', 'Shuttering for the jacket', 'Concreting and curing'],
    note: 'Frames and footage are from the company’s own site videos. Design details depend on the structural assessment of each member.',
  },
  {
    slug: 'core-testing-work', title: 'Core Testing Work', category: 'Testing', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-10.webp', alt: 'Concrete core extracted from a column on site',
    description: 'Core cutting and extraction of concrete samples for laboratory strength testing.',
    gallery: ['/images/optimized/video-10.webp'], service: 'concrete-core-testing', video: 'work-10',
    scope: ['Selection of core locations', 'Core cutting and extraction', 'Laboratory compressive strength testing', 'Reinstatement of core holes'],
    note: 'Core sampling is intrusive; locations and reinstatement are planned as part of the investigation.',
  },
];

export type Video = {
  id: string; title: string; category: string; poster: string; description: string; duration: string; landscape?: boolean;
};

export const brandFilm: Video = {
  id: 'brand-film', title: 'Building ka Doctor — Our Story', category: 'Brand Film', poster: '/images/optimized/film-poster.webp', duration: '3:00', landscape: true,
  description: 'Two neighbours, two houses, one lesson: timely inspection and the right repair protect your building — and your savings. An animated story from M.M. Construction & Consults, with narration.',
};

export const videos: Video[] = [
  { id: 'work-3', title: 'Column Jacketing Work', category: 'Structural Repair', poster: '/images/optimized/video-3.webp', duration: '0:20', description: 'New reinforcement fixed around an existing column before jacketing.' },
  { id: 'work-10', title: 'Concrete Core Cutting', category: 'Testing', poster: '/images/optimized/video-10.webp', duration: '0:31', description: 'Core cutting machine extracting a concrete sample from a column.' },
  { id: 'work-31', title: 'Rebar Scanning (Cover Meter)', category: 'NDT', poster: '/images/optimized/video-31.webp', duration: '0:55', description: 'Locating reinforcement and concrete cover before investigation or repair.' },
  { id: 'work-6', title: 'Shuttering for Column Jacketing', category: 'Structural Repair', poster: '/images/optimized/video-6.webp', duration: '0:16', description: 'Formwork fixed around a column, ready for the jacketing concrete.' },
  { id: 'work-8', title: 'On-Site Concrete Testing', category: 'Testing', poster: '/images/optimized/video-8.webp', duration: '0:14', description: 'Engineer testing concrete at an inspection opening.' },
  { id: 'work-4', title: 'NDT Team at Work', category: 'NDT', poster: '/images/optimized/video-4.webp', duration: '0:19', description: 'Engineers investigating concrete with testing equipment.' },
  { id: 'work-24', title: 'Slab Distress Inspection', category: 'Inspection', poster: '/images/optimized/video-24.webp', duration: '0:46', description: 'Spalled slab soffit with corroded reinforcement, recorded before repair.' },
];

export const allVideos: Video[] = [brandFilm, ...videos];

// Short clips shown only on their project pages.
export const projectClips: Video[] = [
  { id: 'project-atharva-heights', title: 'Atharva Heights CHS — Site Clip', category: 'Repair & Repainting', poster: '/images/optimized/project-atharva-heights-video.webp', duration: '0:03', landscape: true, description: 'A short clip of the completed Atharva Heights CHS building in Virar.' },
  { id: 'project-hamza-tower', title: 'Hamza Tower — Site Clip', category: 'Rehabilitation', poster: '/images/optimized/project-hamza-tower-video.webp', duration: '0:02', description: 'Hamza Tower in Mazgaon under scaffolding during the works.' },
  { id: 'project-prestige-park', title: 'Prestige Park CHS — Site Walkthrough', category: 'Repair & Repainting', poster: '/images/optimized/project-prestige-park-video.webp', duration: '0:18', description: 'A walk around Prestige Park CHS in Thane during the exterior work.' },
];
