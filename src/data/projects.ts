export type Project = {
  slug: string; title: string; category: string; location: string; image: string; alt: string;
  description: string; gallery: string[]; service: string; video: string; note: string;
};

export const projects: Project[] = [
  {
    slug: 'building-rehabilitation', title: 'Residential Building Repair & Rehabilitation', category: 'Rehabilitation', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/scaffold.webp', alt: 'Residential building covered in scaffolding during repair work',
    description: 'Full-height scaffold access for exterior repair and rehabilitation of a residential building.',
    gallery: ['/images/optimized/scaffold.webp'], service: 'structural-repairs-rehabilitation', video: '',
    note: 'The photograph documents the site during work. Client name, completion date and detailed scope are not published.',
  },
  {
    slug: 'rcc-column-repair', title: 'RCC Column Repair', category: 'Structural Repair', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/repair.webp', alt: 'Before and after photographs of a repaired RCC column',
    description: 'Before-and-after record of a deteriorated RCC column with exposed reinforcement, restored by our team.',
    gallery: ['/images/optimized/repair.webp', '/images/optimized/inspection.webp'], service: 'structural-repairs-rehabilitation', video: '',
    note: 'The photographs show exposed reinforcement and the repaired surfaces. The engineering assessment and material specifications are project-specific.',
  },
  {
    slug: 'building-exterior', title: 'Building Exterior Restoration', category: 'Exterior Work', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/completed.webp', alt: 'Completed multistorey residential building exterior',
    description: 'A completed residential building exterior from the company’s work photographs.',
    gallery: ['/images/optimized/completed.webp'], service: 'external-painting', video: '',
    note: 'Shown as a work photograph. The exact contracted scope and completion date are not published.',
  },
  {
    slug: 'concrete-investigation', title: 'Concrete Investigation & NDT', category: 'Testing', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-4.webp', alt: 'Engineers using concrete testing equipment on a staircase',
    description: 'On-site concrete investigation with testing equipment as part of a structural assessment.',
    gallery: ['/images/optimized/video-4.webp', '/images/optimized/video-11.webp'], service: 'ndt-structural-audit', video: 'work-4',
    note: 'The footage documents activity on site. Test results and structural conclusions belong to the client report.',
  },
  {
    slug: 'column-jacketing', title: 'Column Jacketing & Strengthening', category: 'Structural Repair', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-3.webp', alt: 'New reinforcement cage fixed around a column for jacketing',
    description: 'Additional reinforcement and shuttering for RCC column jacketing on an existing building.',
    gallery: ['/images/optimized/video-3.webp', '/images/optimized/video-6.webp'], service: 'structural-repairs-rehabilitation', video: 'work-3',
    note: 'Frames and footage are from the company’s own site videos. Design details depend on the structural assessment of each member.',
  },
  {
    slug: 'core-testing-work', title: 'Core Testing Work', category: 'Testing', location: 'Mumbai, Maharashtra',
    image: '/images/optimized/video-10.webp', alt: 'Concrete core extracted from a column on site',
    description: 'Core cutting and extraction of concrete samples for laboratory strength testing.',
    gallery: ['/images/optimized/video-10.webp'], service: 'concrete-core-testing', video: 'work-10',
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
