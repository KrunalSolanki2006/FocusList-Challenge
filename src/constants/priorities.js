export const PRIORITY_NONE = 'none';
export const PRIORITY_LOW = 'low';
export const PRIORITY_MEDIUM = 'medium';
export const PRIORITY_HIGH = 'high';

export const PRIORITY_CONFIG = {
  [PRIORITY_NONE]: {
    label: 'None',
    weight: 0,
    color: 'var(--text-muted)'
  },
  [PRIORITY_LOW]: {
    label: 'Low',
    weight: 1,
    color: 'var(--text-muted)'
  },
  [PRIORITY_MEDIUM]: {
    label: 'Medium',
    weight: 2,
    color: '#D97706'
  },
  [PRIORITY_HIGH]: {
    label: 'High',
    weight: 3,
    color: 'var(--accent)'
  }
};
