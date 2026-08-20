export type Stages = 'applicant' | 'med_student' | 'resident' | 'mentor';

export interface NavItem { 
    id: string;
    label: string;
    href: string;
    stages: (Stages | '*')[];
    icon?: string;
}

export const CANONICAL_NAV: NavItem[] = [
    { id: 'home', label: 'Home', href: '/dashboard', stages: ['*'], icon: 'LayoutGrid'}, 
    { id: 'mentors', label: 'Mentors', href: '/mentors', stages: ['applicant', 'med_student', 'resident'], icon: 'Users'}, 
    { id: 'sessions', label: 'Sessions', href: '/sessions', stages: ['*'], icon: 'Video'},
    { id: 'messages', label: 'Messages', href: '/messages', stages: ['*'], icon: 'MessageSquare'},
    { id: 'keydates', label: 'Key Dates', href: '/keydates', stages: ['applicant'], icon: 'CalendarClock'}, 
    { id: 'checklist', label: 'Checklist', href: '/checklist', stages: ['applicant'], icon: 'ListChecks'},
    { id: 'finances', label: 'Finances', href: '/finances', stages: ['applicant', 'med_student', 'resident'], icon: 'PiggyBank'},
    { id: 'experience', label: 'Experience Log', href: '/experience', stages: ['applicant', 'med_student', 'resident'], icon: 'ClipboardCheck'},
    { id: 'portfolio', label: 'Portfolio', href: '/portfolio', stages: ['applicant', 'med_student', 'resident'], icon: 'ClipboardCheck'},
    { id: 'resources', label: 'Resources', href: '/resources', stages: ['applicant', 'med_student', 'resident'], icon: 'BookOpen'},
    { id: 'reflection', label: 'Reflection', href: '/gibbs', stages: ['applicant', 'med_student', 'resident'], icon: 'Feather'},
    { id: 'calendar', label: 'Calendar', href: '/calendar', stages: ['mentor'], icon: 'CalendarDays'},
    { id: 'earnings', label: 'Earnings', href: '/earnings', stages: ['mentor'], icon: 'Wallet'},
];  