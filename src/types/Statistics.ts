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
    problems: Record<string, StatisticsResult>;
    more_fields: Record<string, any>;
}

export type StatisticsResult = ProblemResult | { 
    upsolving: UpsolvingResult;
}
export function isUpsolvingResult(result: any): result is { 
    upsolving: UpsolvingResult;
} {
    return result && result.upsolving
}
export interface ProblemResult {
    data_region: string;
    language: string;
    result: string;
    submission_id: number;
    time: string;
    time_in_seconds: number;
}
export interface UpsolvingResult {
    binary: boolean;
    result: string;
    submission_id: number;
    submission_time: number;
}
