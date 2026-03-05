export interface RiasecActivity {
    id: string;
    text: string;
    code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
    icon?: string;
}

export const RIASEC_ACTIVITIES: RiasecActivity[] = [
    // Realistic (R) - The Doers
    { id: 'r1', text: 'Fixing mechanical things or electronics', code: 'R' },
    { id: 'r2', text: 'Working outdoors or with animals', code: 'R' },
    { id: 'r3', text: 'Operating machinery or using tools', code: 'R' },

    // Investigative (I) - The Thinkers
    { id: 'i1', text: 'Solving complex math or science problems', code: 'I' },
    { id: 'i2', text: 'Conducting research or experiments', code: 'I' },
    { id: 'i3', text: 'Analyzing data to find patterns', code: 'I' },

    // Artistic (A) - The Creators
    { id: 'a1', text: 'Creating music, art, or film', code: 'A' },
    { id: 'a2', text: 'Writing stories or poetry', code: 'A' },
    { id: 'a3', text: 'Designing websites or graphics', code: 'A' },

    // Social (S) - The Helpers
    { id: 's1', text: 'Teaching or mentoring others', code: 'S' },
    { id: 's2', text: 'Helping people solve their problems', code: 'S' },
    { id: 's3', text: 'Working in a team to achieve a goal', code: 'S' },

    // Enterprising (E) - The Persuaders
    { id: 'e1', text: 'Starting a business or leading a project', code: 'E' },
    { id: 'e2', text: 'Selling products or ideas to people', code: 'E' },
    { id: 'e3', text: 'Managing a team or organization', code: 'E' },

    // Conventional (C) - The Organizers
    { id: 'c1', text: 'Organizing records or documents', code: 'C' },
    { id: 'c2', text: 'Managing budgets or financial data', code: 'C' },
    { id: 'c3', text: 'Following clear procedures and systems', code: 'C' }
];

export const RIASEC_LABELS: Record<string, string> = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional'
};

export interface CareerValue {
    id: string;
    text: string;
    description: string;
    icon?: string;
}

export const CAREER_VALUES: CareerValue[] = [
    { id: 'v1', text: 'Autonomy', description: 'Freedom to choose how and when you work' },
    { id: 'v2', text: 'Stability', description: 'Secure income and predictable work hours' },
    { id: 'v3', text: 'Impact', description: 'Making a difference in society or others lives' },
    { id: 'v4', text: 'Creativity', description: 'Expressing yourself and inventing new things' },
    { id: 'v5', text: 'High Income', description: 'Prioritizing strong financial rewards' },
    { id: 'v6', text: 'Work-Life Balance', description: 'Ample time for family and personal life' },
    { id: 'v7', text: 'Leadership', description: 'Leading others and taking responsibility' }
];

export const CONTEXTUAL_CONSTRAINTS = [
    { id: 'c1', text: 'Remote Work Only', category: 'geography' },
    { id: 'c2', text: 'Requires Scholarship/Aid', category: 'financial' },
    { id: 'c3', text: 'Local Opportunities Only', category: 'geography' },
    { id: 'c4', text: 'Part-time Study Required', category: 'time' }
];
