export default interface Contest {
    id: number;
    resource: string;
    resource_id: number;
    host: string;
    event: string;
    start: string;
    end: string;
    n_statistics: number;
    n_problems: number;
    parsed_at: string;
    duration: string;
    href: string;
    problems: ContestProblem[];
}
interface ContestProblem {
    code: number;
    difficulty: 'easy' | 'medium' | 'hard';
    first_ac: {
        accounts: string[];
        in_seconds: number;
        time: string;
    },
    full_score: number;
    hints: string[];
    n_accepted: number;
    n_teams: number;
    n_total: number;
    name: string;
    rating: number;
    short: string;
    slug: string;
    tags: string[];
    url: string;
    writers: string[];
}
