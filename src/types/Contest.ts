export default interface Contest<T> {
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
    problems?: T;
}

export type LCContest = Contest<LCContestProblem[]>;

export type CCDiv = 'div_1' | 'div_2' | 'div_3' | 'div_4';
export type CCContest = Contest<{
    division: Record<CCDiv, CCContestProblem[]>;
    divisions_order: CCDiv[];
    n_statistics: Record<CCDiv, number>;
}>;

export interface ContestProblem {
    code: string | number;
    n_accepted: number;
    n_teams: number;
    n_total: number;
    name: string;
    rating: number;
    short: string;
    url: string;
    writers: string[];
}

export interface LCContestProblem extends ContestProblem {
    code: number;
    difficulty: 'easy' | 'medium' | 'hard';
    first_ac: {
        accounts: string[];
        in_seconds: number;
        time: string;
    },
    full_score: number;
    hints: string[];
    slug: string;
    tags: string[];
}

export interface CCContestProblem extends ContestProblem {
    code: string;
    // parsed from Contest
    divisions?: CCDiv[];
}

export function isCCContestProblem(problem: any): problem is CCContestProblem {
    return problem.divisions;
}
