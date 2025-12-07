import { JobCategory, SofiaDistrict } from '../types';

// Job categories with labels and icons
export const JOB_CATEGORIES: { value: JobCategory; label: string; icon: string }[] = [
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
  { value: 'tiling', label: 'Tiling', icon: '🧱' },
  { value: 'carpentry', label: 'Carpentry', icon: '🪚' },
  { value: 'appliance_repair', label: 'Appliance Repair', icon: '🔌' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'other', label: 'Other', icon: '🛠️' },
];

// Sofia districts organized by area
export const SOFIA_DISTRICTS: { value: SofiaDistrict; label: string }[] = [
  { value: 'Center', label: 'Center' },
  { value: 'Lozenets', label: 'Lozenets' },
  { value: 'Oborishte', label: 'Oborishte' },
  { value: 'Iztok', label: 'Iztok' },
  { value: 'Geo Milev', label: 'Geo Milev' },
  { value: 'Reduta', label: 'Reduta' },
  { value: 'Slatina', label: 'Slatina' },
  { value: 'Mladost 1', label: 'Mladost 1' },
  { value: 'Mladost 2', label: 'Mladost 2' },
  { value: 'Mladost 3', label: 'Mladost 3' },
  { value: 'Mladost 4', label: 'Mladost 4' },
  { value: 'Studentski Grad', label: 'Studentski Grad' },
  { value: 'Druzhba 1', label: 'Druzhba 1' },
  { value: 'Druzhba 2', label: 'Druzhba 2' },
  { value: 'Lyulin 1', label: 'Lyulin 1' },
  { value: 'Lyulin 2', label: 'Lyulin 2' },
  { value: 'Lyulin 3', label: 'Lyulin 3' },
  { value: 'Lyulin 4', label: 'Lyulin 4' },
  { value: 'Lyulin 5', label: 'Lyulin 5' },
  { value: 'Lyulin 6', label: 'Lyulin 6' },
  { value: 'Lyulin 7', label: 'Lyulin 7' },
  { value: 'Lyulin 8', label: 'Lyulin 8' },
  { value: 'Lyulin 9', label: 'Lyulin 9' },
  { value: 'Lyulin 10', label: 'Lyulin 10' },
  { value: 'Nadezhda', label: 'Nadezhda' },
  { value: 'Poduyane', label: 'Poduyane' },
  { value: 'Hadji Dimitar', label: 'Hadji Dimitar' },
  { value: 'Banishora', label: 'Banishora' },
  { value: 'Ilinden', label: 'Ilinden' },
  { value: 'Krasna Polyana', label: 'Krasna Polyana' },
  { value: 'Svoboda', label: 'Svoboda' },
  { value: 'Vitosha', label: 'Vitosha' },
  { value: 'Krasno Selo', label: 'Krasno Selo' },
  { value: 'Ovcha Kupel', label: 'Ovcha Kupel' },
  { value: 'Manastirski Livadi', label: 'Manastirski Livadi' },
  { value: 'Borovo', label: 'Borovo' },
  { value: 'Boyana', label: 'Boyana' },
  { value: 'Dragalevtsi', label: 'Dragalevtsi' },
  { value: 'Simeonovo', label: 'Simeonovo' },
  { value: 'Other', label: 'Other' },
];

// Helper to get category label
export const getCategoryLabel = (category: JobCategory): string => {
  return JOB_CATEGORIES.find(c => c.value === category)?.label || category;
};

// Helper to get category icon
export const getCategoryIcon = (category: JobCategory): string => {
  return JOB_CATEGORIES.find(c => c.value === category)?.icon || '🛠️';
};

// Helper to get district label
export const getDistrictLabel = (district: SofiaDistrict): string => {
  return SOFIA_DISTRICTS.find(d => d.value === district)?.label || district;
};

// Job status labels with colors
export const JOB_STATUS_CONFIG = {
  open: { label: 'Open', color: '#22c55e', bgColor: '#dcfce7' },
  assigned: { label: 'Assigned', color: '#3b82f6', bgColor: '#dbeafe' },
  completed: { label: 'Completed', color: '#8b5cf6', bgColor: '#ede9fe' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' },
};
