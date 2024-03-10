export default interface Statistics {
    id: number;
    account_id: number;
    handle: string;
    contest_id: number;
    event: string;
    date: string;
    place: number;
    score: number;
    new_rating: number;
    old_rating: number;
    rating_change: number;
    problems: Record<string, StatisticsProblem>;
    more_fields: Record<string, any>;
}

export type StatisticsProblem = ContestProblem | { 
    upsolving: UpsolvingProblem;
}
export function isUpsolved(problem: any): problem is { 
    upsolving: UpsolvingProblem;
} {
    return problem && problem.upsolving
}
export interface ContestProblem {
    data_region: string;
    language: string;
    result: "+",
    submission_id: number;
    time: string;
    time_in_seconds: number;
}
export interface UpsolvingProblem {
    binary: boolean;
    result: string;
    submission_id: number;
    submission_time: number;
}
