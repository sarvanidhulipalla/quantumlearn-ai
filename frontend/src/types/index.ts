export * from './auth';
export * from './course';
export * from './circuit';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  phaseRequired?: number;
}
