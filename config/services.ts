// Service types that masters can offer
export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Gardening',
  'Roofing',
  'Flooring',
  'HVAC',
  'Appliance Repair',
  'Moving',
  'General Handyman',
  'Interior Design',
  'Landscaping',
  'Tiling',
  'Drywall',
  'Windows & Doors',
  'Other',
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];
