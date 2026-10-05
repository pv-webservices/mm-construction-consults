export type Service = {
  slug: string; title: string; short: string; description: string;
  icon: string; image: string; alt: string; points: string[];
  category: string; problems: string[]; scope: string[]; benefits: string[];
};
export const services: Service[] = [
  {
    slug: 'ndt-structural-audit', title: 'NDT & Structural Audit', icon: 'scan-line', category: 'Assessment', image: '/images/optimized/ndt-upv.webp', alt: 'Engineer performing ultrasonic pulse velocity testing on a concrete column', points: ['Ultrasonic Pulse Velocity (UPV)', 'Rebound Hammer Test', 'Core Test / Inspection'],
    short: 'Understand your building before deciding what comes next.',
    description: 'A structured assessment brings together visual observations, available building information, and selected tests. The aim is to understand the condition of the structure and inform appropriate repair or maintenance decisions.',
    problems: ['Visible cracking or deterioration', 'Uncertainty about concrete condition', 'Planning repairs to an existing structure'],
    scope: ['Visual survey and photographic records', 'Selection of suitable test locations', 'UPV and rebound hammer testing where appropriate', 'Findings, limitations, and recommendations'],
    benefits: ['A clearer picture of the building condition', 'Evidence to inform repair priorities', 'A documented basis for the next stage'],
  },
  {
    slug: 'structural-repairs-rehabilitation', title: 'Structural Repairs & Rehabilitation', icon: 'construction', category: 'Repair', image: '/images/optimized/repair.webp', alt: 'Actual M.M. Construction column repair: before and after', points: ['RCC Repairs', 'Concrete Repair', 'Wall & Slab Repairs'],
    short: 'Repair deteriorated concrete and give existing structures a considered path forward.',
    description: 'Structural rehabilitation starts with understanding why damage has occurred. Repair work may address deteriorated RCC elements, exposed reinforcement, cracks, and local damage to columns, beams, walls, or slabs, subject to the assessment and agreed scope.',
    problems: ['Spalling or damaged concrete', 'Exposed reinforcement', 'Cracks in RCC elements', 'Ageing building components'],
    scope: ['Condition assessment and repair planning', 'Removal of unsound material', 'Preparation of affected surfaces and reinforcement', 'Concrete repairs and protective finishing'],
    benefits: ['An approach suited to the existing structure', 'Attention to preparation and underlying causes', 'Coordinated repairs with clear scope'],
  },
  {
    slug: 'cf-wrapping-strengthening', title: 'CF Wrapping / Strengthening', icon: 'layers', category: 'Strengthening', image: '/images/optimized/cf-wrapping.webp', alt: 'Workers applying carbon-fibre wrap to a concrete column', points: ['Columns & Beams', 'Seismic Strengthening', 'Load Capacity Enhancement'],
    short: 'Strengthening options tailored to assessed structural requirements.',
    description: 'Carbon-fibre wrapping is one of the techniques used in structural strengthening. The choice of system, member preparation, and detailing depend on the engineering assessment. Suitability must be established for the individual structure.',
    problems: ['Members identified as needing strengthening', 'Changes in structural requirements', 'Repair and rehabilitation planning'],
    scope: ['Review of the strengthening requirement', 'Assessment of member and substrate condition', 'Preparation and application to the specified design', 'Work documentation and completion review'],
    benefits: ['A solution based on the member and its requirements', 'Integration with the wider rehabilitation plan', 'Defined application and inspection stages'],
  },
  {
    slug: 'waterproofing', title: 'Waterproofing', icon: 'droplets', category: 'Protection', image: '/images/optimized/waterproofing.webp', alt: 'Applicator coating the inside of a concrete water tank with waterproofing', points: ['Terrace Waterproofing', 'Basement Waterproofing', 'Tank / Sump Waterproofing'],
    short: 'Find the source of water ingress and protect vulnerable building areas.',
    description: 'Waterproofing is most effective when the source of moisture is understood. We review affected surfaces, junctions, drainage, and existing treatments to define a suitable scope for terraces, basements, tanks, sumps, and other exposed areas.',
    problems: ['Water ingress and seepage', 'Damp internal surfaces', 'Failed coatings or vulnerable joints'],
    scope: ['Inspection of affected and surrounding areas', 'Surface preparation and local repairs', 'Application of the agreed waterproofing treatment', 'Review of junctions and drainage details'],
    benefits: ['Focus on the source of the problem', 'Treatment matched to the affected area', 'Practical maintenance guidance'],
  },
  {
    slug: 'terrace-waterproofing', title: 'Terrace Waterproofing', icon: 'house', category: 'Protection', image: '/images/optimized/terrace-waterproofing.webp', alt: 'Waterproofing membrane being laid on a Mumbai terrace', points: ['Heat Resistant Coating', 'Crack Filling', 'Long Term Protection'],
    short: 'Protect the roof, its junctions, and the spaces beneath it.',
    description: 'An exposed terrace needs a coordinated approach to surface condition, cracks, outlets, and junctions. The treatment is selected after reviewing the roof and existing waterproofing, with the scope and access requirements explained before work begins.',
    problems: ['Leakage from the terrace', 'Cracked or weathered roof surfaces', 'Water accumulation around outlets'],
    scope: ['Terrace and drainage inspection', 'Crack and junction preparation', 'Application of the selected treatment', 'Finish and drainage review'],
    benefits: ['Attention to the full terrace system', 'Defined surface preparation', 'Protection planned around existing conditions'],
  },
  {
    slug: 'external-painting', title: 'External Painting', icon: 'paint-roller', category: 'Protection', image: '/images/optimized/external-painting.webp', alt: 'Painters on scaffolding repainting a residential building facade', points: ['Building Facade Painting', 'Weatherproof Coating', 'Long Lasting Finish'],
    short: 'A considered exterior finish starts with careful surface preparation.',
    description: 'External painting combines appearance with protection of the building envelope. The work begins with a review of the façade, local defects, access needs, and suitable coatings rather than simply covering an existing surface.',
    problems: ['Weathered or peeling exterior paint', 'Local surface defects', 'An exterior in need of refurbishment'],
    scope: ['Façade condition review', 'Cleaning and surface preparation', 'Local repairs and primer where specified', 'Exterior coating and finish review'],
    benefits: ['A refreshed building exterior', 'Preparation suited to the existing surface', 'An agreed coating and colour scope'],
  },
  {
    slug: 'plumbing-drainage', title: 'Plumbing & Drainage', icon: 'pipette', category: 'Maintenance', image: '/images/optimized/plumbing-drainage.webp', alt: 'Plumber fixing drainage pipes on a building duct wall', points: ['Water Supply Lines', 'Rainwater Drainage', 'Sewerage & Waste Lines'],
    short: 'Practical repairs to building water supply and drainage systems.',
    description: 'Plumbing and drainage work addresses leaks, damaged lines, and drainage concerns that can affect daily use and building condition. Assessment helps separate pipe-related problems from waterproofing or other building defects.',
    problems: ['Leaking or damaged water lines', 'Rainwater drainage concerns', 'Waste and sewage line repairs'],
    scope: ['Review of affected lines and access', 'Repair or replacement of agreed sections', 'Junction and connection checks', 'Testing of completed work where appropriate'],
    benefits: ['A defined repair scope', 'Coordination with associated building work', 'Attention to access and maintainability'],
  },
  {
    slug: 'paver-work', title: 'Paver Work & Compound Development', icon: 'grid-2x2', category: 'Maintenance', image: '/images/optimized/paver-work.webp', alt: 'Workers laying interlocking paver blocks in a society compound', points: ['Interlocking Paver Blocks', 'Driveways & Walkways', 'Compound Area Development'],
    short: 'Make walkways and compound areas practical, neat, and usable.',
    description: 'Paver and compound work considers the intended use of the area, the condition of the base, and drainage. Driveways, walkways, and shared outdoor spaces are planned around access, levels, and the agreed finish.',
    problems: ['Uneven or damaged paved areas', 'Compound areas requiring improvement', 'Poor surface drainage or access'],
    scope: ['Review of levels, use, and drainage', 'Base preparation to the agreed scope', 'Paver layout and installation', 'Edge, junction, and finish review'],
    benefits: ['More usable shared outdoor areas', 'An organised approach to levels and finish', 'Layout suited to the space'],
  },
  {
    slug: 'visual-inspection-documentation', title: 'Visual Inspection & Documentation', icon: 'clipboard-check', category: 'Assessment', image: '/images/optimized/inspection.webp', alt: 'Actual repair-site condition documented by M.M. Construction', points: ['Condition Survey', 'Photographic Records', 'Recommendations Report'],
    short: 'Turn visible observations into a clear record of building condition.',
    description: 'A visual inspection records accessible defects, their locations, and relevant site conditions. Photographs and observations help communicate the issues and establish whether further investigation or testing is needed.',
    problems: ['Building defects requiring a record', 'Unclear repair priorities', 'Need for a pre-work condition survey'],
    scope: ['Accessible-area visual inspection', 'Photographic condition records', 'Description and location of visible concerns', 'Recommendations for further assessment'],
    benefits: ['Clearer communication of visible defects', 'A useful record for repair planning', 'Transparent inspection limitations'],
  },
  {
    slug: 'concrete-core-testing', title: 'Concrete / Core Testing', icon: 'drill', category: 'Assessment', image: '/images/optimized/core-testing.webp', alt: 'Technician extracting a concrete core sample with a core cutting machine', points: ['Core Extraction', 'Compressive Strength Testing', 'Reinstatement of Core Holes'],
    short: 'Targeted concrete sampling to support a wider assessment.',
    description: 'Core sampling provides concrete specimens for testing when the assessment requires more direct material information. Unlike NDT, extracting a core is intrusive. Sampling locations and reinstatement need to be planned carefully.',
    problems: ['A need for direct concrete material information', 'Questions requiring sampling alongside NDT', 'Assessment of existing concrete'],
    scope: ['Review of sampling need and locations', 'Checks to avoid reinforcement where appropriate', 'Core extraction and testing coordination', 'Documentation and local reinstatement'],
    benefits: ['Material evidence to complement other observations', 'Planned sampling rather than arbitrary drilling', 'Results interpreted within the overall assessment'],
  },
];
export const tests = [
  { icon: 'activity', title: 'Ultrasonic Pulse Velocity', short: 'UPV', text: 'Measures the travel of an ultrasonic pulse through concrete to help assess uniformity and investigate possible defects.', image: '/images/optimized/ndt-upv.webp' },
  { icon: 'hammer', title: 'Rebound Hammer Test', short: 'Surface assessment', text: 'Provides an indication of surface hardness. Strength estimates require suitable correlation and assessment of test conditions.', image: '/images/optimized/rebound.webp' },
  { icon: 'drill', title: 'Core Testing & Sampling', short: 'Material investigation', text: 'Uses extracted concrete specimens for material testing. This is an intrusive technique that complements NDT where required.', image: '/images/optimized/core-testing.webp' },
  { icon: 'thermometer', title: 'Thermal Imaging', short: 'Infrared inspection', text: 'Records surface temperature patterns that can help investigate moisture-related or other anomalies under suitable conditions.', image: '/images/optimized/thermal.webp' },
  { icon: 'radar', title: 'Cover Meter / Rebar Detection', short: 'Reinforcement location', text: 'Helps locate reinforcement and estimate concrete cover before investigation or repair. Results depend on site conditions.', image: '/images/optimized/video-31.webp' },
  { icon: 'clipboard-check', title: 'Visual Inspection', short: 'Site documentation', text: 'Records accessible defects and photographic observations to support further investigation and repair planning.', image: '/images/optimized/inspection.webp' },
];

// Homepage "Advanced testing" cards. Most photographs are frames from the company's own site videos.
export const assessments = [
  { icon: 'scan-line', title: 'Detailed NDT Assessment', text: 'Advanced instruments for an accurate picture of structural condition.', image: '/images/optimized/video-11.webp', alt: 'M.M. Construction technician testing a concrete wall on site', href: '/ndt-services' },
  { icon: 'drill', title: 'Core Sampling & Analysis', text: 'Reliable testing to assess concrete strength and quality.', image: '/images/optimized/video-10.webp', alt: 'Concrete core extracted on an M.M. Construction site', href: '/services/concrete-core-testing' },
  { icon: 'clipboard-check', title: 'On-Site Inspection & Reporting', text: 'Thorough documentation with clear, actionable recommendations.', image: '/images/optimized/video-8.webp', alt: 'Engineer testing concrete at an inspection opening', href: '/services/visual-inspection-documentation' },
  { icon: 'thermometer', title: 'Structural Health Evaluation', text: 'Identify critical issues before they become major problems.', image: '/images/optimized/thermal.webp', alt: 'Thermal imaging camera showing a heat map of a wall', href: '/services/ndt-structural-audit' },
  { icon: 'construction', title: 'Customised Repair Solutions', text: 'Tailored methods such as column jacketing for long-lasting results.', image: '/images/optimized/video-6.webp', alt: 'Shuttering for column jacketing on an M.M. Construction site', href: '/services/structural-repairs-rehabilitation' },
  { icon: 'badge-check', title: 'Quality Assurance & Support', text: 'Continuous guidance for a safer, stronger tomorrow.', image: '/images/optimized/video-23.webp', alt: 'Column strengthened with carbon-fibre wrapping on site', href: '/services/cf-wrapping-strengthening' },
];
